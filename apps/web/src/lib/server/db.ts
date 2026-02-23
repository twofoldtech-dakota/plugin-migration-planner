import { getDb } from '@migration-planner/db';
import { env } from '$env/dynamic/private';

export const db = () => getDb(env.DATABASE_URL);
