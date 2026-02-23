/**
 * Maps discovery question IDs to the migration component IDs they affect.
 * Used by buildAssumptions() to determine which components are impacted
 * when a question has an assumed or unknown answer.
 */

const QUESTION_COMPONENT_MAP: Record<string, string[]> = {
	// Compute
	compute_cm_instance_count: ['compute_single_role'],
	compute_cd_instance_count: ['compute_single_role', 'redis_session', 'cdn_setup', 'testing_validation'],
	compute_ec2_instance_type_cm: ['compute_single_role'],
	compute_ec2_instance_type_cd: ['compute_single_role'],
	compute_os_version: ['compute_single_role'],
	compute_sitecore_version: ['compute_single_role', 'identity_server', 'xconnect_xdb'],
	compute_cd_autoscaling: ['compute_single_role'],
	compute_hosting_model: ['compute_single_role', 'cicd_pipeline'],

	// Database
	database_engine: ['database_single'],
	database_sql_version: ['database_single'],
	database_rds_instance_class: ['database_single'],
	database_total_size_gb: ['database_single', 'cutover_execution'],
	database_ha_config: ['database_single', 'backup_dr'],
	database_separate_xdb: ['database_single', 'xconnect_xdb'],
	database_custom_databases: ['database_single'],
	database_encryption_at_rest: ['database_single'],
	database_clr_assemblies: ['database_single'],
	database_linked_servers: ['database_single'],
	database_cross_db_queries: ['database_single'],
	database_compliance_requirements: ['database_single', 'networking_vnet', 'blob_storage'],

	// Search
	search_provider: ['solr_standalone', 'solr_cloud'],
	search_solr_version: ['solr_standalone', 'solr_cloud'],
	search_solr_node_count: ['solr_standalone', 'solr_cloud'],
	search_solr_hosting: ['solr_standalone', 'solr_cloud'],
	search_total_index_size_gb: ['solr_standalone', 'solr_cloud'],
	search_custom_indexes: ['solr_standalone', 'solr_cloud'],

	// Caching / Session
	caching_redis_in_use: ['redis_session'],
	caching_redis_hosting: ['redis_session'],
	caching_redis_node_type: ['redis_session'],
	caching_redis_cluster_mode: ['redis_session'],
	session_shared_provider: ['redis_session', 'compute_single_role'],
	session_private_provider: ['compute_single_role'],

	// CDN
	cdn_in_use: ['cdn_setup'],
	cdn_provider: ['cdn_setup'],
	cdn_distribution_count: ['cdn_setup'],
	cdn_waf_enabled: ['cdn_setup'],

	// DNS
	dns_provider: ['dns_cutover'],
	dns_zone_count: ['dns_cutover'],
	dns_total_record_count: ['dns_cutover'],

	// SSL/TLS
	ssl_certificate_provider: ['ssl_tls'],
	ssl_certificate_count: ['ssl_tls'],
	ssl_certificate_pinning: ['ssl_tls', 'custom_integration'],

	// Storage
	storage_media_strategy: ['blob_storage'],
	storage_media_total_size_gb: ['blob_storage'],
	storage_s3_bucket_count: ['blob_storage'],
	storage_shared_filesystem: ['blob_storage', 'content_serialization_sync'],

	// xConnect
	xconnect_enabled: ['xconnect_xdb'],
	xconnect_instance_count: ['xconnect_xdb'],
	xconnect_contact_count: ['xconnect_xdb', 'database_single'],
	xconnect_collection_db_type: ['xconnect_xdb'],

	// Identity
	identity_server_deployed: ['identity_server'],
	identity_server_hosting: ['identity_server'],
	identity_external_providers: ['identity_server'],

	// Integrations
	integrations_crm: ['custom_integration'],
	integrations_custom_api_count: ['custom_integration'],
	integrations_aws_services: ['custom_integration', 'compute_single_role'],
	integrations_sitecore_modules: ['compute_single_role', 'testing_validation'],
	integrations_sxa_site_count: ['compute_single_role', 'cdn_setup', 'solr_standalone', 'solr_cloud', 'testing_validation'],
	integrations_jss_rendering_host: ['compute_single_role', 'cdn_setup', 'cicd_pipeline'],
	integrations_publishing_service_hosting: ['publishing_service', 'compute_single_role'],

	// CI/CD
	cicd_platform: ['cicd_pipeline'],
	cicd_source_control: ['cicd_pipeline'],
	cicd_deployment_strategy: ['cicd_pipeline'],
	cicd_environment_count: ['networking_vnet', 'compute_single_role', 'database_single', 'monitoring_setup', 'cicd_pipeline'],
	cicd_item_serialization: ['content_serialization_sync'],

	// Monitoring
	monitoring_apm_tool: ['monitoring_setup'],
	monitoring_log_aggregation: ['monitoring_setup'],

	// Networking
	networking_vpc_count: ['networking_vnet'],
	networking_subnet_tiers: ['networking_vnet'],
	networking_vpn_connection: ['networking_vnet'],
	networking_topology_pattern: ['networking_vnet'],
	networking_load_balancer_type: ['networking_vnet'],

	// Backup / DR
	backup_database_strategy: ['backup_dr'],
	backup_rpo_hours: ['backup_dr'],
	backup_rto_hours: ['backup_dr', 'compute_single_role', 'database_single'],
	backup_dr_strategy: ['backup_dr', 'database_single', 'networking_vnet'],

	// Email
	email_smtp_provider: ['custom_integration'],

	// Content & Data Volume
	content_total_item_count: ['content_migration', 'cutover_execution'],
	content_language_count: ['content_migration', 'testing_validation'],
	content_type_count: ['content_migration'],
	content_workflow_complexity: ['content_migration', 'testing_validation'],
	content_publishing_frequency: ['content_migration', 'cutover_execution'],
	content_tree_depth: ['content_migration', 'content_serialization_sync'],
	content_media_items_count: ['content_migration', 'blob_storage'],
	content_personalization_rules_count: ['content_migration', 'xconnect_xdb', 'testing_validation'],
	content_multisite_shared_content: ['content_migration', 'testing_validation'],

	// Customization Depth
	customization_pipeline_count: ['code_migration', 'testing_validation'],
	customization_rendering_count: ['frontend_rebuild', 'testing_validation'],
	customization_config_patch_count: ['code_migration'],
	customization_helix_structure: ['code_migration'],
	customization_orm_usage: ['code_migration'],
	customization_scheduled_agents: ['code_migration', 'compute_single_role'],
	customization_event_handlers: ['code_migration', 'testing_validation'],
	customization_custom_api_endpoints: ['code_migration', 'custom_integration'],
	customization_code_quality: ['code_migration', 'testing_validation'],
	customization_glass_mapper_version: ['code_migration'],
	customization_helix_layer_count: ['code_migration'],

	// Frontend Architecture
	frontend_rendering_approach: ['frontend_rebuild', 'compute_single_role'],
	frontend_rendering_host: ['frontend_rebuild', 'compute_single_role'],
	frontend_build_pipeline: ['frontend_rebuild', 'cicd_pipeline'],
	frontend_js_framework: ['frontend_rebuild'],
	frontend_component_count: ['frontend_rebuild', 'testing_validation'],
	frontend_design_system: ['frontend_rebuild'],
	frontend_responsive_complexity: ['frontend_rebuild', 'testing_validation'],
	frontend_jss_app_count: ['frontend_rebuild', 'compute_single_role', 'cdn_setup'],
	frontend_sxa_theme_count: ['frontend_rebuild', 'testing_validation'],

	// Team & Timeline
	team_total_size: ['project_management'],
	team_sitecore_experience: ['code_migration', 'content_migration', 'testing_validation'],
	team_target_platform_experience: ['compute_single_role', 'networking_vnet', 'database_single', 'monitoring_setup'],
	team_parallel_workstreams: ['project_management'],
	team_hard_deadline: ['project_management', 'testing_validation'],
	team_training_needs: ['training'],
	team_deadline_date: ['project_management'],

	// Third-Party Modules
	modules_marketplace_count: ['code_migration', 'testing_validation'],
	modules_marketplace_list: ['code_migration', 'testing_validation'],
	modules_custom_forks: ['code_migration', 'testing_validation'],
	modules_version_compatibility: ['code_migration', 'testing_validation'],
	modules_license_portability: ['project_management'],
	modules_deprecated: ['code_migration', 'testing_validation'],
	modules_other_list: ['code_migration'],
	modules_incompatible_list: ['code_migration'],

	// Performance Baselines
	performance_page_load_p50: ['testing_validation'],
	performance_ttfb: ['testing_validation', 'compute_single_role'],
	performance_cache_hit_rate: ['testing_validation', 'cdn_setup', 'redis_session'],
	performance_publish_duration: ['testing_validation', 'content_migration'],
	performance_peak_traffic: ['testing_validation', 'compute_single_role', 'cdn_setup'],
	performance_availability_sla: ['backup_dr', 'compute_single_role', 'networking_vnet'],
	performance_load_test_exists: ['testing_validation'],
};

/**
 * Returns the component IDs affected by a given question.
 * Falls back to an empty array for unknown questions.
 */
export function getAffectedComponents(questionId: string): string[] {
	return QUESTION_COMPONENT_MAP[questionId] ?? [];
}

/**
 * Given a dimension name and question ID, returns affected components.
 * This is a convenience that also handles dimension-level fallback.
 */
const DIMENSION_COMPONENT_MAP: Record<string, string[]> = {
	compute: ['compute_single_role'],
	database: ['database_single'],
	search: ['solr_standalone', 'solr_cloud'],
	caching: ['redis_session'],
	cdn: ['cdn_setup'],
	dns: ['dns_cutover'],
	ssl_tls: ['ssl_tls'],
	storage: ['blob_storage'],
	email: ['custom_integration'],
	xconnect: ['xconnect_xdb'],
	identity: ['identity_server'],
	session_state: ['redis_session', 'compute_single_role'],
	custom_integrations: ['custom_integration'],
	cicd: ['cicd_pipeline', 'content_serialization_sync'],
	monitoring: ['monitoring_setup'],
	networking: ['networking_vnet'],
	backup_dr: ['backup_dr'],
	content_data: ['content_migration'],
	customization: ['code_migration'],
	frontend: ['frontend_rebuild'],
	team_timeline: ['project_management', 'training'],
	modules: ['code_migration'],
	performance: ['testing_validation'],
};

export function getAffectedComponentsForQuestion(dimension: string, questionId: string): string[] {
	const specific = QUESTION_COMPONENT_MAP[questionId];
	if (specific && specific.length > 0) return specific;
	return DIMENSION_COMPONENT_MAP[dimension] ?? [];
}
