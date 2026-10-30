import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCvTables1761868800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE profiles (
      id uuid PRIMARY KEY, slug text NOT NULL UNIQUE, name text NOT NULL, about text NOT NULL
    )`);
    await queryRunner.query(`CREATE TABLE companies (
      id uuid PRIMARY KEY, profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      name text NOT NULL, period text NOT NULL
    )`);
    await queryRunner.query(`CREATE TABLE projects (
      id uuid PRIMARY KEY, profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
      name text NOT NULL, description text NOT NULL, url text
    )`);
    await queryRunner.query(`CREATE TABLE skills (
      id uuid PRIMARY KEY, profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      name text NOT NULL, UNIQUE(profile_id, name)
    )`);
    await queryRunner.query('CREATE INDEX companies_profile_idx ON companies(profile_id)');
    await queryRunner.query('CREATE INDEX projects_profile_idx ON projects(profile_id)');
    await queryRunner.query('CREATE INDEX skills_profile_idx ON skills(profile_id)');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE skills');
    await queryRunner.query('DROP TABLE projects');
    await queryRunner.query('DROP TABLE companies');
    await queryRunner.query('DROP TABLE profiles');
  }
}
