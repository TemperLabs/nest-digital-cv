import { randomUUID } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

interface Resume {
  name: string;
  about: string;
  companies: { name: string; period: string }[];
  projects: { name: string; description: string; url?: string; company?: string }[];
  skills: string[];
}

function args(): { slug: string; input: string } {
  const flags = new Map<string, string>();
  for (let i = 2; i < process.argv.length; i += 2) {
    const key = process.argv[i];
    const value = process.argv[i + 1];
    if (!['--slug', '--input'].includes(key) || !value || value.startsWith('--') || flags.has(key)) {
      throw new Error('Usage: npm run cv:init -- --slug my-slug --input ./resume.json');
    }
    flags.set(key, value);
  }
  const slug = flags.get('--slug');
  const input = flags.get('--input');
  if (!slug || !input || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Specify --input and a lowercase, hyphenated --slug');
  }
  return { slug, input };
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
function parseResume(value: unknown): Resume {
  if (!record(value) || !nonempty(value.name) || !nonempty(value.about)) throw new Error('name and about must be nonempty strings');
  const companies = value.companies ?? [];
  const projects = value.projects ?? [];
  const skills = value.skills ?? [];
  if (!Array.isArray(companies) || !companies.every(v => record(v) && nonempty(v.name) && nonempty(v.period))) throw new Error('Invalid companies');
  if (!Array.isArray(projects) || !projects.every(v => record(v) && nonempty(v.name) && nonempty(v.description) && (v.url === undefined || typeof v.url === 'string') && (v.company === undefined || nonempty(v.company)))) throw new Error('Invalid projects');
  if (!Array.isArray(skills) || !skills.every(nonempty)) throw new Error('Invalid skills');
  const companyNames = companies.map(v => v.name);
  if (new Set(companyNames).size !== companyNames.length || new Set(skills).size !== skills.length) throw new Error('Duplicate company or skill');
  if (projects.some(v => v.company && !companyNames.includes(v.company))) throw new Error('Project refers to an unknown company');
  return { name: value.name, about: value.about, companies, projects, skills } as Resume;
}

async function main(): Promise<void> {
  const { slug, input } = args();
  const resume = parseResume(JSON.parse(await readFile(resolve(input), 'utf8')) as unknown);
  const dir = resolve('src/migrations');
  const marker = `InitCv_${slug.replaceAll('-', '_')}_`;
  if ((await readdir(dir)).some(name => name.includes(marker))) throw new Error(`Migration for ${slug} already exists`);
  const timestamp = Date.now();
  const className = `${marker}${timestamp}`;
  const profileId = randomUUID();
  const companyIds = new Map(resume.companies.map(c => [c.name, randomUUID()]));
  const lines: string[] = [];
  const insert = (sql: string, params: unknown[]) => lines.push(`    await queryRunner.query(${JSON.stringify(sql)}, ${JSON.stringify(params)});`);
  insert('INSERT INTO profiles (id, slug, name, about) VALUES ($1, $2, $3, $4)', [profileId, slug, resume.name, resume.about]);
  for (const company of resume.companies) insert('INSERT INTO companies (id, profile_id, name, period) VALUES ($1, $2, $3, $4)', [companyIds.get(company.name), profileId, company.name, company.period]);
  for (const project of resume.projects) insert('INSERT INTO projects (id, profile_id, company_id, name, description, url) VALUES ($1, $2, $3, $4, $5, $6)', [randomUUID(), profileId, project.company ? companyIds.get(project.company) : null, project.name, project.description, project.url ?? null]);
  for (const skill of resume.skills) insert('INSERT INTO skills (id, profile_id, name) VALUES ($1, $2, $3)', [randomUUID(), profileId, skill]);
  const source = `import { MigrationInterface, QueryRunner } from 'typeorm';\n\nexport class ${className} implements MigrationInterface {\n  async up(queryRunner: QueryRunner): Promise<void> {\n${lines.join('\n')}\n  }\n\n  async down(queryRunner: QueryRunner): Promise<void> {\n    await queryRunner.query('DELETE FROM profiles WHERE id = $1', [${JSON.stringify(profileId)}]);\n  }\n}\n`;
  const file = resolve(dir, `${timestamp}-${className}.ts`);
  await writeFile(file, source, { flag: 'wx' });
  console.log(`Created ${file}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
