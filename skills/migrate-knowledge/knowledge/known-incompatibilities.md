# Known Incompatibilities: AWS to Azure Migration

## Services with No Direct Azure Equivalent

### S3 Transfer Acceleration
- **AWS**: Optimized uploads via CloudFront edge locations
- **Azure**: No direct equivalent. Use Azure CDN with custom origin, Azure Front Door, or AzCopy with parallel transfer
- **Impact**: Media upload workflows that rely on Transfer Acceleration need redesign

### AWS Global Accelerator
- **AWS**: Anycast IPs for global traffic routing
- **Azure**: Azure Front Door provides similar global routing but with different architecture
- **Impact**: If used for Sitecore CD traffic distribution, need to redesign with Front Door

### EC2 Instance Store (Ephemeral)
- **AWS**: NVMe-based ephemeral storage attached to instance
- **Azure**: Temporary disk exists but behavior differs (size varies by VM, cleared on redeployment)
- **Impact**: If Sitecore temp files or Solr temp indexes use instance store, reconfigure for managed disks

### AWS WAF (WebACL-based)
- **AWS**: WAF rules attached to ALB/CloudFront
- **Azure**: Azure WAF on Application Gateway or Front Door uses different rule format
- **Impact**: WAF rules need complete rewrite. OWASP rulesets available on both but custom rules differ.

### Secrets & Configuration Management
- **AWS Secrets Manager / Parameter Store**: Flat namespace with path-based organization, native RDS credential rotation, seamless Lambda integration via SDK
- **Azure Key Vault / App Configuration**: Key Vault uses vault-based isolation (separate access policies per vault), different API surface, RBAC or access policy authorization model. App Configuration provides feature flags and key-value config separate from secrets
- **Impact**:
  - All secrets references in application code must be updated (AWS SDK → Azure SDK or Managed Identity + Key Vault references)
  - Automatic RDS credential rotation has no direct Key Vault equivalent — use Azure SQL Managed Identity authentication instead
  - Parameter Store hierarchical paths (`/app/prod/db-password`) don't map to Key Vault's flat key namespace — restructure naming
  - IAM-based secret access → Managed Identity + Key Vault access policies or RBAC roles
  - Sitecore connection strings stored in Secrets Manager must be migrated to Key Vault and referenced via Key Vault configuration provider

### Messaging & Streaming
- **AWS SQS**: Pull-based queue with long polling, visibility timeout, built-in dead-letter queue
- **Azure Service Bus Queues**: Push and pull patterns, sessions for ordered processing, different dead-letter and retry semantics
- **Impact**: Queue consumer code must be rewritten. SQS message attributes → Service Bus message properties. Visibility timeout → Lock duration. FIFO guarantees require Service Bus sessions.

---

## Behavioral Differences

### Storage Snapshots
- **AWS EBS Snapshots**: Incremental, stored in S3, cross-region copy simple
- **Azure Managed Disk Snapshots**: Full snapshots by default, incremental snapshots available but different lifecycle
- **Impact**: Backup scripts and snapshot management workflows need updating

### IAM Policy Model
- **AWS IAM**: Policy-based, can be attached to users/groups/roles, supports resource-level policies
- **Azure RBAC**: Role-based with scope hierarchy (Management Group > Subscription > Resource Group > Resource)
- **Impact**: All service-to-service auth needs rearchitecting. AWS IAM roles on EC2 → Azure Managed Identity

### Network Security
- **AWS Security Groups**: Instance-level, stateful, allow-only rules, default deny
- **Azure NSGs**: Subnet or NIC level, stateful, allow AND deny rules with priority ordering
- **Impact**: Security group rules need translation with attention to priority ordering and deny rules

### Load Balancer Health Checks
- **AWS ALB**: Health check per target group with detailed path/response matching
- **Azure App Gateway**: Health probes per backend pool with different timeout/interval semantics
- **Impact**: Health check configurations for Sitecore CD must be recreated and tested

### DNS Health Checks
- **AWS Route 53**: Built-in health checks with failover routing
- **Azure DNS**: No built-in health checks. Must use Traffic Manager or Front Door for failover
- **Impact**: If Route 53 failover routing is used, need Traffic Manager or Front Door

## Sitecore-Specific Azure Considerations

### Connection String Format Differences
- AWS RDS connection strings use DNS endpoints (e.g., `mydb.xxx.us-east-1.rds.amazonaws.com`)
- Azure SQL MI uses `.database.windows.net` suffix
- All Sitecore connection strings in `ConnectionStrings.config` must be updated

### Media Library Storage
- If media is stored in S3 via custom Sitecore media provider:
  - S3 SDK calls must be replaced with Azure Blob Storage SDK
  - Custom media provider needs rewriting or replacement with Sitecore's Azure Blob provider
  - Access patterns (signed URLs vs SAS tokens) differ

### Sitecore TDS/Unicorn Serialization Paths
- File paths in serialization configs may reference S3/EFS mounted paths (e.g., `/mnt/efs/unicorn/`)
- Azure equivalent paths use Azure Files SMB mount (`\\storage.file.core.windows.net\share`) or local disk (`D:\unicorn\`)
- Review all Unicorn `.config` files for `physicalRootPath` settings
- Transparent sync file watchers may behave differently on Azure Files vs EFS (latency, event notification)
- If Unicorn configs use `$(dataFolder)` variable, verify it resolves correctly on Azure VMs
- TDS projects with source control bindings may need path updates in `.scproj` files
- **During data migration**: Run Unicorn sync after database restore to push serialized item state to Azure databases. Resolve any conflicts between serialized items and database content. Validate item counts match expected configuration.

### License File Considerations
- Sitecore license files are not cloud-specific, but deployment location may need updating
- License file must be accessible from all Sitecore roles in Azure

### Sitecore Azure Toolkit
- If migrating to Azure PaaS, Sitecore Azure Toolkit is available but designed for ARM template deployments
- IaaS migration (VM-based) doesn't use the toolkit directly
- The toolkit's WDP (Web Deploy Package) format may be useful for CD deployments

### Session State Provider
- AWS ElastiCache Redis endpoint format differs from Azure Cache for Redis
- Sitecore's Redis session state provider configuration needs endpoint/auth updates
- Azure Cache for Redis requires SSL by default (port 6380) vs ElastiCache default (port 6379 non-SSL)

### Publishing Service
- If Sitecore Publishing Service is deployed separately, it needs its own migration plan
- Publishing Service is .NET Core-based and may run differently on Azure VMs

### xConnect Certificate Authentication
- xConnect uses client certificates for service-to-service auth
- Certificate thumbprints in config files must be updated if certs are reissued
- Azure Key Vault can manage these certificates
