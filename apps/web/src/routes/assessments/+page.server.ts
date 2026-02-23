import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { queryProjects } from '@migration-planner/db';

export const load: PageServerLoad = async () => {
	const { projects } = await queryProjects(db(), { limit: 100 });
	return { projects };
};
