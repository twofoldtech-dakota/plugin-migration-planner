# Azure-Specific Sitecore XP Requirements

## SQL Server / Database Requirements

### Azure SQL Managed Instance (Recommended for IaaS Migration)
- **Why MI over Azure SQL Database**: SQL MI provides near-100% SQL Server compatibility, supporting SQL Agent, cross-database queries, CLR, linked servers, and other features Sitecore may depend on
- **Tier**: Business Critical for HA requirements (built-in Always On AG), General Purpose for non-HA
- **Minimum vCores**: 8 vCores for production (4 vCores for non-production)
- **Storage**: Premium SSD, 32 GB minimum, up to 16 TB
- **Collation**: Must be `SQL_Latin1_General_CP1_CI_AS` — Sitecore is collation-sensitive

### SQL Server on Azure VM (Alternative)
- **When to use**: If SQL MI doesn't support a required feature, or for maximum compatibility
- **VM Series**: E-series (memory-optimized) recommended — E8s_v5 minimum for production
- **Storage**: Premium SSD P30+ for data files, P20+ for log files, separate disks for data/log/temp
- **SQL Version**: Must match source version or be upgrade-compatible

### xDB Shard Databases
- SQL MI supports elastic pools for shard databases
- Shard Map Manager database manages the shard topology
- Custom shard maps require manual recreation on Azure SQL MI

## Compute / VM Requirements

### VM Series Recommendations
| Role | Recommended Series | Min Size | Notes |
|------|-------------------|----------|-------|
| CM | Dsv5 or Esv5 | D8s_v5 | Memory-intensive due to content editing |
| CD | Dsv5 | D4s_v5–D8s_v5 | Scale-out, compute-focused |
| xConnect | Dsv5 | D4s_v5 | Moderate compute and memory |
| Processing | Esv5 | E8s_v5 | Memory-intensive for analytics |
| Identity | Dsv5 | D2s_v5 | Lightweight .NET Core |
| Solr | Esv5 or Lsv3 | E8s_v5 or L8s_v3 | Storage-optimized for large indexes |

### OS Requirements
- Windows Server 2019 or 2022 for Sitecore 10.x
- .NET Framework 4.8 required for Sitecore CM/CD
- .NET Core 3.1+ for Identity Server and Publishing Service (Sitecore 10.x)
- .NET 6+ for Sitecore 10.3+ components
- IIS 10 with WebSocket Protocol enabled

### Managed Disks
- Premium SSD (P30 or higher) for OS and Sitecore application disks
- Ultra Disk for Solr data if high IOPS needed
- Separate data disks from OS disk for performance

## Networking Requirements

### Virtual Network Design
- Minimum /16 VNet with dedicated subnets:
  - `/24` for Sitecore CM/CD VMs
  - `/24` for database (SQL MI requires dedicated subnet)
  - `/24` for Solr
  - `/24` for management/jumpbox
  - `/24` for Application Gateway
- SQL MI requires a **dedicated subnet** with no other resources
- SQL MI subnet needs an NSG allowing Azure management traffic

### NSG Rules (Minimum Required)
- Inbound HTTPS (443) to CD via Application Gateway
- Inbound HTTPS (443) to CM from allowed IPs
- SQL MI port 1433 from Sitecore subnets
- Solr port 8983 from Sitecore subnets
- Redis port 6380 (SSL) from Sitecore subnets
- Identity Server port 443 from Sitecore subnets
- xConnect port 443 from Sitecore subnets
- Outbound HTTPS for license checks, NuGet, telemetry

### Application Gateway
- WAF v2 SKU recommended for CD traffic
- SSL termination or end-to-end SSL
- Cookie-based affinity if not using shared session state
- Health probes for `/sitecore/service/keepalive.aspx` (CD)

## Caching / Redis Requirements

### Azure Cache for Redis
- **Tier**: Premium (P1 minimum) for VNet integration, persistence, clustering
- **SSL**: Required by default (port 6380). Sitecore Redis provider must be configured for SSL
- **Persistence**: Enable AOF or RDB persistence for session state durability
- **Configuration**:
  - `maxmemory-policy`: Set to `allkeys-lru` for session cache
  - Connection timeout: Minimum 15 seconds for Sitecore
  - Sitecore connection string format: `<host>:<port>,password=<key>,ssl=True,abortConnect=False`

## Search / Solr Requirements

### Solr on Azure VM
- Solr version must match Sitecore compatibility (8.4+ for SC 10.0, 8.8+ for SC 10.2+)
- Java 11 recommended (Java 8 minimum)
- Storage: Premium SSD or Ultra Disk for index data
- Memory: Allocate 50% of VM RAM to Solr JVM heap
- Firewall: Port 8983 accessible only from Sitecore VMs

### SolrCloud on AKS (Alternative)
- ZooKeeper ensemble (3 nodes minimum) for cluster coordination
- Persistent volume claims for index data
- AKS node pool: D4s_v5 or larger, 3 nodes minimum
- Consider Azure Cognitive Search as managed alternative

### Azure Cognitive Search (Alternative)
- Sitecore provides Azure Search module for compatible versions
- Standard tier minimum (S1 or higher) for production
- Limitations: Custom Solr plugins won't work, some advanced search features differ
- Benefits: Fully managed, no infrastructure to maintain

## Identity & Access Management

### Managed Identity
- **System-assigned**: Use for single-purpose resources (each Sitecore VM gets its own identity). Lifecycle tied to the resource — deleted when VM is deleted
- **User-assigned**: Use for shared access patterns (e.g., multiple CD instances accessing the same Key Vault and SQL MI). Lifecycle independent — persists across resource recreation
- **Recommendation**: Use user-assigned Managed Identity for Sitecore role groups (one identity per role type: CM, CD, xConnect) to simplify access policy management and VM reprovisioning
- **SQL MI access**: Configure Azure AD authentication on SQL MI and grant Managed Identity the `db_datareader`/`db_datawriter` roles per Sitecore database — eliminates password-based connection strings
- **Key Vault access**: Grant Managed Identity `Key Vault Secrets User` RBAC role (preferred) or configure access policies for secret read access

### Azure Key Vault
- **Secrets management**: Store all Sitecore connection strings, API keys, and service credentials in Key Vault
- **Certificate storage**: Upload all SSL/TLS certificates (CM, CD, xConnect client certs, Identity Server) to Key Vault
- **Certificate rotation**: Enable auto-renewal for Key Vault-generated certificates. For imported certificates (third-party CA), configure rotation policies with alerts at 30/60/90 days before expiry
- **xConnect certificates**: xConnect client certificate thumbprints are referenced in Sitecore config. When rotating, update both the Key Vault certificate and the Sitecore `AppSettings.config` thumbprint reference. Automate with a Key Vault Event Grid notification → Azure Function that updates config
- **Configuration provider**: Use the Azure Key Vault configuration provider for .NET to inject secrets at runtime instead of storing them in `ConnectionStrings.config` files on disk
- **Access model**: Prefer Azure RBAC for Key Vault over legacy access policies. RBAC supports condition-based access and is consistent with other Azure resource permissions

### Application Gateway WAF for Sitecore

#### Recommended WAF Rules
- Enable OWASP Core Rule Set (CRS) 3.2+ on Application Gateway WAF v2
- **Sitecore-specific exclusions** (required to avoid false positives):
  - Exclude request body inspection for `/sitecore/shell/` paths (CM admin uses complex POST bodies)
  - Exclude rule 942430 (SQL injection detection) for Sitecore Experience Editor requests containing rendering parameters
  - Exclude rules 920230/920240 for requests to `/sitecore/api/` (Sitecore API uses non-standard content types)
  - Exclude rule 941100 for `/sitecore/shell/Applications/` (admin UI contains inline scripts)
- **Custom rules**:
  - Block direct access to `/App_Config/`, `/App_Data/`, `/temp/` paths from external traffic
  - Rate-limit `/sitecore/login` to prevent brute-force attacks (max 10 requests/minute per IP)
  - Geo-restrict CM access to allowed countries if CMS users are in known regions
- **Mode**: Start in Detection mode during migration testing, switch to Prevention mode after validating no false positives on Sitecore traffic

---

## SSL/TLS Requirements

### Certificates
- SSL certificates for all Sitecore roles (CM, CD, xConnect, Identity)
- xConnect requires client certificate for authentication between services
- Azure Key Vault recommended for certificate storage and rotation
- Application Gateway can handle SSL termination for CD

### Requirements
- TLS 1.2 minimum (Sitecore 10.x requirement)
- SHA-256 or higher certificate signatures
- SAN certificates recommended for multi-role deployments

## Monitoring Requirements

### Application Insights
- Sitecore has built-in Application Insights integration (Sitecore module)
- Instrument CM, CD, xConnect, and Identity Server
- Custom telemetry for Sitecore-specific metrics (publish times, cache hit rates)
- Log Analytics workspace for centralized log aggregation

### Azure Monitor
- VM metrics: CPU, memory, disk IOPS, network
- SQL MI metrics: DTU/vCore usage, storage, deadlocks
- Redis metrics: cache hits/misses, connection count, memory usage
- Custom alerts for Sitecore health (keepalive, publish queue depth)

## Backup and DR Requirements

### Azure Backup
- Daily VM backups with 30-day retention minimum
- SQL MI automated backups (point-in-time restore, 7-35 day retention)
- Geo-redundant backup storage for DR

### DR Options
- **Azure Site Recovery**: VM-level replication to secondary region
- **SQL MI geo-replication**: Auto-failover groups for database DR
- **Solr**: Index rebuild capability (backup optional if rebuild time acceptable)
- **RTO/RPO targets**: Typical Sitecore deployments target 4hr RTO / 1hr RPO
