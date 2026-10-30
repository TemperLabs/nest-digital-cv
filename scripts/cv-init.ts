import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type Link = { label: string; url: string };
type Job = { company: string; position: string; period: string; achievements: string[] };
type Project = { name: string; description?: string; url: string };
type Resume = { name: string; description: string; links: Link[]; skills: string[]; experience: Job[]; projects: Project[] };

function args(): { slug: string; input: string } {
  const flags = new Map<string, string>();
  for (let i = 2; i < process.argv.length; i += 2) {
    const key = process.argv[i], value = process.argv[i + 1];
    if (!['--slug', '--input'].includes(key) || !value || value.startsWith('--') || flags.has(key)) {
      throw new Error('Usage: npm run cv:init -- --slug my-slug --input ./resume.json');
    }
    flags.set(key, value);
  }
  const slug = flags.get('--slug'), input = flags.get('--input');
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
function url(value: unknown): value is string {
  if (!nonempty(value)) return false;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}
function parseResume(value: unknown): Resume {
  if (!record(value) || !nonempty(value.name) || !nonempty(value.description)) throw new Error('name and description must be nonempty strings');
  const { links, skills, experience, projects } = value;
  if (!Array.isArray(links) || !links.every(v => record(v) && nonempty(v.label) && url(v.url))) throw new Error('Invalid links');
  if (!Array.isArray(skills) || !skills.every(nonempty) || new Set(skills).size !== skills.length) throw new Error('Invalid or duplicate skills');
  if (!Array.isArray(experience) || !experience.every(v => record(v) && nonempty(v.company) && nonempty(v.position) && nonempty(v.period) && Array.isArray(v.achievements) && v.achievements.every(nonempty))) throw new Error('Invalid experience');
  if (!Array.isArray(projects) || !projects.every(v => record(v) && nonempty(v.name) && (v.description === undefined || typeof v.description === 'string') && url(v.url))) throw new Error('Invalid projects');
  return value as Resume;
}

function sql(value: string | null): string {
  return value === null ? 'NULL' : `'${value.replaceAll("'", "''")}'`;
}
function insert(table: string, columns: string[], values: (string | null)[]): string {
  return `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.map(sql).join(', ')});`;
}

async function main(): Promise<void> {
  const { slug, input } = args();
  const resume = parseResume(JSON.parse(await readFile(resolve(input), 'utf8')) as unknown);
  const root = resolve('prisma/migrations');
  if ((await readdir(root)).some(name => name.endsWith(`_init_cv_${slug}`))) throw new Error(`Migration for ${slug} already exists`);
  const profileId = randomUUID();
  const statements = [insert('Profile', ['id', 'slug', 'name', 'description'], [profileId, slug, resume.name, resume.description])];
  for (const link of resume.links) statements.push(insert('ProfessionalLink', ['id', 'profileId', 'label', 'url'], [randomUUID(), profileId, link.label, link.url]));
  for (const skill of resume.skills) statements.push(insert('Skill', ['id', 'profileId', 'name'], [randomUUID(), profileId, skill]));
  for (const job of resume.experience) {
    const id = randomUUID();
    statements.push(insert('Experience', ['id', 'profileId', 'company', 'position', 'period'], [id, profileId, job.company, job.position, job.period]));
    for (const achievement of job.achievements) statements.push(insert('Achievement', ['id', 'experienceId', 'description'], [randomUUID(), id, achievement]));
  }
  for (const project of resume.projects) statements.push(insert('Project', ['id', 'profileId', 'name', 'description', 'url'], [randomUUID(), profileId, project.name, project.description ?? null, project.url]));
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const dir = resolve(root, `${timestamp}_init_cv_${slug}`);
  await mkdir(dir);
  await writeFile(resolve(dir, 'migration.sql'), `-- Generated demo CV data migration for ${slug}\n${statements.join('\n')}\n`, { flag: 'wx' });
  console.log(`Created ${dir}/migration.sql`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
