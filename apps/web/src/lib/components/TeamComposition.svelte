<script lang="ts">
	interface TeamRole {
		id: number;
		role_id: string;
		role_name: string;
		total_hours: number;
		base_hours: number;
		headcount: number;
		allocation: string;
		seniority: string;
		rate_min: number;
		rate_max: number;
		rate_override: number | null;
		phases: any[];
		notes: string;
		source: string;
	}

	interface Props {
		roles: TeamRole[];
		snapshotId: number;
		onUpdate?: () => void;
	}

	let { roles, snapshotId, onUpdate }: Props = $props();

	let editingCell = $state<string | null>(null);
	let editValue = $state<string>('');

	const totalHours = $derived(roles.reduce((s, r) => s + r.total_hours, 0));
	const totalHeadcount = $derived(roles.reduce((s, r) => s + r.headcount, 0));
	const costLow = $derived(roles.reduce((s, r) => s + r.total_hours * r.rate_min, 0));
	const costHigh = $derived(roles.reduce((s, r) => s + r.total_hours * r.rate_max, 0));

	const allocationColors: Record<string, string> = {
		'full-time': 'bg-success-light text-success border-success',
		'part-time': 'bg-warning-light text-warning border-[#a16207]',
		contractor: 'bg-primary-light text-primary border-primary',
	};

	const seniorityColors: Record<string, string> = {
		senior: 'bg-[#faf5ff] text-[#7c3aed] border-[#7c3aed]',
		mid: 'bg-surface text-text-muted border-border-light',
		junior: 'bg-surface text-text-faint border-border-light',
	};

	function startEdit(roleId: number, field: string, value: any) {
		editingCell = `${roleId}-${field}`;
		editValue = String(value);
	}

	async function saveEdit(roleId: number, field: string) {
		const numFields = ['total_hours', 'headcount', 'rate_min', 'rate_max'];
		const val = numFields.includes(field) ? parseFloat(editValue) : editValue;

		await fetch(`/api/planning/team/roles/${roleId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ [field]: val }),
		});

		editingCell = null;
		onUpdate?.();
	}

	async function deleteRole(roleId: number) {
		await fetch(`/api/planning/team/roles/${roleId}`, { method: 'DELETE' });
		onUpdate?.();
	}

	async function addRole() {
		await fetch('/api/planning/team/roles', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				snapshot_id: snapshotId,
				role_id: 'new_role',
				role_name: 'New Role',
				total_hours: 0,
				headcount: 1,
			}),
		});
		onUpdate?.();
	}
</script>

<!-- Summary bar -->
<div class="brutal-border bg-surface px-4 py-2.5 flex items-center gap-5 flex-wrap mb-4">
	<div class="flex items-baseline gap-1.5">
		<span class="text-xl font-extrabold font-mono">{roles.length}</span>
		<span class="text-xs font-bold uppercase tracking-wider text-text-muted">roles</span>
	</div>
	<span class="w-px h-5 bg-border-light" aria-hidden="true"></span>
	<div class="flex items-baseline gap-1.5">
		<span class="text-sm font-extrabold font-mono">{totalHeadcount}</span>
		<span class="text-xs text-text-muted">headcount</span>
	</div>
	<span class="w-px h-5 bg-border-light" aria-hidden="true"></span>
	<div class="flex items-baseline gap-1.5">
		<span class="text-sm font-extrabold font-mono">{Math.round(totalHours).toLocaleString()}h</span>
		<span class="text-xs text-text-muted">total</span>
	</div>
	<span class="w-px h-5 bg-border-light" aria-hidden="true"></span>
	<div class="flex items-baseline gap-1.5">
		<span class="text-sm font-extrabold font-mono">${Math.round(costLow).toLocaleString()}</span>
		<span class="text-xs text-text-muted">–</span>
		<span class="text-sm font-extrabold font-mono">${Math.round(costHigh).toLocaleString()}</span>
	</div>
</div>

<!-- Table -->
<div class="brutal-border overflow-x-auto shadow-[3px_3px_0_#000]">
	<table class="w-full text-sm">
		<thead>
			<tr class="bg-[#1a1a1a] text-white">
				<th class="px-3 py-2 text-left text-[10px] font-extrabold uppercase tracking-wider">Role</th>
				<th class="px-3 py-2 text-right text-[10px] font-extrabold uppercase tracking-wider">Hours</th>
				<th class="px-3 py-2 text-center text-[10px] font-extrabold uppercase tracking-wider">HC</th>
				<th class="px-3 py-2 text-center text-[10px] font-extrabold uppercase tracking-wider">Allocation</th>
				<th class="px-3 py-2 text-center text-[10px] font-extrabold uppercase tracking-wider">Seniority</th>
				<th class="px-3 py-2 text-right text-[10px] font-extrabold uppercase tracking-wider">Rate Range</th>
				<th class="px-3 py-2 text-left text-[10px] font-extrabold uppercase tracking-wider">Notes</th>
				<th class="px-2 py-2 w-8"></th>
			</tr>
		</thead>
		<tbody>
			{#each roles as role}
				<tr class="border-t-2 border-brutal bg-bg hover:bg-surface-hover transition-colors">
					<!-- Role name -->
					<td class="px-3 py-2 font-bold">
						{#if editingCell === `${role.id}-role_name`}
							<input type="text" bind:value={editValue}
								onblur={() => saveEdit(role.id, 'role_name')}
								onkeydown={(e) => { if (e.key === 'Enter') saveEdit(role.id, 'role_name'); }}
								class="w-full bg-bg border-b-2 border-primary focus:outline-none text-sm font-bold"
								autofocus
							/>
						{:else}
							<button class="text-left hover:text-primary transition-colors" ondblclick={() => startEdit(role.id, 'role_name', role.role_name)}>
								{role.role_name}
							</button>
						{/if}
					</td>

					<!-- Hours -->
					<td class="px-3 py-2 text-right font-mono font-extrabold">
						{#if editingCell === `${role.id}-total_hours`}
							<input type="number" bind:value={editValue} min="0" step="0.5"
								onblur={() => saveEdit(role.id, 'total_hours')}
								onkeydown={(e) => { if (e.key === 'Enter') saveEdit(role.id, 'total_hours'); }}
								class="w-16 bg-bg border-b-2 border-primary focus:outline-none text-sm font-mono text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
								autofocus
							/>
						{:else}
							<button class="hover:text-primary transition-colors" ondblclick={() => startEdit(role.id, 'total_hours', role.total_hours)}>
								{Math.round(role.total_hours)}h
							</button>
						{/if}
					</td>

					<!-- Headcount -->
					<td class="px-3 py-2 text-center font-mono font-bold">
						{#if editingCell === `${role.id}-headcount`}
							<input type="number" bind:value={editValue} min="1"
								onblur={() => saveEdit(role.id, 'headcount')}
								onkeydown={(e) => { if (e.key === 'Enter') saveEdit(role.id, 'headcount'); }}
								class="w-10 bg-bg border-b-2 border-primary focus:outline-none text-sm font-mono text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
								autofocus
							/>
						{:else}
							<button class="hover:text-primary transition-colors" ondblclick={() => startEdit(role.id, 'headcount', role.headcount)}>
								{role.headcount}
							</button>
						{/if}
					</td>

					<!-- Allocation -->
					<td class="px-3 py-2 text-center">
						<span class="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase border {allocationColors[role.allocation] ?? 'bg-surface text-text-muted border-border-light'}">
							{role.allocation}
						</span>
					</td>

					<!-- Seniority -->
					<td class="px-3 py-2 text-center">
						<span class="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase border {seniorityColors[role.seniority] ?? 'bg-surface text-text-muted border-border-light'}">
							{role.seniority}
						</span>
					</td>

					<!-- Rate range -->
					<td class="px-3 py-2 text-right font-mono text-xs text-text-muted">
						${role.rate_min}–${role.rate_max}/h
					</td>

					<!-- Notes -->
					<td class="px-3 py-2 text-xs text-text-muted max-w-[200px] truncate">
						{role.notes}
					</td>

					<!-- Delete -->
					<td class="px-2 py-2 text-center">
						<button
							class="text-[10px] text-text-muted hover:text-danger transition-colors"
							onclick={() => deleteRole(role.id)}
							aria-label="Delete {role.role_name}"
						>&#10005;</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- Add role button -->
<div class="mt-3 flex justify-end">
	<button
		class="px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider
			brutal-border-thin bg-surface text-text-muted hover:bg-surface-raised hover:text-text transition-colors"
		onclick={addRole}
	>+ Add Role</button>
</div>
