import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { dataSource } from './data-source';
import { Company, Profile, Project, Skill } from './cv.resolver';

@Injectable()
export class CvService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> { await dataSource.initialize(); }
  async onModuleDestroy(): Promise<void> { await dataSource.destroy(); }

  async getProfile(slug: string): Promise<Profile | null> {
    const profiles = await dataSource.query('SELECT id, slug, name, about FROM profiles WHERE slug = $1', [slug]) as Profile[];
    const profile = profiles[0];
    if (!profile) return null;
    const [companies, projects, skills] = await Promise.all([
      dataSource.query('SELECT id, name, period FROM companies WHERE profile_id = $1 ORDER BY name', [profile.id]) as Promise<Company[]>,
      dataSource.query('SELECT id, name, description, url, company_id AS "companyId" FROM projects WHERE profile_id = $1 ORDER BY name', [profile.id]) as Promise<Project[]>,
      dataSource.query('SELECT id, name FROM skills WHERE profile_id = $1 ORDER BY name', [profile.id]) as Promise<Skill[]>,
    ]);
    return { ...profile, companies, projects, skills };
  }
}
