import type { PageServerLoad } from './$types';

// Discovery data is loaded by the parent layout.
// This file is kept for SvelteKit route recognition.
export const load: PageServerLoad = async () => {
	return {};
};
