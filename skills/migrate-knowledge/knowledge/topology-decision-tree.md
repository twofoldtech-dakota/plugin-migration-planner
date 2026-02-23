# Topology Decision Trees

Decision guides for key architectural choices during AWS-to-Azure Sitecore XP migration.

---

## 1. Sitecore Topology Selection

```
Is xConnect/xDB enabled (analytics, personalization)?
├── No
│   ├── Single server (dev/small site)?
│   │   └── XM Single
│   └── Separate CM and CD roles?
│       └── XM Scaled
└── Yes → XP Scaled
    └── Note: XP topologies include Processing, Reporting, xConnect Search roles
```

### Quick Reference

| Signal | Topology | Key Implication |
|--------|----------|-----------------|
| No analytics, no personalization | XM Single / XM Scaled | Simpler migration, fewer databases |
| Analytics and personalization enabled | XP Scaled | xDB shards, xConnect services, Processing role |

---

## 2. Azure Hosting Model: IaaS vs PaaS

```
Does the environment use custom Solr plugins or non-standard Solr config?
├── Yes → IaaS (VMs) required for Solr
│
Does the application use CLR assemblies, linked servers, or SQL Agent jobs?
├── Yes → IaaS or SQL Managed Instance (not Azure SQL Database)
│
Is the team experienced with Azure App Service and PaaS patterns?
├── No → IaaS (VMs) — lower migration risk, more familiar operational model
├── Yes
│   ├── Is this Sitecore 10.x running on .NET Framework?
│   │   ├── Yes → IaaS (VMs) recommended
│   │   │   PaaS for .NET Framework Sitecore is possible but requires
│   │   │   Azure Toolkit WDP packaging and has operational quirks
│   │   └── No (containerized / .NET Core headless) → PaaS viable
│   └── Are there strict compliance requirements (PCI, SOC2)?
│       ├── Yes → IaaS gives more control over security hardening
│       └── No → Either IaaS or PaaS depending on team preference
```

### Decision Summary

| Factor | IaaS (VMs) | PaaS (App Service) |
|--------|------------|-------------------|
| **Best for** | Most Sitecore XP migrations | Sitecore SaaS/headless or simple XM |
| **Migration complexity** | Lower — closer to lift-and-shift | Higher — requires packaging changes |
| **Operational overhead** | Higher — OS patching, scaling config | Lower — managed platform |
| **Sitecore compatibility** | Full compatibility | Partial — some features limited |
| **Cost model** | VM-based (always on) | Consumption or App Service Plan |
| **Recommendation** | Default choice for XP IaaS→IaaS migration | Consider only for greenfield or XM-only |

---

## 3. Search Platform Selection

```
Are there custom Solr plugins, custom tokenizers, or custom query components?
├── Yes → Solr on Azure VM or AKS (Cognitive Search cannot run custom plugins)
├── No
│   ├── Is the deployment SolrCloud (multi-node)?
│   │   ├── Yes
│   │   │   ├── Team has Kubernetes experience?
│   │   │   │   ├── Yes → Solr on AKS (managed orchestration)
│   │   │   │   └── No → Solr on Azure VMs (simpler ops)
│   │   │   └── Consider: SearchStax (managed SolrCloud) if budget allows
│   │   └── No (standalone Solr)
│   │       ├── Want to eliminate Solr operational burden?
│   │       │   ├── Yes → Azure Cognitive Search (with Sitecore module)
│   │       │   │   Note: Test all search features — some advanced
│   │       │   │   Solr query syntax does not translate directly
│   │       │   └── No → Solr on Azure VM (simplest migration path)
│   │       └── Index size > 50 GB?
│   │           ├── Yes → Solr on Azure VM with Premium SSD / Ultra Disk
│   │           └── No → Any option viable
```

### Decision Summary

| Factor | Solr on VM | Solr on AKS | Azure Cognitive Search |
|--------|-----------|-------------|----------------------|
| **Migration effort** | Lowest | Medium | Highest (config rewrite) |
| **Operational overhead** | High (manual patching, monitoring) | Medium (K8s managed) | Lowest (fully managed) |
| **Custom plugins** | Supported | Supported | Not supported |
| **SolrCloud** | Manual cluster management | Managed via K8s | N/A |
| **Cost** | VM cost + management time | AKS node cost | Per-query/index pricing |
| **Rebuild time** | Same as source | Same as source | May differ |
| **Recommendation** | Default for lift-and-shift | When SolrCloud + K8s skills exist | When simplicity > customization |

---

## 4. Database Target Selection

```
Does the application use CLR assemblies?
├── Yes → SQL Managed Instance or SQL Server on VM
│
Does the application use cross-database queries?
├── Yes → SQL Managed Instance or SQL Server on VM
│
Does the application use SQL Agent jobs?
├── Yes → SQL Managed Instance (Agent supported) or SQL Server on VM
│
Is the total database size > 16 TB?
├── Yes → SQL Server on VM (SQL MI max 16 TB)
│
None of the above?
├── SQL Managed Instance (recommended default)
│   ├── Need HA? → Business Critical tier (built-in Always On)
│   └── Cost-sensitive? → General Purpose tier
│
Special case: xDB shard databases
├── Custom shard maps? → Requires manual shard map recreation on MI
└── Standard 2-shard? → MI elastic pools work well
```

### Decision Summary

| Factor | Azure SQL MI | SQL Server on VM |
|--------|-------------|-----------------|
| **Compatibility** | ~99% SQL Server compat | 100% SQL Server compat |
| **CLR / Linked Servers** | Supported | Supported |
| **Max size** | 16 TB | Disk-limited |
| **HA** | Built-in (Business Critical) | Manual Always On AG setup |
| **Patching** | Automated | Manual |
| **Cost** | vCore-based pricing | VM + SQL license |
| **Recommendation** | Default for most Sitecore migrations | Fallback when MI has a gap |

---

## 5. Caching Tier Selection

```
Current ElastiCache cluster mode?
├── Cluster-mode enabled
│   ├── Azure Cache for Redis Enterprise (best compatibility)
│   └── Azure Cache for Redis Premium with clustering
├── Cluster-mode disabled
│   ├── Data size > 53 GB?
│   │   ├── Yes → Premium P4+ or Enterprise
│   │   └── No
│   │       ├── Need VNet integration?
│   │       │   ├── Yes → Premium tier (VNet injection supported)
│   │       │   └── No → Standard tier may suffice
│   │       └── Need persistence (AOF/RDB)?
│   │           ├── Yes → Premium tier
│   │           └── No → Standard tier
└── Custom Lua scripts?
    ├── Yes → Test on Premium tier first. Enterprise if compatibility issues.
    └── No → Standard/Premium based on above criteria
```
