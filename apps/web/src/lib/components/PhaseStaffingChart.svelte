<script lang="ts">
	interface PhaseStaffing {
		phase_id: string;
		phase_name: string;
		roles: Array<{ role_id: string; role_name: string; hours: number; headcount: number }>;
		total_headcount: number;
	}

	interface Props {
		staffing: PhaseStaffing[];
	}

	let { staffing }: Props = $props();

	const roleColors: string[] = [
		'#4f46e5', // indigo
		'#7c3aed', // violet
		'#ea580c', // orange
		'#16a34a', // green
		'#0891b2', // cyan
		'#dc2626', // red
		'#ca8a04', // yellow
		'#6366f1', // blue
	];

	// Collect all unique roles across phases
	const allRoles = $derived(
		[...new Set(staffing.flatMap((p) => p.roles.map((r) => r.role_id)))].map((id) => {
			const role = staffing.flatMap((p) => p.roles).find((r) => r.role_id === id);
			return { id, name: role?.role_name ?? id };
		})
	);

	const maxHeadcount = $derived(
		Math.max(1, ...staffing.map((p) => p.total_headcount))
	);

	const barWidth = $derived(Math.max(40, Math.floor(600 / Math.max(staffing.length, 1))));
	const chartWidth = $derived(staffing.length * (barWidth + 12) + 60);
	const chartHeight = 200;
	const barMaxHeight = 160;

	function roleColor(roleId: string): string {
		const idx = allRoles.findIndex((r) => r.id === roleId);
		return roleColors[idx % roleColors.length];
	}

	function cumulativeOffset(roles: Array<{ headcount: number }>, index: number): number {
		let sum = 0;
		for (let i = 0; i < index; i++) {
			sum += (roles[i].headcount / maxHeadcount) * barMaxHeight;
		}
		return sum;
	}
</script>

{#if staffing.length > 0}
	<div class="brutal-border bg-surface p-4 shadow-[2px_2px_0_#000]">
		<h3 class="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-3">
			Phase Staffing
		</h3>

		<!-- Legend -->
		<div class="flex flex-wrap gap-3 mb-4">
			{#each allRoles as role, i}
				<div class="flex items-center gap-1.5">
					<span class="w-3 h-3 border border-brutal" style="background: {roleColors[i % roleColors.length]}"></span>
					<span class="text-[10px] font-bold">{role.name}</span>
				</div>
			{/each}
		</div>

		<!-- Chart -->
		<div class="overflow-x-auto">
			<svg width={chartWidth} height={chartHeight + 40} class="block">
				<!-- Y axis -->
				<line x1="40" y1="10" x2="40" y2={chartHeight} stroke="var(--color-brutal)" stroke-width="2" />
				{#each Array.from({ length: Math.ceil(maxHeadcount) + 1 }, (_, i) => i) as tick}
					{@const y = chartHeight - (tick / maxHeadcount) * barMaxHeight}
					<line x1="36" y1={y} x2="40" y2={y} stroke="var(--color-brutal)" stroke-width="2" />
					<text x="32" y={y + 4} text-anchor="end" class="text-[10px] font-mono fill-text-muted">{tick}</text>
				{/each}

				<!-- Bars -->
				{#each staffing as phase, pi}
					{@const x = 55 + pi * (barWidth + 12)}
					{@const sortedRoles = phase.roles.sort((a, b) => b.headcount - a.headcount)}

					{#each sortedRoles as role, ri}
						{@const segHeight = (role.headcount / maxHeadcount) * barMaxHeight}
						{@const yOffset = cumulativeOffset(sortedRoles, ri)}
						{@const y = chartHeight - yOffset - segHeight}

						<rect
							{x}
							{y}
							width={barWidth}
							height={segHeight}
							fill={roleColor(role.role_id)}
							stroke="var(--color-brutal)"
							stroke-width="2"
						>
							<title>{role.role_name}: {role.headcount} ({role.hours}h)</title>
						</rect>
						{#if segHeight > 14}
							<text
								x={x + barWidth / 2}
								y={y + segHeight / 2 + 4}
								text-anchor="middle"
								class="text-[10px] font-bold"
								fill="white"
							>{role.headcount}</text>
						{/if}
					{/each}

					<!-- Phase label -->
					<text
						x={x + barWidth / 2}
						y={chartHeight + 16}
						text-anchor="middle"
						class="text-[10px] font-bold fill-text-muted"
					>{phase.phase_name.length > 12 ? phase.phase_name.slice(0, 10) + '...' : phase.phase_name}</text>

					<!-- Total headcount above bar -->
					<text
						x={x + barWidth / 2}
						y={chartHeight - (phase.total_headcount / maxHeadcount) * barMaxHeight - 4}
						text-anchor="middle"
						class="text-[10px] font-extrabold font-mono fill-text"
					>{phase.total_headcount}</text>
				{/each}
			</svg>
		</div>
	</div>
{/if}
