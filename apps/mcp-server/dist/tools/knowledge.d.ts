import { z } from "zod";
export declare const saveKnowledgePackSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    vendor: z.ZodDefault<z.ZodString>;
    category: z.ZodString;
    subcategory: z.ZodDefault<z.ZodString>;
    description: z.ZodDefault<z.ZodString>;
    direction: z.ZodDefault<z.ZodString>;
    latest_version: z.ZodDefault<z.ZodString>;
    supported_versions: z.ZodDefault<z.ZodUnknown>;
    eol_versions: z.ZodDefault<z.ZodUnknown>;
    valid_topologies: z.ZodDefault<z.ZodUnknown>;
    deployment_models: z.ZodDefault<z.ZodUnknown>;
    compatible_targets: z.ZodDefault<z.ZodUnknown>;
    compatible_infrastructure: z.ZodDefault<z.ZodUnknown>;
    required_services: z.ZodDefault<z.ZodUnknown>;
    optional_services: z.ZodDefault<z.ZodUnknown>;
    confidence: z.ZodDefault<z.ZodString>;
    last_researched: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    pack_version: z.ZodDefault<z.ZodString>;
    created_by: z.ZodDefault<z.ZodString>;
    change_summary: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    confidence: string;
    id: string;
    category: string;
    description: string;
    name: string;
    vendor: string;
    subcategory: string;
    direction: string;
    latest_version: string;
    last_researched: string | null;
    pack_version: string;
    created_by: string;
    change_summary: string;
    supported_versions?: unknown;
    eol_versions?: unknown;
    valid_topologies?: unknown;
    deployment_models?: unknown;
    compatible_targets?: unknown;
    compatible_infrastructure?: unknown;
    required_services?: unknown;
    optional_services?: unknown;
}, {
    id: string;
    category: string;
    name: string;
    confidence?: string | undefined;
    description?: string | undefined;
    vendor?: string | undefined;
    subcategory?: string | undefined;
    direction?: string | undefined;
    latest_version?: string | undefined;
    supported_versions?: unknown;
    eol_versions?: unknown;
    valid_topologies?: unknown;
    deployment_models?: unknown;
    compatible_targets?: unknown;
    compatible_infrastructure?: unknown;
    required_services?: unknown;
    optional_services?: unknown;
    last_researched?: string | null | undefined;
    pack_version?: string | undefined;
    created_by?: string | undefined;
    change_summary?: string | undefined;
}>;
export declare function saveKnowledgePack(input: z.infer<typeof saveKnowledgePackSchema>): Promise<{
    success: boolean;
    id: string;
    version: number;
}>;
export declare const getKnowledgePackSchema: z.ZodObject<{
    pack_id: z.ZodString;
    include: z.ZodOptional<z.ZodArray<z.ZodEnum<["heuristics", "discovery", "ai_alternatives", "sources"]>, "many">>;
    version: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    pack_id: string;
    version?: number | undefined;
    include?: ("discovery" | "ai_alternatives" | "heuristics" | "sources")[] | undefined;
}, {
    pack_id: string;
    version?: number | undefined;
    include?: ("discovery" | "ai_alternatives" | "heuristics" | "sources")[] | undefined;
}>;
export declare function getKnowledgePack(input: z.infer<typeof getKnowledgePackSchema>): Promise<Record<string, unknown> | {
    id: string;
    name: string;
    vendor: string;
    category: string;
    subcategory: string;
    description: string;
    direction: string;
    latest_version: string;
    supported_versions: unknown;
    eol_versions: unknown;
    valid_topologies: unknown;
    deployment_models: unknown;
    compatible_targets: unknown;
    compatible_infrastructure: unknown;
    required_services: unknown;
    optional_services: unknown;
    confidence: string;
    last_researched: string | null;
    pack_version: string;
    created_at: string;
    updated_at: string;
} | null>;
export declare const listKnowledgePacksSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    direction: z.ZodOptional<z.ZodString>;
    subcategory: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    category?: string | undefined;
    subcategory?: string | undefined;
    direction?: string | undefined;
}, {
    search?: string | undefined;
    category?: string | undefined;
    subcategory?: string | undefined;
    direction?: string | undefined;
}>;
export declare function listKnowledgePacks(input: z.infer<typeof listKnowledgePacksSchema>): Promise<{
    id: string;
    name: string;
    vendor: string;
    category: string;
    subcategory: string;
    description: string;
    direction: string;
    latest_version: string;
    supported_versions: unknown;
    eol_versions: unknown;
    valid_topologies: unknown;
    deployment_models: unknown;
    compatible_targets: unknown;
    compatible_infrastructure: unknown;
    required_services: unknown;
    optional_services: unknown;
    confidence: string;
    last_researched: string | null;
    pack_version: string;
    created_at: string;
    updated_at: string;
}[]>;
export declare const deleteKnowledgePackSchema: z.ZodObject<{
    pack_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    pack_id: string;
}, {
    pack_id: string;
}>;
export declare function deleteKnowledgePack(input: z.infer<typeof deleteKnowledgePackSchema>): Promise<{
    success: boolean;
}>;
export declare const saveDiscoveryTreeSchema: z.ZodObject<{
    pack_id: z.ZodString;
    dimensions: z.ZodDefault<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    pack_id: string;
    dimensions?: unknown;
}, {
    pack_id: string;
    dimensions?: unknown;
}>;
export declare function saveDiscoveryTreeKnowledge(input: z.infer<typeof saveDiscoveryTreeSchema>): Promise<{
    success: boolean;
    pack_id: string;
    version: number;
}>;
export declare const getDiscoveryTreeSchema: z.ZodObject<{
    pack_ids: z.ZodArray<z.ZodString, "many">;
    version: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    pack_ids: string[];
    version?: number | undefined;
}, {
    pack_ids: string[];
    version?: number | undefined;
}>;
export declare function getDiscoveryTreeKnowledge(input: z.infer<typeof getDiscoveryTreeSchema>): Promise<{
    packs: {
        pack_id: string;
        version: number;
        dimensions: unknown;
    }[];
    dimensions: unknown[];
}>;
export declare const saveHeuristicsSchema: z.ZodObject<{
    pack_id: z.ZodString;
    effort_hours: z.ZodDefault<z.ZodArray<z.ZodObject<{
        component_id: z.ZodString;
        component_name: z.ZodDefault<z.ZodString>;
        base_hours: z.ZodDefault<z.ZodNumber>;
        unit: z.ZodDefault<z.ZodString>;
        includes: z.ZodDefault<z.ZodString>;
        role_breakdown: z.ZodDefault<z.ZodUnknown>;
        phase_id: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        includes: string;
        base_hours: number;
        component_id: string;
        component_name: string;
        unit: string;
        phase_id: string;
        role_breakdown?: unknown;
    }, {
        component_id: string;
        includes?: string | undefined;
        base_hours?: number | undefined;
        component_name?: string | undefined;
        unit?: string | undefined;
        role_breakdown?: unknown;
        phase_id?: string | undefined;
    }>, "many">>;
    multipliers: z.ZodDefault<z.ZodArray<z.ZodObject<{
        multiplier_id: z.ZodString;
        condition: z.ZodDefault<z.ZodString>;
        factor: z.ZodDefault<z.ZodNumber>;
        applies_to: z.ZodDefault<z.ZodUnknown>;
        reason: z.ZodDefault<z.ZodString>;
        supersedes: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        factor: number;
        multiplier_id: string;
        condition: string;
        reason: string;
        supersedes: string | null;
        applies_to?: unknown;
    }, {
        multiplier_id: string;
        factor?: number | undefined;
        condition?: string | undefined;
        applies_to?: unknown;
        reason?: string | undefined;
        supersedes?: string | null | undefined;
    }>, "many">>;
    gotcha_patterns: z.ZodDefault<z.ZodArray<z.ZodObject<{
        pattern_id: z.ZodString;
        pattern_condition: z.ZodDefault<z.ZodString>;
        risk_level: z.ZodDefault<z.ZodString>;
        hours_impact: z.ZodDefault<z.ZodNumber>;
        description: z.ZodDefault<z.ZodString>;
        mitigation: z.ZodDefault<z.ZodString>;
        affected_components: z.ZodDefault<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        mitigation: string;
        pattern_id: string;
        pattern_condition: string;
        risk_level: string;
        hours_impact: number;
        affected_components?: unknown;
    }, {
        pattern_id: string;
        description?: string | undefined;
        mitigation?: string | undefined;
        affected_components?: unknown;
        pattern_condition?: string | undefined;
        risk_level?: string | undefined;
        hours_impact?: number | undefined;
    }>, "many">>;
    dependency_chains: z.ZodDefault<z.ZodArray<z.ZodObject<{
        chain_id: z.ZodString;
        predecessor: z.ZodString;
        successors: z.ZodDefault<z.ZodUnknown>;
        dependency_type: z.ZodDefault<z.ZodString>;
        reason: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dependency_type: string;
        reason: string;
        chain_id: string;
        predecessor: string;
        successors?: unknown;
    }, {
        chain_id: string;
        predecessor: string;
        dependency_type?: string | undefined;
        reason?: string | undefined;
        successors?: unknown;
    }>, "many">>;
    phase_mappings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        phase_id: z.ZodString;
        phase_name: z.ZodDefault<z.ZodString>;
        phase_order: z.ZodDefault<z.ZodNumber>;
        component_ids: z.ZodDefault<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        phase_id: string;
        phase_name: string;
        phase_order: number;
        component_ids?: unknown;
    }, {
        phase_id: string;
        phase_name?: string | undefined;
        phase_order?: number | undefined;
        component_ids?: unknown;
    }>, "many">>;
    roles: z.ZodDefault<z.ZodArray<z.ZodObject<{
        role_id: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
        typical_rate_range: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        role_id: string;
        typical_rate_range: string;
    }, {
        role_id: string;
        description?: string | undefined;
        typical_rate_range?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    dependency_chains: {
        dependency_type: string;
        reason: string;
        chain_id: string;
        predecessor: string;
        successors?: unknown;
    }[];
    pack_id: string;
    effort_hours: {
        includes: string;
        base_hours: number;
        component_id: string;
        component_name: string;
        unit: string;
        phase_id: string;
        role_breakdown?: unknown;
    }[];
    multipliers: {
        factor: number;
        multiplier_id: string;
        condition: string;
        reason: string;
        supersedes: string | null;
        applies_to?: unknown;
    }[];
    gotcha_patterns: {
        description: string;
        mitigation: string;
        pattern_id: string;
        pattern_condition: string;
        risk_level: string;
        hours_impact: number;
        affected_components?: unknown;
    }[];
    phase_mappings: {
        phase_id: string;
        phase_name: string;
        phase_order: number;
        component_ids?: unknown;
    }[];
    roles: {
        description: string;
        role_id: string;
        typical_rate_range: string;
    }[];
}, {
    pack_id: string;
    dependency_chains?: {
        chain_id: string;
        predecessor: string;
        dependency_type?: string | undefined;
        reason?: string | undefined;
        successors?: unknown;
    }[] | undefined;
    effort_hours?: {
        component_id: string;
        includes?: string | undefined;
        base_hours?: number | undefined;
        component_name?: string | undefined;
        unit?: string | undefined;
        role_breakdown?: unknown;
        phase_id?: string | undefined;
    }[] | undefined;
    multipliers?: {
        multiplier_id: string;
        factor?: number | undefined;
        condition?: string | undefined;
        applies_to?: unknown;
        reason?: string | undefined;
        supersedes?: string | null | undefined;
    }[] | undefined;
    gotcha_patterns?: {
        pattern_id: string;
        description?: string | undefined;
        mitigation?: string | undefined;
        affected_components?: unknown;
        pattern_condition?: string | undefined;
        risk_level?: string | undefined;
        hours_impact?: number | undefined;
    }[] | undefined;
    phase_mappings?: {
        phase_id: string;
        phase_name?: string | undefined;
        phase_order?: number | undefined;
        component_ids?: unknown;
    }[] | undefined;
    roles?: {
        role_id: string;
        description?: string | undefined;
        typical_rate_range?: string | undefined;
    }[] | undefined;
}>;
export declare function saveHeuristics(input: z.infer<typeof saveHeuristicsSchema>): Promise<{
    success: boolean;
    pack_id: string;
}>;
export declare const getHeuristicsSchema: z.ZodObject<{
    pack_ids: z.ZodArray<z.ZodString, "many">;
    type: z.ZodOptional<z.ZodEnum<["effort", "multipliers", "gotchas", "chains", "phases", "roles"]>>;
}, "strip", z.ZodTypeAny, {
    pack_ids: string[];
    type?: "phases" | "multipliers" | "roles" | "effort" | "gotchas" | "chains" | undefined;
}, {
    pack_ids: string[];
    type?: "phases" | "multipliers" | "roles" | "effort" | "gotchas" | "chains" | undefined;
}>;
export declare function getHeuristics(input: z.infer<typeof getHeuristicsSchema>): Promise<Record<string, Record<string, unknown[]>>>;
export declare const saveMigrationPathSchema: z.ZodObject<{
    id: z.ZodString;
    source_pack_id: z.ZodString;
    target_pack_id: z.ZodString;
    prevalence: z.ZodDefault<z.ZodString>;
    complexity: z.ZodDefault<z.ZodString>;
    typical_duration: z.ZodDefault<z.ZodString>;
    primary_drivers: z.ZodDefault<z.ZodUnknown>;
    prerequisites: z.ZodDefault<z.ZodUnknown>;
    service_map: z.ZodDefault<z.ZodUnknown>;
    migration_tools: z.ZodDefault<z.ZodUnknown>;
    path_gotcha_patterns: z.ZodDefault<z.ZodUnknown>;
    path_effort_adjustments: z.ZodDefault<z.ZodUnknown>;
    step_by_step: z.ZodDefault<z.ZodString>;
    decision_points: z.ZodDefault<z.ZodString>;
    case_studies: z.ZodDefault<z.ZodString>;
    incompatibilities: z.ZodDefault<z.ZodString>;
    confidence: z.ZodDefault<z.ZodString>;
    last_researched: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    version: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    confidence: string;
    id: string;
    version: string;
    last_researched: string | null;
    source_pack_id: string;
    target_pack_id: string;
    prevalence: string;
    complexity: string;
    typical_duration: string;
    step_by_step: string;
    decision_points: string;
    case_studies: string;
    incompatibilities: string;
    primary_drivers?: unknown;
    prerequisites?: unknown;
    service_map?: unknown;
    migration_tools?: unknown;
    path_gotcha_patterns?: unknown;
    path_effort_adjustments?: unknown;
}, {
    id: string;
    source_pack_id: string;
    target_pack_id: string;
    confidence?: string | undefined;
    version?: string | undefined;
    last_researched?: string | null | undefined;
    prevalence?: string | undefined;
    complexity?: string | undefined;
    typical_duration?: string | undefined;
    primary_drivers?: unknown;
    prerequisites?: unknown;
    service_map?: unknown;
    migration_tools?: unknown;
    path_gotcha_patterns?: unknown;
    path_effort_adjustments?: unknown;
    step_by_step?: string | undefined;
    decision_points?: string | undefined;
    case_studies?: string | undefined;
    incompatibilities?: string | undefined;
}>;
export declare function saveMigrationPath(input: z.infer<typeof saveMigrationPathSchema>): Promise<{
    success: boolean;
    id: string;
}>;
export declare const getMigrationPathSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    source_pack_id: z.ZodOptional<z.ZodString>;
    target_pack_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    source_pack_id?: string | undefined;
    target_pack_id?: string | undefined;
}, {
    id?: string | undefined;
    source_pack_id?: string | undefined;
    target_pack_id?: string | undefined;
}>;
export declare function getMigrationPath(input: z.infer<typeof getMigrationPathSchema>): Promise<{
    id: string;
    source_pack_id: string;
    target_pack_id: string;
    prevalence: string;
    complexity: string;
    typical_duration: string;
    primary_drivers: unknown;
    prerequisites: unknown;
    service_map: unknown;
    migration_tools: unknown;
    path_gotcha_patterns: unknown;
    path_effort_adjustments: unknown;
    step_by_step: string;
    decision_points: string;
    case_studies: string;
    incompatibilities: string;
    confidence: string;
    last_researched: string | null;
    version: string;
    created_at: string;
    updated_at: string;
} | null>;
export declare const listMigrationPathsSchema: z.ZodObject<{
    source_pack_id: z.ZodOptional<z.ZodString>;
    target_pack_id: z.ZodOptional<z.ZodString>;
    complexity: z.ZodOptional<z.ZodString>;
    prevalence: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    source_pack_id?: string | undefined;
    target_pack_id?: string | undefined;
    prevalence?: string | undefined;
    complexity?: string | undefined;
}, {
    source_pack_id?: string | undefined;
    target_pack_id?: string | undefined;
    prevalence?: string | undefined;
    complexity?: string | undefined;
}>;
export declare function listMigrationPaths(input: z.infer<typeof listMigrationPathsSchema>): Promise<{
    id: string;
    source_pack_id: string;
    target_pack_id: string;
    prevalence: string;
    complexity: string;
    typical_duration: string;
    primary_drivers: unknown;
    prerequisites: unknown;
    service_map: unknown;
    migration_tools: unknown;
    path_gotcha_patterns: unknown;
    path_effort_adjustments: unknown;
    step_by_step: string;
    decision_points: string;
    case_studies: string;
    incompatibilities: string;
    confidence: string;
    last_researched: string | null;
    version: string;
    created_at: string;
    updated_at: string;
}[]>;
export declare const saveSourceUrlsSchema: z.ZodObject<{
    pack_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    migration_path_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    urls: z.ZodArray<z.ZodObject<{
        source_url: z.ZodString;
        title: z.ZodDefault<z.ZodString>;
        source_type: z.ZodDefault<z.ZodString>;
        claims: z.ZodDefault<z.ZodUnknown>;
        confidence: z.ZodDefault<z.ZodString>;
        still_accessible: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        confidence: string;
        source_url: string;
        title: string;
        source_type: string;
        still_accessible: boolean;
        claims?: unknown;
    }, {
        source_url: string;
        confidence?: string | undefined;
        title?: string | undefined;
        source_type?: string | undefined;
        claims?: unknown;
        still_accessible?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    urls: {
        confidence: string;
        source_url: string;
        title: string;
        source_type: string;
        still_accessible: boolean;
        claims?: unknown;
    }[];
    pack_id?: string | null | undefined;
    migration_path_id?: string | null | undefined;
}, {
    urls: {
        source_url: string;
        confidence?: string | undefined;
        title?: string | undefined;
        source_type?: string | undefined;
        claims?: unknown;
        still_accessible?: boolean | undefined;
    }[];
    pack_id?: string | null | undefined;
    migration_path_id?: string | null | undefined;
}>;
export declare function saveSourceUrls(input: z.infer<typeof saveSourceUrlsSchema>): Promise<{
    success: boolean;
    count: number;
}>;
export declare const saveAiAlternativesSchema: z.ZodObject<{
    pack_id: z.ZodString;
    alternatives: z.ZodArray<z.ZodObject<{
        tool_id: z.ZodString;
        name: z.ZodDefault<z.ZodString>;
        vendor: z.ZodDefault<z.ZodString>;
        category: z.ZodDefault<z.ZodString>;
        description: z.ZodDefault<z.ZodString>;
        url: z.ZodDefault<z.ZodString>;
        applicable_components: z.ZodDefault<z.ZodUnknown>;
        applicable_phases: z.ZodDefault<z.ZodUnknown>;
        hours_saved: z.ZodDefault<z.ZodUnknown>;
        cost: z.ZodDefault<z.ZodUnknown>;
        pros: z.ZodDefault<z.ZodUnknown>;
        cons: z.ZodDefault<z.ZodUnknown>;
        prerequisites: z.ZodDefault<z.ZodUnknown>;
        recommendation: z.ZodDefault<z.ZodString>;
        applicability_conditions: z.ZodDefault<z.ZodUnknown>;
        mutual_exclusion_group: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        category: string;
        description: string;
        name: string;
        url: string;
        recommendation: string;
        vendor: string;
        tool_id: string;
        mutual_exclusion_group: string | null;
        prerequisites?: unknown;
        applicable_components?: unknown;
        applicable_phases?: unknown;
        hours_saved?: unknown;
        cost?: unknown;
        pros?: unknown;
        cons?: unknown;
        applicability_conditions?: unknown;
    }, {
        tool_id: string;
        category?: string | undefined;
        description?: string | undefined;
        name?: string | undefined;
        url?: string | undefined;
        recommendation?: string | undefined;
        vendor?: string | undefined;
        prerequisites?: unknown;
        applicable_components?: unknown;
        applicable_phases?: unknown;
        hours_saved?: unknown;
        cost?: unknown;
        pros?: unknown;
        cons?: unknown;
        applicability_conditions?: unknown;
        mutual_exclusion_group?: string | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    pack_id: string;
    alternatives: {
        category: string;
        description: string;
        name: string;
        url: string;
        recommendation: string;
        vendor: string;
        tool_id: string;
        mutual_exclusion_group: string | null;
        prerequisites?: unknown;
        applicable_components?: unknown;
        applicable_phases?: unknown;
        hours_saved?: unknown;
        cost?: unknown;
        pros?: unknown;
        cons?: unknown;
        applicability_conditions?: unknown;
    }[];
}, {
    pack_id: string;
    alternatives: {
        tool_id: string;
        category?: string | undefined;
        description?: string | undefined;
        name?: string | undefined;
        url?: string | undefined;
        recommendation?: string | undefined;
        vendor?: string | undefined;
        prerequisites?: unknown;
        applicable_components?: unknown;
        applicable_phases?: unknown;
        hours_saved?: unknown;
        cost?: unknown;
        pros?: unknown;
        cons?: unknown;
        applicability_conditions?: unknown;
        mutual_exclusion_group?: string | null | undefined;
    }[];
}>;
export declare function saveAiAlternatives(input: z.infer<typeof saveAiAlternativesSchema>): Promise<{
    success: boolean;
    pack_id: string;
    count: number;
}>;
export declare const pinKnowledgeVersionSchema: z.ZodObject<{
    assessment_id: z.ZodString;
    pack_ids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    assessment_id: string;
    pack_ids: string[];
}, {
    assessment_id: string;
    pack_ids: string[];
}>;
export declare function pinKnowledgeVersion(input: z.infer<typeof pinKnowledgeVersionSchema>): Promise<{
    success: boolean;
    pins: {
        pack_id: string;
        pinned_version: number;
    }[];
}>;
export declare const getPinnedKnowledgeSchema: z.ZodObject<{
    assessment_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    assessment_id: string;
}, {
    assessment_id: string;
}>;
export declare function getPinnedKnowledge(input: z.infer<typeof getPinnedKnowledgeSchema>): Promise<{
    assessment_id: string;
    pack_id: string;
    pinned_version: number;
    pinned_at: string;
    pack_name: string;
    pack_category: string;
}[]>;
export declare const saveProficiencyCatalogSchema: z.ZodObject<{
    categories: z.ZodArray<z.ZodObject<{
        category_id: z.ZodString;
        name: z.ZodDefault<z.ZodString>;
        description: z.ZodDefault<z.ZodString>;
        adoption_base_hours: z.ZodDefault<z.ZodNumber>;
        maps_to_tools: z.ZodDefault<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        category_id: string;
        adoption_base_hours: number;
        maps_to_tools?: unknown;
    }, {
        category_id: string;
        description?: string | undefined;
        name?: string | undefined;
        adoption_base_hours?: number | undefined;
        maps_to_tools?: unknown;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    categories: {
        description: string;
        name: string;
        category_id: string;
        adoption_base_hours: number;
        maps_to_tools?: unknown;
    }[];
}, {
    categories: {
        category_id: string;
        description?: string | undefined;
        name?: string | undefined;
        adoption_base_hours?: number | undefined;
        maps_to_tools?: unknown;
    }[];
}>;
export declare function saveProficiencyCatalog(input: z.infer<typeof saveProficiencyCatalogSchema>): Promise<{
    success: boolean;
    count: number;
}>;
export declare const getComposedDiscoveryTreeSchema: z.ZodObject<{
    assessment_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    assessment_id: string;
}, {
    assessment_id: string;
}>;
export declare function getComposedDiscoveryTree(input: z.infer<typeof getComposedDiscoveryTreeSchema>): Promise<import("@migration-planner/db").ComposedDiscoveryTree>;
export declare const getComposedHeuristicsSchema: z.ZodObject<{
    assessment_id: z.ZodString;
    type: z.ZodOptional<z.ZodEnum<["effort", "multipliers", "gotchas", "chains", "phases", "roles"]>>;
}, "strip", z.ZodTypeAny, {
    assessment_id: string;
    type?: "phases" | "multipliers" | "roles" | "effort" | "gotchas" | "chains" | undefined;
}, {
    assessment_id: string;
    type?: "phases" | "multipliers" | "roles" | "effort" | "gotchas" | "chains" | undefined;
}>;
export declare function getComposedHeuristics(input: z.infer<typeof getComposedHeuristicsSchema>): Promise<import("@migration-planner/db").ComposedHeuristics>;
export declare const checkUrlFreshnessSchema: z.ZodObject<{
    stale_threshold_days: z.ZodDefault<z.ZodNumber>;
    pack_id: z.ZodOptional<z.ZodString>;
    migration_path_id: z.ZodOptional<z.ZodString>;
    timeout_ms: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    stale_threshold_days: number;
    timeout_ms: number;
    pack_id?: string | undefined;
    migration_path_id?: string | undefined;
}, {
    pack_id?: string | undefined;
    migration_path_id?: string | undefined;
    stale_threshold_days?: number | undefined;
    timeout_ms?: number | undefined;
}>;
export declare function checkUrlFreshness(input: z.infer<typeof checkUrlFreshnessSchema>): Promise<import("@migration-planner/db").UrlFreshnessResult>;
//# sourceMappingURL=knowledge.d.ts.map