<script lang="ts">
    import Card from '$lib/components/ui/Card.svelte';
    import Badge from '$lib/components/ui/Badge.svelte';
    import Tooltip from '$lib/components/ui/Tooltip.svelte';
    import InfoDrawer from '$lib/components/ui/InfoDrawer.svelte';
    import Modal from '$lib/components/ui/Modal.svelte';
    import MarkdownRenderer from '$lib/components/ui/MarkdownRenderer.svelte';

    let { data } = $props();

    const deliverables = $derived((data.deliverables ?? []) as any[]);

    const deliverableIcons: Record<string, string> = {
        'migration-plan.md': '&#9997;',
        'risk-register.md': '&#9888;',
        'runbook.md': '&#9654;',
        'dashboard.html': '&#9635;'
    };

    const deliverableDescriptions: Record<string, string> = {
        'migration-plan.md': 'Phased migration plan with timelines, dependencies, and role assignments',
        'risk-register.md': 'Complete risk register with mitigations, contingencies, and ownership',
        'runbook.md': 'Step-by-step cutover runbook with rollback procedures',
        'dashboard.html': 'Self-contained HTML dashboard for client presentations'
    };

    const deliverableTooltips: Record<string, string> = {
        'migration-plan.md': 'Markdown document with phases, tasks, dependencies, role assignments, and timeline. Share with stakeholders for project alignment.',
        'risk-register.md': 'Markdown register of all identified risks with severity, mitigation strategies, contingency plans, and owners.',
        'runbook.md': 'Step-by-step execution guide for the cutover window, including pre-checks, migration steps, validation, and rollback procedures.',
        'dashboard.html': 'Standalone HTML file with interactive charts. Opens in any browser — no server needed. Ideal for client presentations.'
    };

    const deliverableLabels: Record<string, string> = {
        'migration-plan.md': 'Migration Plan',
        'risk-register.md': 'Risk Register',
        'runbook.md': 'Cutover Runbook',
        'dashboard.html': 'Client Dashboard'
    };

    const deliverableBadgeVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
        'migration-plan.md': 'info',
        'risk-register.md': 'warning',
        'runbook.md': 'success',
        'dashboard.html': 'default'
    };

    let drawerSection = $state<'page' | null>(null);

    // Modal state
    let modalOpen = $state(false);
    let modalDeliverable = $state<any>(null);
    let modalContent = $state('');
    let modalLoading = $state(false);
    let modalError = $state('');

    const modalIsHtml = $derived(modalDeliverable?.name?.endsWith('.html') ?? false);
    const modalIsMarkdown = $derived(modalDeliverable?.name?.endsWith('.md') ?? false);

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async function openDeliverable(deliverable: any) {
        modalDeliverable = deliverable;
        modalContent = '';
        modalError = '';
        modalLoading = true;
        modalOpen = true;

        try {
            const res = await fetch(
                `/api/assessments/${data.assessment.id}/deliverables?path=${encodeURIComponent(deliverable.file_path)}`
            );
            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Failed to load file' }));
                modalError = err.message ?? `Error ${res.status}`;
            } else {
                const json = await res.json();
                modalContent = json.content;
            }
        } catch {
            modalError = 'Network error — could not load file';
        } finally {
            modalLoading = false;
        }
    }

    function closeModal() {
        modalOpen = false;
        modalContent = '';
        modalError = '';
        modalDeliverable = null;
    }
</script>

<svelte:head>
    <title>{data.assessment.project_name} — Deliverables</title>
</svelte:head>

<div class="p-6 space-y-6 animate-enter">
    <div>
        <div class="flex items-center gap-2">
            <h1 class="text-xl font-extrabold uppercase tracking-wider">Deliverables</h1>
            <button onclick={() => drawerSection = 'page'} class="flex items-center justify-center w-5 h-5 text-text-muted hover:text-primary transition-colors" aria-label="About this page">
                <span class="text-[10px] font-mono opacity-60">(i)</span>
            </button>
        </div>
        <p class="text-sm font-bold text-text-secondary mt-0.5">Generated documents and reports</p>
    </div>

    {#if deliverables.length === 0}
        <Card>
            <div class="py-8 text-center">
                <p class="text-lg font-extrabold uppercase tracking-wider text-text-secondary">No Deliverables</p>
                <p class="mt-2 text-sm text-text-muted max-w-md mx-auto">
                    Run <code class="brutal-border-thin bg-surface px-1.5 py-0.5 text-xs font-mono">/migrate plan</code> to generate migration documents.
                </p>
            </div>
        </Card>
    {:else}
        <div class="grid gap-4 sm:grid-cols-2">
            {#each deliverables as deliverable}
                <button
                    class="text-left w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                    onclick={() => openDeliverable(deliverable)}
                >
                    <Card hover padding="p-5">
                        <div class="flex items-start gap-4">
                            <div class="flex h-12 w-12 shrink-0 items-center justify-center brutal-border bg-primary-light text-2xl text-primary shadow-sm">
                                {@html deliverableIcons[deliverable.name] ?? '&#128196;'}
                            </div>
                            <div class="flex-1 min-w-0">
                                <Tooltip text={deliverableTooltips[deliverable.name] ?? ''} position="bottom">
                                    <h3 class="font-extrabold text-sm">{deliverable.name}</h3>
                                </Tooltip>
                                <p class="text-xs text-text-secondary mt-0.5">
                                    {deliverableDescriptions[deliverable.name] ?? 'Generated deliverable document'}
                                </p>
                                <div class="flex items-center gap-2 mt-2">
                                    <span class="text-[10px] font-mono text-text-muted truncate">{deliverable.file_path}</span>
                                </div>
                                {#if deliverable.generated_at}
                                    <span class="text-[10px] text-text-muted font-mono block mt-1">
                                        Generated: {formatDate(deliverable.generated_at)}
                                    </span>
                                {/if}
                            </div>
                            <Badge variant="success">Generated</Badge>
                        </div>
                    </Card>
                </button>
            {/each}
        </div>
    {/if}
</div>

<!-- Deliverable content modal -->
<Modal open={modalOpen} onclose={closeModal} title={deliverableLabels[modalDeliverable?.name] ?? modalDeliverable?.name ?? ''} size="lg">
    {#if modalLoading}
        <div class="py-16 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 brutal-border bg-primary-light mb-4">
                <div class="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p class="text-sm text-text-muted font-bold">Loading document&hellip;</p>
        </div>
    {:else if modalError}
        <div class="py-12 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 brutal-border bg-danger-light text-danger text-xl mb-4">!</div>
            <p class="text-sm font-bold text-danger">{modalError}</p>
            <p class="text-xs text-text-muted mt-2 max-w-xs mx-auto">Check that the file exists at the expected path.</p>
            {#if modalDeliverable?.file_path}
                <code class="block mt-3 text-[10px] font-mono text-text-muted bg-surface-hover brutal-border-thin px-3 py-1.5 mx-auto max-w-sm truncate">
                    {modalDeliverable.file_path}
                </code>
            {/if}
        </div>
    {:else if modalIsHtml}
        <iframe
            srcdoc={modalContent}
            title={modalDeliverable?.name ?? ''}
            class="w-full border-2 border-brutal bg-white"
            style="height: 70vh;"
            sandbox="allow-scripts allow-same-origin"
        ></iframe>
    {:else if modalIsMarkdown}
        <!-- Document header -->
        <div class="flex items-center gap-3 mb-4 pb-3 border-b-2 border-border-light">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center brutal-border-thin text-lg
                {modalDeliverable?.name === 'risk-register.md' ? 'bg-warning-light text-warning' :
                 modalDeliverable?.name === 'runbook.md' ? 'bg-success-light text-success' :
                 'bg-info-light text-info'}">
                {@html deliverableIcons[modalDeliverable?.name] ?? '&#128196;'}
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="text-xs font-extrabold uppercase tracking-wider">
                    {deliverableLabels[modalDeliverable?.name] ?? modalDeliverable?.name}
                </h3>
                <p class="text-[10px] text-text-muted font-mono mt-0.5">
                    {deliverableDescriptions[modalDeliverable?.name] ?? ''}
                </p>
            </div>
            {#if modalDeliverable?.generated_at}
                <Badge variant={deliverableBadgeVariants[modalDeliverable?.name] ?? 'default'}>
                    {formatDate(modalDeliverable.generated_at)}
                </Badge>
            {/if}
        </div>

        <!-- Rendered markdown -->
        <MarkdownRenderer content={modalContent} />
    {:else}
        <pre class="text-xs font-mono leading-relaxed whitespace-pre-wrap break-words text-text-secondary bg-surface-hover border-2 border-brutal p-4 overflow-x-auto">{modalContent}</pre>
    {/if}
    {#snippet footer()}
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                {#if modalDeliverable?.file_path}
                    <span class="text-[10px] font-mono text-text-muted truncate max-w-[40ch]">{modalDeliverable.file_path}</span>
                {/if}
            </div>
            <button
                class="brutal-border-thin bg-primary text-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider hover:bg-primary-hover transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                onclick={closeModal}
            >
                Close
            </button>
        </div>
    {/snippet}
</Modal>

<InfoDrawer
    open={drawerSection !== null}
    onclose={() => drawerSection = null}
    title="About Deliverables"
>
    {#if drawerSection === 'page'}
        <div class="space-y-4 text-sm">
            <p><strong>Deliverables</strong> are the generated documents and reports that you share with clients and stakeholders.</p>
            <div class="space-y-2">
                <h3 class="text-xs font-extrabold uppercase tracking-wider">Available Deliverables</h3>
                <ul class="list-disc list-inside space-y-1 text-text-secondary">
                    <li><strong>Migration Plan</strong> — Phased plan with timelines, dependencies, and role assignments</li>
                    <li><strong>Risk Register</strong> — Complete risk register with mitigations, contingencies, and ownership</li>
                    <li><strong>Runbook</strong> — Step-by-step cutover guide with rollback procedures</li>
                    <li><strong>Dashboard</strong> — Self-contained HTML dashboard for client presentations</li>
                </ul>
            </div>
            <div class="space-y-2">
                <h3 class="text-xs font-extrabold uppercase tracking-wider">Generating Deliverables</h3>
                <p class="text-text-secondary">Run <code class="brutal-border-thin bg-surface px-1 py-0.5 text-xs font-mono">/migrate plan</code> to generate all deliverables. They are based on the current discovery, analysis, estimate, and scope refinement data.</p>
            </div>
            <div class="space-y-2">
                <h3 class="text-xs font-extrabold uppercase tracking-wider">Sharing</h3>
                <p class="text-text-secondary">Deliverables are saved as files in the assessment directory. Markdown files can be shared directly or converted to PDF. The HTML dashboard opens in any browser without a server.</p>
            </div>
        </div>
    {/if}
</InfoDrawer>
