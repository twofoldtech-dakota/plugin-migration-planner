<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';

	interface Props {
		open: boolean;
		item?: {
			id?: number;
			type: string;
			title: string;
			description: string;
			hours: number;
			role: string | null;
			priority: string;
			confidence: string;
			labels: string[];
			acceptance_criteria: string[];
		} | null;
		snapshotId?: number;
		parentId?: number | null;
		onclose: () => void;
		onsave: (item: any) => void;
	}

	let { open, item, snapshotId, parentId, onclose, onsave }: Props = $props();

	let form = $state({
		type: 'story',
		title: '',
		description: '',
		hours: 0,
		role: '',
		priority: 'medium',
		confidence: 'medium',
		labels: '',
		acceptance_criteria: '',
	});

	let saving = $state(false);

	$effect(() => {
		if (item) {
			form = {
				type: item.type,
				title: item.title,
				description: item.description,
				hours: item.hours,
				role: item.role ?? '',
				priority: item.priority,
				confidence: item.confidence,
				labels: (item.labels ?? []).join(', '),
				acceptance_criteria: (item.acceptance_criteria ?? []).join('\n'),
			};
		} else {
			form = {
				type: 'story',
				title: '',
				description: '',
				hours: 0,
				role: '',
				priority: 'medium',
				confidence: 'medium',
				labels: '',
				acceptance_criteria: '',
			};
		}
	});

	async function handleSave() {
		if (!form.title.trim()) return;
		saving = true;

		const payload = {
			type: form.type,
			title: form.title.trim(),
			description: form.description.trim(),
			hours: form.hours,
			role: form.role.trim() || null,
			priority: form.priority,
			confidence: form.confidence,
			labels: form.labels.split(',').map((s) => s.trim()).filter(Boolean),
			acceptance_criteria: form.acceptance_criteria.split('\n').map((s) => s.trim()).filter(Boolean),
		};

		if (item?.id) {
			// Update existing
			await fetch(`/api/planning/wbs/items/${item.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
		} else {
			// Create new
			await fetch('/api/planning/wbs/items', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					snapshot_id: snapshotId,
					parent_id: parentId ?? null,
					...payload,
				}),
			});
		}

		saving = false;
		onsave(payload);
	}

	const isNew = $derived(!item?.id);
</script>

<Modal {open} {onclose} title={isNew ? 'New Work Item' : 'Edit Work Item'}>
	<div class="space-y-4">
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Type</label>
				<select bind:value={form.type} class="w-full brutal-border-thin px-2 py-1.5 text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary">
					<option value="epic">Epic</option>
					<option value="feature">Feature</option>
					<option value="story">Story</option>
					<option value="task">Task</option>
					<option value="spike">Spike</option>
				</select>
			</div>
			<div>
				<label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Hours</label>
				<input type="number" bind:value={form.hours} min="0" step="0.5"
					class="w-full brutal-border-thin px-2 py-1.5 text-sm font-mono bg-bg focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
				/>
			</div>
		</div>

		<div>
			<label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Title</label>
			<input type="text" bind:value={form.title}
				class="w-full brutal-border-thin px-2 py-1.5 text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary"
				placeholder="Work item title"
			/>
		</div>

		<div>
			<label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Description</label>
			<textarea bind:value={form.description} rows="3"
				class="w-full brutal-border-thin px-2 py-1.5 text-sm font-mono bg-bg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
				placeholder="Optional description"
			></textarea>
		</div>

		<div class="grid grid-cols-3 gap-3">
			<div>
				<label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Role</label>
				<input type="text" bind:value={form.role}
					class="w-full brutal-border-thin px-2 py-1.5 text-sm font-mono bg-bg focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder="e.g. dba"
				/>
			</div>
			<div>
				<label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Priority</label>
				<select bind:value={form.priority} class="w-full brutal-border-thin px-2 py-1.5 text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary">
					<option value="critical">Critical</option>
					<option value="high">High</option>
					<option value="medium">Medium</option>
					<option value="low">Low</option>
				</select>
			</div>
			<div>
				<label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Confidence</label>
				<select bind:value={form.confidence} class="w-full brutal-border-thin px-2 py-1.5 text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-primary">
					<option value="high">High</option>
					<option value="medium">Medium</option>
					<option value="low">Low</option>
				</select>
			</div>
		</div>

		<div>
			<label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Labels <span class="font-normal">(comma-separated)</span></label>
			<input type="text" bind:value={form.labels}
				class="w-full brutal-border-thin px-2 py-1.5 text-sm font-mono bg-bg focus:outline-none focus:ring-2 focus:ring-primary"
				placeholder="e.g. phase, component"
			/>
		</div>

		<div>
			<label class="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-1">Acceptance Criteria <span class="font-normal">(one per line)</span></label>
			<textarea bind:value={form.acceptance_criteria} rows="3"
				class="w-full brutal-border-thin px-2 py-1.5 text-sm font-mono bg-bg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
				placeholder="One criterion per line"
			></textarea>
		</div>
	</div>

	{#snippet footer()}
		<div class="flex items-center justify-end gap-3">
			<button
				class="px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider brutal-border-thin
					bg-surface text-text-muted hover:bg-surface-raised transition-colors"
				onclick={onclose}
				disabled={saving}
			>Cancel</button>
			<button
				class="px-5 py-1.5 text-xs font-extrabold uppercase tracking-wider
					bg-primary text-white border-2 border-brutal shadow-[2px_2px_0_#000]
					hover:bg-primary-hover hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#000]
					active:translate-x-px active:translate-y-px active:shadow-none
					transition-all duration-100 disabled:opacity-50"
				onclick={handleSave}
				disabled={saving || !form.title.trim()}
			>
				{saving ? 'Saving...' : isNew ? 'Create' : 'Save'}
			</button>
		</div>
	{/snippet}
</Modal>
