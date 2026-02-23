import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getChallengeReviews } from '@migration-planner/db';

export const load: PageServerLoad = async ({ params }) => {
	const reviews = await getChallengeReviews(db(), params.id, 'refine');
	return { reviews, step: 'refine' as const };
};
