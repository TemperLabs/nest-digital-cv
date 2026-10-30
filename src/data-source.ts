import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'node:path';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
});
