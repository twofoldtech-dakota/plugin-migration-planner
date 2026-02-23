# MigrateIQ Platform Expansion Plan

> **Status:** Planning
> **Created:** 2026-02-22
> **Last Updated:** 2026-02-22
> **Goal:** Evolve MigrateIQ from a Sitecore-only migration tool into a **universal digital experience migration platform** supporting any CMS, cloud infrastructure, MarTech stack, commerce platform, AI/ML tooling, data infrastructure, or custom software migration.

---

## Table of Contents

1. [Vision](#vision)
2. [Architecture: Layered Composition](#architecture-layered-composition)
3. [Research Progress Tracker](#research-progress-tracker)
4. [Knowledge Quality Gap Analysis](#knowledge-quality-gap-analysis)
5. [Knowledge Base Structure](#knowledge-base-structure)
6. [Platform Catalog](#platform-catalog)
7. [Infrastructure Catalog](#infrastructure-catalog)
8. [Supporting Services Catalog](#supporting-services-catalog)
9. [MarTech Catalog](#martech-catalog)
10. [AI & Development Tools Catalog](#ai--development-tools-catalog)
11. [Data & Commerce Infrastructure Catalog](#data--commerce-infrastructure-catalog)
12. [Migration Paths](#migration-paths)
13. [Knowledge URL Registry](#knowledge-url-registry)
14. [Research Agent Team](#research-agent-team)
15. [Implementation Phases](#implementation-phases)
16. [Design Decisions](#key-design-decisions)
17. [Success Metrics](#success-metrics)
18. [Risk Register](#risk-register)

---

## Research Progress Tracker

> **Progress:** 3/300 packs researched | 1/80+ migration paths researched
> **Last batch run:** N/A
> **Use:** `/migrate research <platform>` for single | `/migrate research-batch` for bulk

### Tier 1 — Core Platforms (Priority: Immediate)

#### CMS / DXP Platforms

- [x] `sitecore-xp` — Sitecore Experience Platform *(seeded from hand-built knowledge)*
- [ ] `sitecore-ai` — Sitecore XM Cloud / SitecoreAI
- [ ] `optimizely` — Optimizely CMS
- [ ] `kentico` — Xperience by Kentico
- [ ] `adobe-aem` — Adobe Experience Manager
- [ ] `acquia-drupal` — Drupal (Acquia)
- [ ] `wordpress` — WordPress / WordPress VIP
- [ ] `umbraco` — Umbraco
- [ ] `contentful` — Contentful
- [ ] `contentstack` — Contentstack
- [ ] `sanity` — Sanity

#### Infrastructure

- [x] `aws` — Amazon Web Services *(seeded)*
- [x] `azure` — Microsoft Azure *(seeded)*
- [ ] `gcp` — Google Cloud Platform
- [ ] `vercel` — Vercel
- [ ] `netlify` — Netlify
- [ ] `cloudflare` — Cloudflare Pages/Workers

#### Core Supporting Services

- [ ] `solr` — Apache Solr
- [ ] `elasticsearch` — Elasticsearch
- [ ] `azure-ai-search` — Azure AI Search
- [ ] `redis` — Redis
- [ ] `sql-server` — SQL Server / Azure SQL / SQL MI
- [ ] `postgresql` — PostgreSQL
- [ ] `mongodb` — MongoDB
- [ ] `entra-id` — Microsoft Entra ID
- [ ] `auth0` — Auth0 (Okta)

### Tier 2 — Extended Platforms (Priority: Near-term)

#### CMS / DXP Platforms

- [ ] `bloomreach` — Bloomreach
- [ ] `coremedia` — CoreMedia
- [ ] `magnolia` — Magnolia CMS
- [ ] `crownpeak` — Crownpeak (FirstSpirit)
- [ ] `strapi` — Strapi
- [ ] `hygraph` — Hygraph

#### E-Commerce

- [ ] `shopify-plus` — Shopify Plus
- [ ] `adobe-commerce` — Adobe Commerce (Magento)
- [ ] `salesforce-commerce` — Salesforce Commerce Cloud
- [ ] `commercetools` — commercetools
- [ ] `elastic-path` — Elastic Path
- [ ] `spryker` — Spryker
- [ ] `bigcommerce` — BigCommerce
- [ ] `woocommerce` — WooCommerce

#### Frameworks

- [ ] `nextjs` — Next.js
- [ ] `nuxtjs` — Nuxt.js
- [ ] `astro` — Astro
- [ ] `sveltekit` — SvelteKit
- [ ] `remix` — Remix / React Router v7
- [ ] `gatsby` — Gatsby
- [ ] `custom` — Custom / Bespoke

#### Legacy Platforms

- [ ] `ektron` — Ektron
- [ ] `sitefinity` — Sitefinity
- [ ] `dnn` — DNN (DotNetNuke)
- [ ] `episerver` — Episerver (pre-rebrand)
- [ ] `sdl-tridion` — SDL Tridion (RWS Tridion Sites)
- [ ] `opentext-teamsite` — OpenText TeamSite

#### Infrastructure

- [ ] `oracle-cloud` — Oracle Cloud Infrastructure
- [ ] `fastly` — Fastly
- [ ] `heroku` — Heroku
- [ ] `railway` — Railway
- [ ] `render` — Render
- [ ] `fly-io` — Fly.io
- [ ] `digitalocean` — DigitalOcean App Platform
- [ ] `kubernetes` — Kubernetes (EKS/AKS/GKE/self-managed)
- [ ] `openshift` — Red Hat OpenShift
- [ ] `sitecore-managed-cloud` — Sitecore Managed Cloud
- [ ] `on-prem` — On-premises / Self-hosted
- [ ] `colocation` — Colocation

#### Supporting Services — Search

- [ ] `opensearch` — OpenSearch
- [ ] `algolia` — Algolia
- [ ] `typesense` — Typesense
- [ ] `meilisearch` — Meilisearch
- [ ] `coveo` — Coveo

#### Supporting Services — Cache

- [ ] `valkey` — Valkey
- [ ] `dragonfly` — Dragonfly
- [ ] `memcached` — Memcached
- [ ] `varnish` — Varnish

#### Supporting Services — Database

- [ ] `mysql` — MySQL / MariaDB
- [ ] `cosmosdb` — Azure Cosmos DB
- [ ] `dynamodb` — Amazon DynamoDB
- [ ] `aurora` — Amazon Aurora
- [ ] `supabase` — Supabase
- [ ] `neon` — Neon
- [ ] `planetscale` — PlanetScale
- [ ] `cockroachdb` — CockroachDB

#### Supporting Services — Message Queues / Events

- [ ] `rabbitmq` — RabbitMQ
- [ ] `kafka` — Apache Kafka
- [ ] `azure-service-bus` — Azure Service Bus
- [ ] `aws-sqs` — Amazon SQS / SNS
- [ ] `nats` — NATS

#### Supporting Services — Email / SMTP

- [ ] `sendgrid` — SendGrid (Twilio)
- [ ] `aws-ses` — Amazon SES
- [ ] `postmark` — Postmark
- [ ] `mailgun` — Mailgun
- [ ] `azure-comms` — Azure Communication Services
- [ ] `resend` — Resend

#### Supporting Services — Identity / Auth

- [ ] `okta` — Okta
- [ ] `cognito` — AWS Cognito
- [ ] `keycloak` — Keycloak
- [ ] `duende-identityserver` — Duende IdentityServer
- [ ] `clerk` — Clerk

#### Supporting Services — CDN

- [ ] `cloudfront` — AWS CloudFront
- [ ] `azure-front-door` — Azure Front Door
- [ ] `cloudflare-cdn` — Cloudflare CDN
- [ ] `akamai` — Akamai
- [ ] `fastly-cdn` — Fastly CDN

#### Supporting Services — Monitoring / Observability

- [ ] `datadog` — Datadog
- [ ] `new-relic` — New Relic
- [ ] `dynatrace` — Dynatrace
- [ ] `application-insights` — Azure Application Insights
- [ ] `cloudwatch` — AWS CloudWatch
- [ ] `grafana` — Grafana + Loki/Mimir/Tempo
- [ ] `prometheus` — Prometheus
- [ ] `splunk` — Splunk
- [ ] `elastic-observability` — Elastic Observability (ELK)
- [ ] `sentry` — Sentry

#### Supporting Services — CI/CD

- [ ] `github-actions` — GitHub Actions
- [ ] `azure-devops` — Azure DevOps Pipelines
- [ ] `jenkins` — Jenkins
- [ ] `gitlab-ci` — GitLab CI/CD
- [ ] `circleci` — CircleCI
- [ ] `bitbucket-pipelines` — Bitbucket Pipelines
- [ ] `octopus-deploy` — Octopus Deploy

#### Supporting Services — Storage / Media

- [ ] `s3` — Amazon S3
- [ ] `azure-blob` — Azure Blob Storage
- [ ] `gcs` — Google Cloud Storage
- [ ] `cloudflare-r2` — Cloudflare R2
- [ ] `minio` — MinIO
- [ ] `cloudinary` — Cloudinary
- [ ] `imgix` — Imgix

#### Supporting Services — DNS

- [ ] `route53` — AWS Route 53
- [ ] `azure-dns` — Azure DNS
- [ ] `cloudflare-dns` — Cloudflare DNS

#### Supporting Services — WAF / Security

- [ ] `cloudflare-waf` — Cloudflare WAF
- [ ] `aws-waf` — AWS WAF
- [ ] `azure-waf` — Azure WAF
- [ ] `akamai-waf` — Akamai App & API Protector
- [ ] `imperva` — Imperva (Thales)

### Tier 3 — MarTech (Priority: Medium-term)

#### Marketing Automation

- [ ] `hubspot` — HubSpot Marketing Hub
- [ ] `marketo` — Marketo Engage
- [ ] `pardot` — Account Engagement (Pardot)
- [ ] `mailchimp` — Mailchimp
- [ ] `activecampaign` — ActiveCampaign
- [ ] `klaviyo` — Klaviyo
- [ ] `brevo` — Brevo
- [ ] `iterable` — Iterable
- [ ] `customer-io` — Customer.io
- [ ] `drip` — Drip

#### CRM

- [ ] `salesforce-crm` — Salesforce
- [ ] `hubspot-crm` — HubSpot CRM
- [ ] `dynamics-365-crm` — Dynamics 365
- [ ] `zoho-crm` — Zoho CRM
- [ ] `pipedrive` — Pipedrive
- [ ] `monday-crm` — monday CRM

#### Analytics

- [ ] `google-analytics` — Google Analytics 4
- [ ] `adobe-analytics` — Adobe Analytics
- [ ] `mixpanel` — Mixpanel
- [ ] `amplitude` — Amplitude
- [ ] `heap` — Heap
- [ ] `hotjar` — Hotjar
- [ ] `fullstory` — FullStory
- [ ] `pendo` — Pendo
- [ ] `posthog` — PostHog
- [ ] `plausible` — Plausible

#### Customer Data Platform (CDP)

- [ ] `segment` — Twilio Segment
- [ ] `tealium` — Tealium
- [ ] `mparticle` — mParticle
- [ ] `sitecore-cdp` — Sitecore CDP
- [ ] `adobe-rtcdp` — Adobe Real-Time CDP
- [ ] `bloomreach-engagement` — Bloomreach Engagement
- [ ] `rudderstack` — RudderStack
- [ ] `hightouch` — Hightouch

#### Personalization / Experimentation

- [ ] `optimizely-experimentation` — Optimizely Experimentation
- [ ] `adobe-target` — Adobe Target
- [ ] `dynamic-yield` — Dynamic Yield
- [ ] `vwo` — VWO
- [ ] `launchdarkly-experimentation` — LaunchDarkly
- [ ] `kameleoon` — Kameleoon
- [ ] `ab-tasty` — AB Tasty

#### Digital Asset Management (DAM)

- [ ] `bynder` — Bynder
- [ ] `brandfolder` — Brandfolder
- [ ] `cloudinary-dam` — Cloudinary DAM
- [ ] `aem-assets` — AEM Assets
- [ ] `sitecore-content-hub` — Sitecore Content Hub
- [ ] `acquia-dam` — Acquia DAM
- [ ] `canto` — Canto
- [ ] `frontify` — Frontify

#### Tag Management

- [ ] `google-tag-manager` — Google Tag Manager
- [ ] `tealium-iq` — Tealium iQ
- [ ] `adobe-launch` — Adobe Experience Platform Tags

#### Translation / Localization

- [ ] `smartling` — Smartling
- [ ] `transifex` — Transifex
- [ ] `lokalise` — Lokalise
- [ ] `phrase` — Phrase (Memsource)
- [ ] `crowdin` — Crowdin

#### SEO Tools

- [ ] `semrush` — Semrush
- [ ] `ahrefs` — Ahrefs
- [ ] `moz` — Moz Pro
- [ ] `screaming-frog` — Screaming Frog
- [ ] `brightedge` — BrightEdge

#### Consent / Privacy

- [ ] `onetrust` — OneTrust
- [ ] `cookiebot` — Cookiebot (Usercentrics)
- [ ] `osano` — Osano
- [ ] `iubenda` — iubenda
- [ ] `trustarc` — TrustArc

#### Chat / Conversational

- [ ] `intercom` — Intercom
- [ ] `drift` — Drift (Salesloft)
- [ ] `zendesk` — Zendesk
- [ ] `freshdesk` — Freshdesk (Freshworks)
- [ ] `tidio` — Tidio

#### Social Media Management

- [ ] `hootsuite` — Hootsuite
- [ ] `sprout-social` — Sprout Social
- [ ] `buffer` — Buffer
- [ ] `later` — Later

#### Forms / Surveys

- [ ] `typeform` — Typeform
- [ ] `jotform` — Jotform
- [ ] `surveymonkey` — SurveyMonkey (Momentive)
- [ ] `qualtrics` — Qualtrics

#### Loyalty / Rewards

- [ ] `yotpo-loyalty` — Yotpo Loyalty
- [ ] `smile-io` — Smile.io
- [ ] `loyaltylion` — LoyaltyLion

#### Reviews / UGC

- [ ] `yotpo-reviews` — Yotpo Reviews
- [ ] `bazaarvoice` — Bazaarvoice
- [ ] `trustpilot` — Trustpilot
- [ ] `power-reviews` — PowerReviews

### Tier 4 — AI, Dev Tools & Data Infrastructure (Priority: Medium-term)

#### AI Model Providers

- [ ] `anthropic` — Anthropic (Claude)
- [ ] `openai` — OpenAI (GPT)
- [ ] `google-ai` — Google (Gemini)
- [ ] `mistral` — Mistral AI
- [ ] `cohere` — Cohere
- [ ] `meta-ai` — Meta (Llama)
- [ ] `xai` — xAI (Grok)
- [ ] `amazon-nova` — Amazon Nova
- [ ] `deepseek` — DeepSeek

#### AI Coding & Development Tools

- [ ] `claude-code` — Claude Code
- [ ] `github-copilot` — GitHub Copilot
- [ ] `cursor` — Cursor
- [ ] `windsurf` — Windsurf (Codeium)
- [ ] `amazon-q` — Amazon Q Developer

#### Agent Frameworks

- [ ] `langchain` — LangChain
- [ ] `langgraph` — LangGraph
- [ ] `crewai` — CrewAI
- [ ] `ms-agent-framework` — Microsoft Agent Framework
- [ ] `anthropic-sdk` — Anthropic SDK (Agent)
- [ ] `openai-sdk` — OpenAI Agents SDK
- [ ] `vercel-ai-sdk` — Vercel AI SDK
- [ ] `pydantic-ai` — PydanticAI

#### Vector Databases

- [ ] `pinecone` — Pinecone
- [ ] `weaviate` — Weaviate
- [ ] `qdrant` — Qdrant
- [ ] `chroma` — Chroma
- [ ] `milvus` — Milvus
- [ ] `pgvector` — pgvector

#### RAG & Search

- [ ] `llamaindex` — LlamaIndex
- [ ] `haystack` — Haystack (deepset)
- [ ] `vectara` — Vectara

#### MCP Ecosystem

- [ ] `mcp-protocol` — Model Context Protocol

#### AI Orchestration / Inference

- [ ] `together-ai` — Together AI
- [ ] `replicate` — Replicate
- [ ] `modal` — Modal
- [ ] `groq` — Groq

#### Feature Management

- [ ] `launchdarkly` — LaunchDarkly
- [ ] `statsig` — Statsig (OpenAI)
- [ ] `split-io` — Split (Harness)

#### Accessibility

- [ ] `siteimprove` — Siteimprove
- [ ] `deque-axe` — axe DevTools / axe Monitor
- [ ] `level-access` — Level Access
- [ ] `audioeye` — AudioEye

#### Design & Prototyping

- [ ] `figma` — Figma
- [ ] `storybook` — Storybook

#### Performance Testing

- [ ] `lighthouse` — Lighthouse
- [ ] `speedcurve` — SpeedCurve
- [ ] `debugbear` — DebugBear

#### Workflow / Project Management

- [ ] `jira` — Jira
- [ ] `linear` — Linear
- [ ] `notion` — Notion
- [ ] `clickup` — ClickUp

#### PIM (Product Information Management)

- [ ] `akeneo` — Akeneo PIM
- [ ] `salsify` — Salsify
- [ ] `inriver` — inriver
- [ ] `pimcore` — Pimcore

#### ERP Integration

- [ ] `sap` — SAP S/4HANA
- [ ] `netsuite` — NetSuite (Oracle)
- [ ] `dynamics-365-erp` — Dynamics 365 F&O/BC

#### Data Warehousing

- [ ] `snowflake` — Snowflake
- [ ] `databricks` — Databricks
- [ ] `bigquery` — BigQuery
- [ ] `redshift` — Amazon Redshift
- [ ] `clickhouse` — ClickHouse
- [ ] `apache-iceberg` — Apache Iceberg

#### ETL / Data Integration

- [ ] `fivetran` — Fivetran + dbt
- [ ] `airbyte` — Airbyte
- [ ] `airflow` — Apache Airflow
- [ ] `dagster` — Dagster
- [ ] `prefect` — Prefect

#### Payments

- [ ] `stripe` — Stripe
- [ ] `adyen` — Adyen
- [ ] `paypal` — PayPal / Braintree
- [ ] `square` — Square
- [ ] `worldpay` — Worldpay

### Migration Paths Progress

#### CMS Migrations

- [ ] Sitecore XP → Sitecore XM Cloud (AI)
- [ ] Sitecore XP → Optimizely
- [ ] Sitecore XP → Contentful + headless
- [ ] Sitecore XP → Custom headless
- [ ] Optimizely → Sitecore XM Cloud
- [ ] Optimizely CMS → Optimizely SaaS
- [ ] Episerver → Optimizely
- [ ] WordPress → Headless WP + Next.js
- [ ] WordPress → Contentful/Sanity/Strapi
- [ ] Drupal 7/8 → Drupal 10/11
- [ ] Drupal → Headless CMS
- [ ] AEM on-prem → AEM Cloud Service
- [ ] Ektron → Anything
- [ ] Sitefinity → Sitecore/Optimizely/Headless
- [ ] DNN → Modern CMS
- [ ] Kentico → Xperience by Kentico
- [ ] SDL Tridion → Headless CMS

#### Version Upgrades

- [ ] Sitecore 9.x → 10.x
- [ ] Sitecore 10.x → XM Cloud
- [ ] Umbraco 8 → 10 → 13 → 14+
- [ ] Drupal 7 → 10/11
- [ ] Kentico 12 → Xperience by Kentico
- [ ] Optimizely CMS 11 → 12
- [ ] .NET Framework → .NET 8+

#### Cloud Infrastructure

- [x] AWS → Azure *(seeded — partial, needs re-research)*
- [ ] Azure → AWS
- [ ] On-prem → AWS
- [ ] On-prem → Azure
- [ ] On-prem → GCP
- [ ] Any Cloud → Multi-Cloud
- [ ] Traditional → Vercel/Netlify
- [ ] VMs → Kubernetes
- [ ] IaaS → PaaS
- [ ] Monolith → Microservices

#### E-Commerce

- [ ] Magento → Shopify Plus
- [ ] Magento → Adobe Commerce Cloud
- [ ] Magento → commercetools
- [ ] Salesforce Commerce → Shopify Plus
- [ ] WooCommerce → Shopify Plus
- [ ] Custom → commercetools/Elastic Path

#### MarTech

- [ ] Mailchimp → HubSpot
- [ ] Mailchimp → Klaviyo
- [ ] Marketo → HubSpot
- [ ] Pardot → HubSpot
- [ ] ActiveCampaign → HubSpot
- [ ] Salesforce → HubSpot CRM
- [ ] HubSpot CRM → Salesforce
- [ ] Dynamics 365 → Salesforce
- [ ] GA Universal → GA4
- [ ] GA4 → Privacy-first alternatives
- [ ] Adobe Analytics → Mixpanel/Amplitude
- [ ] No CDP → First CDP
- [ ] Segment → RudderStack
- [ ] Segment → Hightouch
- [ ] DMP → CDP
- [ ] Google Optimize → VWO/Optimizely/AB Tasty
- [ ] Custom rules → ML-based personalization
- [ ] SharePoint/filesystem → DAM
- [ ] Legacy DAM → Cloudinary

#### AI Adoption

- [ ] No AI → AI-powered features
- [ ] Traditional search → Semantic/vector search
- [ ] No agents → AI agent workflows
- [ ] Manual content → AI content generation
- [ ] Traditional analytics → AI-powered insights

#### Data Infrastructure

- [ ] On-prem DW → Snowflake
- [ ] On-prem DW → Databricks
- [ ] Manual ETL → Fivetran + dbt
- [ ] Manual ETL → Airbyte
- [ ] No MLOps → ML pipeline

#### Payment / Commerce Infrastructure

- [ ] Legacy payments → Stripe
- [ ] Single PSP → Multi-PSP
- [ ] Legacy PIM → Akeneo
- [ ] SAP ECC → S/4HANA

---

## Knowledge Quality Gap Analysis

> **Last audited:** 2026-02-22
> **Audited by:** Deep inspection of all 3 DB packs, 2 migration paths, 17 discovery dimensions, 120 questions, 22 effort components, 28 multipliers, 21 gotchas, 18 dependency chains

### Current State Summary

| Pack | Discovery | Effort | Multipliers | Gotchas | Chains | Roles | Phases | Source URLs |
|------|-----------|--------|-------------|---------|--------|-------|--------|-------------|
| `sitecore-xp` | 17 dims / 120 questions | 22 components | 28 | 21 | 18 | 5 | 5 | 0 |
| `aws` | **empty** | **empty** | **empty** | **empty** | **empty** | **empty** | **empty** | 0 |
| `azure` | **empty** | **empty** | **empty** | **empty** | **empty** | **empty** | **empty** | 0 |

Migration paths: `sitecore-xp-aws->azure` (deep, 16-category service map) + `aws->azure` (duplicate of same data)

### P0 — Architectural Defects (Must fix before any batch research)

These are structural problems that will propagate to every new pack if not fixed first.

- [ ] **GAP-001: Platform discovery tree is cloud-specific instead of generic**
  - All 120 Sitecore XP questions are AWS-specific: `compute_ec2_instance_type_cm`, `caching_redis_hosting` (ElastiCache options), `database_rds_instance_class`, `storage_s3_bucket_count`, etc.
  - Sitecore XP runs on AWS, Azure, GCP, and on-prem. The platform pack should ask about Sitecore architecture generically (roles, topology, version, customization depth). Cloud-specific questions belong in the infrastructure pack.
  - **Fix:** Refactor `sitecore-xp` discovery tree — split into platform-generic questions (Sitecore architecture, content, customizations) + move cloud-specific questions into `aws`/`azure`/etc. infrastructure pack discovery trees. Update the composition engine expectations if needed.
  - **Validate:** Create a test assessment with `source_stack.infrastructure: "azure"` and confirm composed tree produces Azure-specific infra questions, not AWS ones.

- [x] **GAP-002: AWS and Azure infrastructure packs are empty shells**
  - Both packs have metadata (name, category, deployment models) but zero discovery questions, zero effort hours, zero multipliers, zero gotchas, zero dependency chains, zero source URLs.
  - The entire layered composition model depends on infrastructure packs contributing cloud-specific questions and heuristics. Without them, composition produces only platform-layer data.
  - **Fix:** Run full research pipeline on `aws` and `azure` infrastructure packs. The cloud-specific questions currently inside `sitecore-xp` (from GAP-001) should move here.
  - **Validate:** Run `get_composed_discovery_tree` for an assessment with `sitecore-xp` + `aws` and confirm both platform and infra questions appear.

- [x] **GAP-003: Heuristic condition keys don't match discovery question IDs**
  - Multiplier conditions use shorthand: `cd_instance_count > 2`, `search.type == 'solr_cloud'`, `storage.media_size_gb > 50`
  - Actual discovery question IDs use namespaced format: `compute_cd_instance_count`, `search_provider`, `storage_media_total_size_gb`
  - The `/migrate analyze` skill bridges this manually, but automated heuristic matching (the "heuristic key coverage" quality gate in the research pipeline) cannot work.
  - **Fix:** Establish a naming convention. Either (a) update all heuristic conditions to reference actual question IDs (`compute_cd_instance_count > 2`), or (b) define a mapping layer in the analyze skill. Option (a) is cleaner long-term.
  - **Validate:** Run the pack quality gate from `SCHEMA.md` and confirm heuristic key coverage reports 100%.

### P1 — Missing Knowledge Dimensions (Directly impacts estimate accuracy)

These gaps cause migrations to be under-scoped because the discovery tree doesn't ask about key areas.

- [x] **GAP-004: No content & data volume dimension**
  - Missing questions: total page/item count, language count, content types, workflow complexity, publishing frequency, content tree depth.
  - Content volume is one of the biggest drivers of migration effort (data migration time, content model mapping, UAT effort). Without it, estimates miss the single largest variable.
  - **Fix:** Add `content_data` dimension to `sitecore-xp` discovery tree with 6-8 questions. Add corresponding effort components and multipliers for large content volumes.

- [x] **GAP-005: No customization depth dimension**
  - Missing questions: custom pipeline count, custom rendering count, config patch count, Helix layer structure, Glass Mapper / ORM usage, custom scheduled agents, custom event handlers.
  - Customization is the primary predictor of migration complexity. Two sites with identical infrastructure but different customization depths can differ by 3-5x in migration effort.
  - **Fix:** Add `customization` dimension with 8-10 questions covering code complexity, architecture patterns, and third-party dependencies.

- [x] **GAP-006: No frontend architecture dimension**
  - Missing questions: MVC vs JSS vs SXA, rendering host setup, frontend build pipeline, JavaScript framework (React/Vue/Angular), component library, design system.
  - Frontend approach determines whether a migration is a "lift and shift" or a "rebuild." JSS/headless vs MVC-only changes the entire estimate structure.
  - **Fix:** Add `frontend` dimension. The existing `jss_headless` multiplier references JSS but there's no discovery question to trigger it — only an inference rule.

- [x] **GAP-007: No team & timeline dimension**
  - Missing questions: team size, team experience with target platform, available parallel workstreams, hard deadline / freeze windows, training needs.
  - Team capacity and experience level directly affect timelines and may trigger training/ramp-up effort components.
  - **Fix:** Add `team_timeline` dimension with 5-6 questions. Add `team_inexperienced` multiplier for teams new to the target platform.

- [x] **GAP-008: No third-party module inventory dimension**
  - The `integrations_sitecore_modules` question exists but is a single select. Missing: module count, custom module forks, marketplace package versions, module compatibility with target.
  - Module compatibility is a common source of "surprise" effort. A single incompatible module can add 40+ hours.
  - **Fix:** Expand the `custom_integrations` dimension or create a dedicated `modules` dimension with questions about module count, custom vs marketplace, and version compatibility.

- [x] **GAP-009: No performance baselines dimension**
  - Missing questions: current page load times, TTFB, cache hit rates, publish duration, peak traffic volume, availability SLA.
  - Without baselines, there's no way to validate post-migration performance. Performance regression is the #1 reason for failed go-live decisions.
  - **Fix:** Add `performance` dimension with 5-6 questions. These feed into testing/validation effort and acceptance criteria.

- [ ] **GAP-010: No target platform packs exist**
  - The most common Sitecore migration targets (`sitecore-ai`, `optimizely`, `contentful`, `custom`) have no knowledge packs.
  - Cannot plan a migration without target knowledge. The Path Mapper agent can't run. The composition engine can't compose target-side questions or effort.
  - **Fix:** Run `/migrate research` on `sitecore-ai`, `optimizely`, `contentful` as top priority after P0 fixes.

### P2 — Data Quality Issues (Impact accuracy and traceability)

- [ ] **GAP-011: No version-specific knowledge in Sitecore XP pack**
  - `supported_versions` and `eol_versions` are empty on the `sitecore-xp` pack. No breaking changes between versions documented.
  - Sitecore 9.3 → Azure is a very different migration than Sitecore 10.3 → Azure (different .NET Framework requirements, different Identity Server versions, different xConnect APIs). Estimates should vary by source version.
  - **Fix:** Version Historian agent needs to populate version data. Add version-conditional multipliers (e.g., `sitecore_version < 10.0` → 1.3x multiplier for .NET Framework migration overhead).

- [ ] **GAP-012: Zero source URLs on all packs**
  - None of the 3 packs or 2 migration paths have source URLs. Every claim is unverifiable.
  - Undermines the Knowledge URL Registry design, client transparency, and freshness monitoring. The freshness checker has nothing to check.
  - **Fix:** Will be resolved when research agents run (they capture URLs automatically). For the hand-seeded Sitecore data, manually add key source URLs from the existing Sources section at the bottom of this document.

- [ ] **GAP-013: All questions are required, no tiering**
  - All 120 questions are `required_questions`, zero are `optional_questions`. No tier field (essential/standard/deep-dive).
  - Makes the tool heavyweight for quick assessments. An architect doing a rough estimate shouldn't need to answer 120 questions. Essential questions (topology, version, instance counts) should produce a rough estimate; deep-dive questions refine it.
  - **Fix:** Add `tier` field to discovery questions: `essential` (15-20 questions for rough estimate), `standard` (full required set), `deep` (optional precision questions). Update `/migrate discover` to support tier selection.

- [ ] **GAP-014: Duplicate migration path data**
  - `sitecore-xp-aws->azure` and `aws->azure` contain identical service maps, gotchas, and incompatibilities.
  - Data inconsistency risk — updates to one won't propagate to the other.
  - **Fix:** Delete `aws->azure` (the generic one). The Sitecore-specific path is the correct one since the service map contains Sitecore-specific notes. If a generic AWS→Azure path is needed later, create it without Sitecore references.

- [x] **GAP-015: Effort components are infrastructure-only**
  - All 22 effort components are about infrastructure migration (VMs, databases, networking, DNS). None cover content migration, code migration, frontend rebuild, training, or go-live planning.
  - Infrastructure is typically only 30-40% of total migration effort. Content migration, code changes, and testing make up the majority. Current estimates will systematically under-scope by 2-3x.
  - **Fix:** Add effort components: `content_migration` (per content type), `code_migration` (per custom module), `frontend_rebuild` (if changing rendering approach), `training` (per team), `go_live_planning` (per environment). These should be driven by the new dimensions from GAP-004 through GAP-009.

### P3 — Nice-to-have Improvements

- [ ] **GAP-016: No inference rules from heuristic conditions**
  - Inference rules exist on discovery dimensions (57 total) but they only infer question defaults from other question answers. None infer heuristic conditions from question answers.
  - The analyze skill has to manually map question answers to heuristic conditions. An automated inference layer would make the pipeline more reliable.
  - **Fix:** Low priority. Standardizing condition keys (GAP-003) is the better solution. Inference rules can be added later for complex derived conditions.

- [ ] **GAP-017: No research agent quality baseline**
  - The research agents have never been run against a real target. The Sitecore data was hand-seeded. Quality gates in `SCHEMA.md` are untested.
  - We don't know if the agents produce data at the right depth, or if the quality gates catch real problems.
  - **Fix:** Run `/migrate research Sitecore XP` as a live test and compare output to the hand-seeded data. Fix agent instructions based on gaps found.

### Resolution Order

The gaps have dependencies. This is the recommended fix order:

```
GAP-001 (split platform/infra)    ─── the core architectural fix
    │                                  establish correct naming convention
    │                                  as new question IDs are created
    │
    ├── GAP-003 (condition key naming) ─── clean up remaining mismatches
    │                                      after GAP-001 refactor
    │
    ├── GAP-004 (content dimension)       ┐
    ├── GAP-005 (customization dimension) │
    ├── GAP-006 (frontend dimension)      ├── new platform-level dimensions
    ├── GAP-007 (team/timeline dimension) │  (add to sitecore-xp pack)
    ├── GAP-008 (modules dimension)       │
    ├── GAP-009 (performance dimension)   ┘
    │
    ├── GAP-015 (non-infra effort components) ─── driven by new dimensions
    │
    ├── GAP-002 (research AWS/Azure infra packs) ─── infra questions now
    │        │                                       have a home
    │        └── GAP-014 (duplicate path) ─── quick fix, do alongside
    │
    └── GAP-010 (target platform packs)   ─── needs GAP-001 pattern
              │                               established first
              ├── GAP-011 (version data)      ─── filled by Version Historian
              ├── GAP-012 (source URLs)       ─── filled by all agents
              └── GAP-017 (agent quality test) ─── after all above

GAP-013 (question tiering)  ─── independent, can be done anytime
GAP-016 (inference rules)   ─── low priority, do last
```

---

## Vision

MigrateIQ is a **universal digital experience migration platform**. It handles everything from a single Umbraco version bump to a full enterprise tech stack migration across CMS, cloud, MarTech, commerce, AI/ML, data infrastructure, and custom software.

| Source | Target | Type | Layer |
|--------|--------|------|-------|
| Umbraco 12 | Umbraco 13 | Minor upgrade | CMS |
| Sitecore XP 10.4 | Sitecore AI (XM Cloud) | Major re-platform | CMS + Infra |
| Optimizely CMS 12 | Optimizely SaaS | Vendor SaaS migration | CMS |
| Sitecore AI | Custom Next.js + headless CMS | De-platform | CMS + Services |
| AWS infrastructure | Azure infrastructure | Cloud migration | Infrastructure |
| VMs on-prem | Kubernetes on Azure | Full stack modernization | Infrastructure |
| Magento | Shopify Plus | Commerce re-platform | Commerce |
| WooCommerce | commercetools + headless | Commerce modernization | Commerce |
| Mailchimp | HubSpot Marketing Hub | MarTech migration | MarTech |
| Marketo | HubSpot | Marketing automation swap | MarTech |
| GA Universal | GA4 + PostHog | Analytics modernization | MarTech |
| No CDP | Segment + RudderStack | CDP adoption | MarTech |
| Google Optimize (dead) | Optimizely/VWO/AB Tasty | Personalization migration | MarTech |
| Bynder | Cloudinary | DAM migration | MarTech |
| On-prem data warehouse | Snowflake / Databricks | Data modernization | Data |
| Manual ETL | Fivetran + dbt / Airbyte | ETL modernization | Data |
| No AI | Claude Code + AI agents | AI adoption | AI/Dev |
| Traditional search | Vector DB + semantic search | AI search upgrade | AI/Dev |
| Stripe v1 | Stripe + Adyen multi-PSP | Payment modernization | Commerce |
| Full DX stack | Full DX stack | Combined migration | All layers |

---

## Architecture: Layered Composition

### Stack Model

A client's digital experience environment is modeled as a stack of composable layers:

```
┌─────────────────────────────────────┐
│  CMS / Application Layer            │  Sitecore XP, Umbraco, Optimizely, custom Next.js, etc.
├─────────────────────────────────────┤
│  Commerce Layer                     │  Shopify Plus, commercetools, Magento, Stripe, Adyen
├─────────────────────────────────────┤
│  MarTech Layer                      │  HubSpot, Marketo, Segment, GA4, Optimizely Exp, Bynder
├─────────────────────────────────────┤
│  AI & Development Tools             │  Claude Code, AI agents, vector DBs, feature flags, PIM
├─────────────────────────────────────┤
│  Supporting Services                │  Search, cache, identity, CDN, monitoring, CI/CD
├─────────────────────────────────────┤
│  Data Layer                         │  SQL Server, Snowflake, PostgreSQL, Fivetran+dbt, Redis
├─────────────────────────────────────┤
│  Cloud Infrastructure               │  AWS, Azure, GCP, Vercel, on-prem, Kubernetes, hybrid
└─────────────────────────────────────┘
```

A migration can target **any or all layers** independently:
- "Upgrade Umbraco" = CMS layer only
- "Move to Azure" = infrastructure + services + data
- "Re-platform Sitecore XP to Sitecore AI on Azure" = all layers
- "Magento to Shopify Plus" = commerce + services + data
- "Mailchimp to HubSpot" = MarTech layer only
- "Add AI agents to workflow" = AI/Dev layer only
- "Full DX modernization" = every layer

### Assessment Data Model (Evolved)

Replace the current Sitecore-specific fields with a generic source/target stack model:

```
assessment
├── id
├── project_name
├── client_id / client_name
├── architect
├── project_path
├── target_timeline
├── environment_count
├── environments[]
├── status: discovery | analysis | estimate | refine
│
├── source_stack                      ← NEW: what the client has now
│   ├── platform: "sitecore-xp"      ← references a platform knowledge pack
│   ├── platform_version: "10.3"
│   ├── topology: "xp-scaled"        ← platform-specific topology (from pack)
│   ├── infrastructure: "aws"        ← references an infrastructure pack
│   └── services: ["solr", "redis", "sql-server", "ses"]
│
├── target_stack                      ← NEW: where they want to go
│   ├── platform: "sitecore-ai"
│   ├── platform_version: "latest"
│   ├── topology: "xm-cloud"
│   ├── infrastructure: "azure"
│   └── services: ["azure-search", "redis", "sql-mi", "azure-comms"]
│
├── migration_scope                   ← NEW: derived from source↔target delta
│   ├── type: "re-platform"          ← upgrade | re-platform | cloud-migration | de-platform
│   ├── layers_affected: ["platform", "infrastructure", "services", "data"]
│   └── complexity: "major"           ← minor | moderate | major | transformational
│
├── DEPRECATED: sitecore_version      ← migrated to source_stack.platform_version
├── DEPRECATED: topology              ← migrated to source_stack.topology
├── DEPRECATED: source_cloud          ← migrated to source_stack.infrastructure
├── DEPRECATED: target_cloud          ← migrated to target_stack.infrastructure
```

### Discovery Tree Composition

Instead of one monolithic `discovery-tree.json`, the discovery tree is composed at assessment creation:

```
Final discovery tree = base infrastructure dimensions
                     + source platform dimensions
                     + target platform dimensions (if different)
                     + migration path specific questions
```

Questions are deduplicated and ordered by priority. Platform-specific dimensions reference their knowledge pack.

---

## Knowledge Base Structure

### Directory Layout

```
skills/migrate-knowledge/
│
├── platforms/                          ← CMS / application platform packs
│   │
│   │  ── Enterprise DXP ──
│   ├── sitecore-xp/                   ← EXISTING (restructure)
│   ├── sitecore-ai/                   ← NEW (XM Cloud / SitecoreAI)
│   ├── optimizely/                    ← NEW (CMS 11, 12, SaaS)
│   ├── kentico/                       ← NEW (Xperience 13 + Xperience by Kentico)
│   ├── adobe-aem/                     ← NEW (AEM 6.5, AEMaaCS)
│   ├── acquia-drupal/                 ← NEW (Drupal 7–11)
│   ├── wordpress/                     ← NEW (WordPress VIP, standard)
│   ├── bloomreach/                    ← NEW
│   ├── coremedia/                     ← NEW
│   ├── magnolia/                      ← NEW
│   ├── crownpeak/                     ← NEW (FirstSpirit)
│   │
│   │  ── Headless CMS ──
│   ├── contentful/                    ← NEW
│   ├── contentstack/                  ← NEW
│   ├── sanity/                        ← NEW
│   ├── strapi/                        ← NEW
│   ├── hygraph/                       ← NEW (formerly GraphCMS)
│   │
│   │  ── E-Commerce ──
│   ├── shopify-plus/                  ← NEW
│   ├── adobe-commerce/                ← NEW (Magento)
│   ├── salesforce-commerce/           ← NEW (SFCC)
│   ├── commercetools/                 ← NEW
│   ├── elastic-path/                  ← NEW
│   ├── spryker/                       ← NEW
│   ├── bigcommerce/                   ← NEW
│   ├── woocommerce/                   ← NEW
│   │
│   │  ── Frameworks ──
│   ├── nextjs/                        ← NEW
│   ├── nuxtjs/                        ← NEW
│   ├── astro/                         ← NEW
│   ├── sveltekit/                     ← NEW
│   ├── remix/                         ← NEW (React Router v7)
│   ├── gatsby/                        ← NEW
│   ├── custom/                        ← NEW (bespoke / custom builds)
│   │
│   │  ── Legacy ──
│   ├── ektron/                        ← NEW (EOL, migration source only)
│   ├── sitefinity/                    ← NEW (Progress)
│   ├── umbraco/                       ← NEW
│   ├── dnn/                           ← NEW (DotNetNuke)
│   ├── episerver/                     ← NEW (pre-Optimizely rebrand)
│   ├── sdl-tridion/                   ← NEW (RWS Tridion Sites)
│   └── opentext-teamsite/             ← NEW
│
├── infrastructure/                     ← Cloud / hosting packs
│   │
│   │  ── Hyperscalers ──
│   ├── aws/                           ← EXISTING (restructure)
│   ├── azure/                         ← PARTIALLY EXISTS
│   ├── gcp/                           ← NEW
│   ├── oracle-cloud/                  ← NEW
│   │
│   │  ── Frontend / Edge Hosting ──
│   ├── vercel/                        ← NEW
│   ├── netlify/                       ← NEW
│   ├── cloudflare/                    ← NEW (Pages + Workers)
│   ├── fastly/                        ← NEW
│   │
│   │  ── PaaS ──
│   ├── heroku/                        ← NEW (declining — Salesforce froze dev Feb 2026)
│   ├── railway/                       ← NEW
│   ├── render/                        ← NEW
│   ├── fly-io/                        ← NEW
│   ├── digitalocean/                  ← NEW
│   │
│   │  ── Container Orchestration ──
│   ├── kubernetes/                    ← NEW (EKS, AKS, GKE, self-managed)
│   ├── openshift/                     ← NEW (Red Hat)
│   │
│   │  ── Vendor-Managed ──
│   ├── sitecore-managed-cloud/        ← NEW (MCS / MCP)
│   │
│   │  ── Traditional ──
│   ├── on-prem/                       ← NEW
│   └── colocation/                    ← NEW
│
├── services/                           ← Supporting service packs (by category)
│   │
│   │  ── Search ──
│   ├── solr/                          ← NEW (standalone + SolrCloud)
│   ├── elasticsearch/                 ← NEW
│   ├── opensearch/                    ← NEW
│   ├── azure-ai-search/              ← NEW (formerly Cognitive Search)
│   ├── algolia/                       ← NEW
│   ├── typesense/                     ← NEW
│   ├── meilisearch/                   ← NEW
│   ├── coveo/                         ← NEW
│   │
│   │  ── Cache ──
│   ├── redis/                         ← NEW (note: AGPLv3 from v8.0)
│   ├── valkey/                        ← NEW (Linux Foundation Redis fork)
│   ├── memcached/                     ← NEW
│   ├── varnish/                       ← NEW
│   ├── dragonfly/                     ← NEW (25x faster Redis alternative)
│   │
│   │  ── Database ──
│   ├── sql-server/                    ← NEW (on-prem, Azure SQL, SQL MI)
│   ├── postgresql/                    ← NEW
│   ├── mysql/                         ← NEW (+ MariaDB)
│   ├── mongodb/                       ← NEW
│   ├── cosmosdb/                      ← NEW
│   ├── dynamodb/                      ← NEW
│   ├── aurora/                        ← NEW
│   ├── supabase/                      ← NEW
│   ├── neon/                          ← NEW (acquired by Databricks May 2025)
│   ├── planetscale/                   ← NEW
│   ├── cockroachdb/                   ← NEW
│   │
│   │  ── Message Queues / Events ──
│   ├── rabbitmq/                      ← NEW
│   ├── kafka/                         ← NEW
│   ├── azure-service-bus/             ← NEW
│   ├── aws-sqs/                       ← NEW
│   ├── nats/                          ← NEW
│   │
│   │  ── Email / SMTP ──
│   ├── sendgrid/                      ← NEW
│   ├── aws-ses/                       ← NEW
│   ├── postmark/                      ← NEW
│   ├── mailgun/                       ← NEW
│   ├── azure-comms/                   ← NEW
│   ├── resend/                        ← NEW
│   │
│   │  ── Identity / Auth ──
│   ├── entra-id/                      ← NEW (formerly Azure AD)
│   ├── auth0/                         ← NEW (Okta)
│   ├── okta/                          ← NEW
│   ├── cognito/                       ← NEW
│   ├── keycloak/                      ← NEW (CNCF)
│   ├── duende-identityserver/         ← NEW (.NET)
│   ├── clerk/                         ← NEW
│   │
│   │  ── CDN ──
│   ├── cloudfront/                    ← NEW
│   ├── azure-front-door/             ← NEW (CDN + WAF + LB)
│   ├── cloudflare-cdn/               ← NEW
│   ├── akamai/                        ← NEW
│   ├── fastly-cdn/                    ← NEW
│   │
│   │  ── Monitoring / Observability ──
│   ├── datadog/                       ← NEW
│   ├── new-relic/                     ← NEW
│   ├── dynatrace/                     ← NEW
│   ├── application-insights/          ← NEW
│   ├── cloudwatch/                    ← NEW
│   ├── grafana/                       ← NEW (+ Loki, Mimir, Tempo)
│   ├── prometheus/                    ← NEW
│   ├── splunk/                        ← NEW
│   ├── elastic-observability/         ← NEW (ELK Stack)
│   ├── sentry/                        ← NEW
│   │
│   │  ── CI/CD ──
│   ├── github-actions/                ← NEW (~33% market share)
│   ├── azure-devops/                  ← NEW (~24% market share)
│   ├── jenkins/                       ← NEW (~14% market share)
│   ├── gitlab-ci/                     ← NEW
│   ├── circleci/                      ← NEW
│   ├── bitbucket-pipelines/           ← NEW
│   ├── octopus-deploy/                ← NEW (strong .NET/Sitecore presence)
│   │
│   │  ── Storage / Media ──
│   ├── s3/                            ← NEW
│   ├── azure-blob/                    ← NEW
│   ├── gcs/                           ← NEW
│   ├── cloudflare-r2/                 ← NEW (zero egress)
│   ├── minio/                         ← NEW (self-hosted S3-compatible)
│   ├── cloudinary/                    ← NEW (image/video optimization)
│   ├── imgix/                         ← NEW
│   │
│   │  ── DNS ──
│   ├── route53/                       ← NEW
│   ├── azure-dns/                     ← NEW
│   ├── cloudflare-dns/                ← NEW
│   │
│   │  ── WAF / Security ──
│   ├── cloudflare-waf/                ← NEW
│   ├── aws-waf/                       ← NEW
│   ├── azure-waf/                     ← NEW
│   ├── akamai-waf/                    ← NEW
│   └── imperva/                       ← NEW
│
├── martech/                            ← MarTech platform packs
│   │
│   │  ── Marketing Automation ──
│   ├── hubspot/                        ← NEW (Marketing Hub, Sales Hub, CMS Hub)
│   ├── marketo/                        ← NEW (Adobe Marketo Engage)
│   ├── pardot/                         ← NEW (Salesforce Marketing Cloud Account Engagement)
│   ├── mailchimp/                      ← NEW (Intuit Mailchimp)
│   ├── activecampaign/                 ← NEW
│   ├── klaviyo/                        ← NEW (E-commerce focused)
│   ├── brevo/                          ← NEW (formerly Sendinblue)
│   ├── iterable/                       ← NEW
│   ├── customer-io/                    ← NEW
│   ├── drip/                           ← NEW
│   │
│   │  ── CRM ──
│   ├── salesforce-crm/                 ← NEW (Sales Cloud, Service Cloud)
│   ├── hubspot-crm/                    ← NEW
│   ├── dynamics-365-crm/               ← NEW
│   ├── zoho-crm/                       ← NEW
│   ├── pipedrive/                      ← NEW
│   ├── monday-crm/                     ← NEW
│   │
│   │  ── Analytics ──
│   ├── google-analytics/               ← NEW (GA4)
│   ├── adobe-analytics/                ← NEW
│   ├── mixpanel/                       ← NEW
│   ├── amplitude/                      ← NEW
│   ├── heap/                           ← NEW
│   ├── hotjar/                         ← NEW (Heatmaps + recordings)
│   ├── fullstory/                      ← NEW
│   ├── pendo/                          ← NEW
│   ├── posthog/                        ← NEW (Open source, all-in-one)
│   ├── plausible/                      ← NEW (Privacy-first)
│   │
│   │  ── Customer Data Platform (CDP) ──
│   ├── segment/                        ← NEW (Twilio Segment)
│   ├── tealium/                        ← NEW
│   ├── mparticle/                      ← NEW
│   ├── sitecore-cdp/                   ← NEW (Boxever acquisition)
│   ├── adobe-rtcdp/                    ← NEW (Real-Time CDP)
│   ├── bloomreach-engagement/          ← NEW
│   ├── rudderstack/                    ← NEW (Open source, warehouse-native)
│   ├── hightouch/                      ← NEW (Reverse ETL / Composable CDP)
│   │
│   │  ── Personalization / Experimentation ──
│   ├── optimizely-experimentation/     ← NEW (Web Experimentation, Feature Experimentation)
│   ├── adobe-target/                   ← NEW
│   ├── dynamic-yield/                  ← NEW (Mastercard)
│   ├── vwo/                            ← NEW (Visual Website Optimizer)
│   ├── launchdarkly-experimentation/   ← NEW (Feature flags + experimentation)
│   ├── kameleoon/                      ← NEW
│   ├── ab-tasty/                       ← NEW
│   │
│   │  ── DAM (Digital Asset Management) ──
│   ├── bynder/                         ← NEW
│   ├── brandfolder/                    ← NEW (Smartsheet)
│   ├── cloudinary-dam/                 ← NEW (Media management + DAM)
│   ├── aem-assets/                     ← NEW (Adobe Experience Manager Assets)
│   ├── sitecore-content-hub/           ← NEW
│   ├── acquia-dam/                     ← NEW (Widen acquisition)
│   ├── canto/                          ← NEW
│   ├── frontify/                       ← NEW
│   │
│   │  ── Tag Management ──
│   ├── google-tag-manager/             ← NEW
│   ├── tealium-iq/                     ← NEW
│   ├── adobe-launch/                   ← NEW (Adobe Experience Platform Tags)
│   │
│   │  ── Translation / Localization ──
│   ├── smartling/                      ← NEW
│   ├── transifex/                      ← NEW
│   ├── lokalise/                       ← NEW
│   ├── phrase/                         ← NEW (formerly Memsource)
│   ├── crowdin/                        ← NEW
│   │
│   │  ── SEO Tools ──
│   ├── semrush/                        ← NEW
│   ├── ahrefs/                         ← NEW
│   ├── moz/                            ← NEW
│   ├── screaming-frog/                 ← NEW
│   ├── brightedge/                     ← NEW
│   │
│   │  ── Consent / Privacy ──
│   ├── onetrust/                       ← NEW
│   ├── cookiebot/                      ← NEW (Usercentrics)
│   ├── osano/                          ← NEW
│   ├── iubenda/                        ← NEW
│   ├── trustarc/                       ← NEW
│   │
│   │  ── Chat / Conversational ──
│   ├── intercom/                       ← NEW
│   ├── drift/                          ← NEW (Salesloft)
│   ├── zendesk/                        ← NEW
│   ├── freshdesk/                      ← NEW (Freshworks)
│   ├── tidio/                          ← NEW
│   │
│   │  ── Social Media Management ──
│   ├── hootsuite/                      ← NEW
│   ├── sprout-social/                  ← NEW
│   ├── buffer/                         ← NEW
│   ├── later/                          ← NEW
│   │
│   │  ── Forms / Surveys ──
│   ├── typeform/                       ← NEW
│   ├── jotform/                        ← NEW
│   ├── surveymonkey/                   ← NEW (Momentive)
│   ├── qualtrics/                      ← NEW
│   │
│   │  ── Loyalty / Rewards ──
│   ├── yotpo-loyalty/                  ← NEW
│   ├── smile-io/                       ← NEW
│   ├── loyaltylion/                    ← NEW
│   │
│   │  ── Reviews / UGC ──
│   ├── yotpo-reviews/                  ← NEW
│   ├── bazaarvoice/                    ← NEW
│   ├── trustpilot/                     ← NEW
│   └── power-reviews/                  ← NEW
│
├── ai-tools/                           ← AI, ML, and development tool packs
│   │
│   │  ── AI Model Providers ──
│   ├── anthropic/                      ← NEW (Claude Opus 4.6, Sonnet 4.6, Haiku 4.5)
│   ├── openai/                         ← NEW (GPT-4.1, o3, o4-mini)
│   ├── google-ai/                      ← NEW (Gemini 3.1)
│   ├── mistral/                        ← NEW
│   ├── cohere/                         ← NEW (Command A)
│   ├── meta-ai/                        ← NEW (Llama 4)
│   ├── xai/                            ← NEW (Grok 4)
│   ├── amazon-nova/                    ← NEW (Nova 2)
│   ├── deepseek/                       ← NEW
│   │
│   │  ── AI Coding & Development Tools ──
│   ├── claude-code/                    ← NEW (Anthropic CLI)
│   ├── github-copilot/                 ← NEW
│   ├── cursor/                         ← NEW
│   ├── windsurf/                       ← NEW (Codeium)
│   ├── amazon-q/                       ← NEW
│   │
│   │  ── Agent Frameworks ──
│   ├── langchain/                      ← NEW
│   ├── langgraph/                      ← NEW
│   ├── crewai/                         ← NEW
│   ├── ms-agent-framework/             ← NEW (Microsoft Agent Framework RC)
│   ├── anthropic-sdk/                  ← NEW (Claude agent SDK)
│   ├── openai-sdk/                     ← NEW (Agents SDK)
│   ├── vercel-ai-sdk/                  ← NEW
│   ├── pydantic-ai/                    ← NEW
│   │
│   │  ── Vector Databases ──
│   ├── pinecone/                       ← NEW
│   ├── weaviate/                       ← NEW
│   ├── qdrant/                         ← NEW
│   ├── chroma/                         ← NEW
│   ├── milvus/                         ← NEW
│   ├── pgvector/                       ← NEW
│   │
│   │  ── RAG & Search ──
│   ├── llamaindex/                     ← NEW
│   ├── haystack/                       ← NEW (deepset)
│   ├── vectara/                        ← NEW
│   │
│   │  ── MCP Ecosystem ──
│   ├── mcp-protocol/                   ← NEW (Model Context Protocol)
│   │
│   │  ── AI Orchestration / Inference ──
│   ├── together-ai/                    ← NEW
│   ├── replicate/                      ← NEW
│   ├── modal/                          ← NEW
│   ├── groq/                           ← NEW
│   │
│   │  ── Feature Management ──
│   ├── launchdarkly/                   ← NEW
│   ├── statsig/                        ← NEW (acquired by OpenAI)
│   ├── split-io/                       ← NEW (Harness)
│   │
│   │  ── Accessibility ──
│   ├── siteimprove/                    ← NEW
│   ├── deque-axe/                      ← NEW (axe DevTools, axe Monitor)
│   ├── level-access/                   ← NEW
│   ├── audioeye/                       ← NEW
│   │
│   │  ── Design Systems & Tools ──
│   ├── figma/                          ← NEW (Figma Make, Dev Mode)
│   ├── storybook/                      ← NEW (v10)
│   │
│   │  ── Performance Testing ──
│   ├── lighthouse/                     ← NEW (Google)
│   ├── speedcurve/                     ← NEW
│   ├── debugbear/                      ← NEW
│   │
│   │  ── Workflow / Project Management ──
│   ├── jira/                           ← NEW (Atlassian)
│   ├── linear/                         ← NEW
│   ├── notion/                         ← NEW
│   └── clickup/                        ← NEW
│
├── data-infrastructure/                ← Data, commerce infrastructure, and integration packs
│   │
│   │  ── PIM (Product Information Management) ──
│   ├── akeneo/                         ← NEW
│   ├── salsify/                        ← NEW
│   ├── inriver/                        ← NEW
│   ├── pimcore/                        ← NEW (Open source)
│   │
│   │  ── ERP Integration ──
│   ├── sap/                            ← NEW
│   ├── netsuite/                       ← NEW (Oracle)
│   ├── dynamics-365-erp/               ← NEW (Finance, Supply Chain)
│   │
│   │  ── Data Warehousing ──
│   ├── snowflake/                      ← NEW
│   ├── databricks/                     ← NEW
│   ├── bigquery/                       ← NEW
│   ├── redshift/                       ← NEW
│   ├── clickhouse/                     ← NEW
│   ├── apache-iceberg/                 ← NEW (Open table format)
│   │
│   │  ── ETL / Data Integration ──
│   ├── fivetran/                       ← NEW (merged with dbt Labs)
│   ├── airbyte/                        ← NEW (Open source)
│   ├── airflow/                        ← NEW (Apache Airflow 3.0)
│   ├── dagster/                        ← NEW
│   ├── prefect/                        ← NEW
│   │
│   │  ── Payments ──
│   ├── stripe/                         ← NEW
│   ├── adyen/                          ← NEW
│   ├── paypal/                         ← NEW
│   ├── square/                         ← NEW
│   └── worldpay/                       ← NEW
│
├── migration-paths/                    ← Source→Target specific knowledge
│   │
│   │  ── CMS Migrations ──
│   ├── sitecore-xp→sitecore-ai/
│   ├── sitecore-xp→optimizely/
│   ├── sitecore-xp→contentful/
│   ├── sitecore-xp→custom/
│   ├── optimizely→optimizely-saas/
│   ├── optimizely→sitecore-ai/
│   ├── episerver→optimizely/
│   ├── wordpress→headless-wp/
│   ├── wordpress→contentful/
│   ├── wordpress→sanity/
│   ├── drupal7→drupal11/
│   ├── drupal→contentful/
│   ├── drupal→contentstack/
│   ├── aem-onprem→aem-cloud/
│   ├── ektron→optimizely/
│   ├── ektron→wordpress/
│   ├── ektron→contentful/
│   ├── sitefinity→sitecore-ai/
│   ├── sitefinity→optimizely/
│   ├── dnn→umbraco/
│   ├── dnn→wordpress/
│   ├── kentico13→xperience-by-kentico/
│   ├── sdl-tridion→contentful/
│   ├── sdl-tridion→drupal/
│   │
│   │  ── Version Upgrades ──
│   ├── sitecore-9x→10x/
│   ├── sitecore-10x→sitecore-ai/
│   ├── umbraco-8→10/
│   ├── umbraco-10→13/
│   ├── umbraco-13→14+/
│   ├── drupal-7→10/
│   ├── drupal-10→11/
│   ├── optimizely-11→12/
│   ├── optimizely-12→saas/
│   ├── kentico-12→xperience/
│   ├── dotnet-framework→dotnet8/
│   │
│   │  ── Cloud Infrastructure ──
│   ├── aws→azure/                     ← PARTIALLY EXISTS
│   ├── azure→aws/
│   ├── onprem→aws/
│   ├── onprem→azure/
│   ├── onprem→gcp/
│   ├── vms→kubernetes/
│   ├── iaas→paas/
│   ├── traditional→vercel/
│   ├── traditional→netlify/
│   │
│   │  ── E-Commerce ──
│   ├── magento→shopify-plus/
│   ├── magento→adobe-commerce-cloud/
│   ├── magento→commercetools/
│   ├── sfcc→shopify-plus/
│   ├── woocommerce→shopify-plus/
│   ├── custom→commercetools/
│   ├── custom→elastic-path/
│   │
│   │  ── Marketing Automation ──
│   ├── mailchimp→hubspot/
│   ├── mailchimp→klaviyo/
│   ├── marketo→hubspot/
│   ├── pardot→hubspot/
│   ├── activecampaign→hubspot/
│   │
│   │  ── CRM ──
│   ├── salesforce→hubspot-crm/
│   ├── hubspot-crm→salesforce/
│   ├── dynamics-crm→salesforce/
│   │
│   │  ── Analytics ──
│   ├── ga-universal→ga4/
│   ├── ga4→posthog/
│   ├── ga4→plausible/
│   ├── adobe-analytics→mixpanel/
│   │
│   │  ── CDP ──
│   ├── no-cdp→segment/
│   ├── segment→rudderstack/
│   ├── segment→hightouch/
│   ├── dmp→cdp/
│   │
│   │  ── Personalization ──
│   ├── google-optimize→vwo/
│   ├── google-optimize→optimizely-exp/
│   ├── google-optimize→ab-tasty/
│   ├── custom-rules→ml-personalization/
│   │
│   │  ── DAM ──
│   ├── bynder→cloudinary/
│   ├── sharepoint→bynder/
│   ├── filesystem→cloudinary/
│   │
│   │  ── AI Adoption ──
│   ├── no-ai→ai-features/
│   ├── traditional-search→semantic-search/
│   ├── no-agents→ai-agent-workflows/
│   ├── manual-content→ai-content-generation/
│   │
│   │  ── Data Infrastructure ──
│   ├── onprem-dw→snowflake/
│   ├── onprem-dw→databricks/
│   ├── manual-etl→fivetran-dbt/
│   ├── manual-etl→airbyte/
│   ├── no-ml→mlops-pipeline/
│   │
│   │  ── Payment / Commerce Infrastructure ──
│   ├── legacy-payments→stripe/
│   ├── single-psp→multi-psp/
│   ├── legacy-pim→akeneo/
│   │
│   │  ── Architecture Patterns ──
│   ├── monolith→microservices/
│   └── monolith→composable/
│
└── shared/                             ← Cross-cutting knowledge
    ├── ai-alternatives.json           ← EXISTING
    ├── tech-proficiency-catalog.json  ← EXISTING
    └── dependency-chains-base.json    ← EXTRACT from current
```

### Platform Knowledge Pack Schema

Every platform pack follows this structure:

```
platforms/{platform-id}/
│
├── manifest.json
│   ├── id: "sitecore-xp"
│   ├── name: "Sitecore Experience Platform"
│   ├── vendor: "Sitecore"
│   ├── category: "enterprise-dxp"
│   ├── supported_versions: ["9.0", ..., "10.4"]
│   ├── latest_version: "10.4"
│   ├── eol_versions: { "9.0": "2024-12-31", ... }
│   ├── valid_topologies: ["xm-single", "xm-scaled", "xp-scaled", "xp-exm"]
│   ├── compatible_targets: ["sitecore-ai", "optimizely", "contentful", "custom"]
│   ├── compatible_infrastructure: ["aws", "azure", "on-prem", "sitecore-managed-cloud"]
│   ├── required_services: ["sql-server"]
│   ├── optional_services: ["solr", "redis", "smtp"]
│   ├── pack_version: "1.0.0"
│   ├── last_researched: "2026-02-22"
│   └── confidence: "high"              ← high | medium | low | draft
│
├── architecture/
│   ├── overview.md                     ← How the platform works fundamentally
│   ├── topologies.json                 ← All valid deployment topologies with diagrams
│   ├── component-map.json              ← Every role/service and what it does
│   └── data-flows.md                   ← How data moves between components
│
├── versions/
│   ├── version-matrix.json             ← Every version → .NET, Solr, SQL, OS requirements
│   ├── breaking-changes/
│   │   ├── {version-a}-to-{version-b}.md
│   │   └── ...
│   └── deprecations.json              ← Features being removed, timeline, alternatives
│
├── ecosystem/
│   ├── modules.json                    ← Modules/plugins — compatibility per version
│   ├── marketplace-packages.json       ← Common packages, health, compatibility
│   ├── integration-patterns.md         ← How it typically integrates with other systems
│   └── community-health.md            ← Ecosystem size, forums, support, partner network
│
├── licensing/
│   ├── models.json                     ← Licensing tiers, pricing structure
│   ├── implications.md                 ← What changes when you change topology or scale
│   └── cost-comparison.md             ← vs competitors at similar scale
│
├── discovery/
│   ├── discovery-tree.json             ← Platform-specific discovery questions
│   ├── inference-rules.json            ← Auto-fill logic from known answers
│   └── dimension-descriptions.md      ← Deep context for each dimension
│
├── heuristics/
│   ├── effort-hours.json               ← Component-level base hours
│   ├── multipliers.json                ← Complexity multipliers
│   ├── gotcha-patterns.json            ← Risk patterns with hours impact
│   └── dependency-chains.json         ← Platform-specific dependency ordering
│
├── migration/
│   ├── data-migration-patterns.md      ← Content, users, analytics, media strategies
│   ├── content-model-mapping.md        ← How content structures translate
│   ├── api-compatibility.md            ← Which APIs survive, which break
│   └── rollback-strategies.md         ← How to undo if things go wrong
│
└── security/
    ├── common-cves.json                ← Known vulnerabilities by version
    ├── hardening-checklist.md          ← Security best practices
    └── patching-cadence.md            ← How often, how disruptive
```

### Infrastructure Pack Schema

```
infrastructure/{cloud-id}/
│
├── manifest.json
│   ├── id: "aws"
│   ├── name: "Amazon Web Services"
│   ├── category: "hyperscaler"
│   ├── regions: [...]
│   └── service_catalog: ["ec2", "rds", "s3", "vpc", ...]
│
├── discovery/
│   ├── discovery-tree.json             ← Infrastructure-specific questions
│   └── inference-rules.json
│
├── services/
│   ├── compute.json                    ← Instance types, pricing, capabilities
│   ├── database.json
│   ├── networking.json
│   ├── storage.json
│   ├── cdn.json
│   ├── dns.json
│   └── monitoring.json
│
├── heuristics/
│   ├── effort-hours.json
│   ├── multipliers.json
│   └── gotcha-patterns.json
│
└── service-map-to/                     ← Mappings to other clouds
    ├── azure.json                      ← EC2→VMs, RDS→SQL MI, S3→Blob, etc.
    ├── gcp.json
    └── ...
```

### Migration Path Schema

```
migration-paths/{source}→{target}/
│
├── manifest.json
│   ├── source: "sitecore-xp"
│   ├── target: "sitecore-ai"
│   ├── prevalence: "very-common"       ← very-common | common | emerging | niche
│   ├── complexity: "transformational"  ← minor | moderate | major | transformational
│   ├── typical_duration: "12-15 months"
│   ├── primary_drivers: [...]
│   └── prerequisites: [...]
│
├── service-mapping.json                ← How each source component maps to target
├── migration-tools.json                ← Vendor tools, third-party tools, scripts
├── gotcha-patterns.json                ← Path-specific gotchas
├── effort-adjustments.json             ← Hours added/removed for this path
│
└── guides/
    ├── step-by-step.md                 ← Recommended migration sequence
    ├── decision-points.md              ← Key decisions along the way
    └── case-studies.md                ← Real-world examples, lessons learned
```

---

## Platform Catalog

All platforms MigrateIQ will support, organized by category. **Direction** indicates whether a platform is typically a migration source, target, or both.

### Enterprise DXP / CMS

| ID | Platform | Vendor | Current Version (Feb 2026) | Direction | Notes |
|----|----------|--------|---------------------------|-----------|-------|
| `sitecore-xp` | Sitecore Experience Platform | Sitecore | 10.4.1 | SOURCE | On-prem. Mainstream support to end-2027; extended to 2030. Last on-prem release line. |
| `sitecore-ai` | Sitecore XM Cloud / SitecoreAI | Sitecore | SaaS (continuous) | TARGET | Cloud-native composable SaaS. Content SDK 1.x is recommended SDK; JSS being phased out. |
| `optimizely` | Optimizely CMS | Optimizely | CMS 12.23.1 / SaaS | BOTH | CMS 12 (.NET Core PaaS) + SaaS (JavaScript SDK GA). CMS 13 launching Q1 2026. |
| `kentico` | Xperience by Kentico | Kentico | Refresh Jan 2026 | BOTH | Complete rewrite, SaaS-first. Kentico 13 security-only through Dec 2026. |
| `adobe-aem` | Adobe Experience Manager | Adobe | AEMaaCS 2026.1.0 / 6.5 SP22 | BOTH | Cloud Service with monthly releases. AEM 6.5 on-prem in extended maintenance. |
| `acquia-drupal` | Drupal (Acquia) | Acquia / Community | Drupal 11.3 | BOTH | Open-source. Drupal 12 expected H2 2026. Drupal 10 EOL Dec 2026. Drupal 7 EOL Jan 2025. |
| `wordpress` | WordPress / WordPress VIP | Automattic | WP 6.9.1 / WP 7.0 (Apr 2026) | BOTH | Enterprise hosting via WordPress VIP. Largest CMS market share globally. |
| `bloomreach` | Bloomreach | Bloomreach | SaaS (continuous) | BOTH | Commerce-focused DXP. Agentic personalization. Loomi AI. |
| `coremedia` | CoreMedia | CoreMedia | 2506.0.x LTS | BOTH | Enterprise DXP. Real-time A/B testing. Spring Boot 3.5. |
| `magnolia` | Magnolia CMS | Magnolia | 6.4 / 6.3.18 LTS | BOTH | Composable Java-based DXP. Headless + traditional. Open-source CE available. |
| `crownpeak` | Crownpeak (FirstSpirit) | Crownpeak | FirstSpirit 2026.2 | BOTH | SaaS-first DXP. Hybrid headless. Accessibility governance built-in. |

### Headless CMS

| ID | Platform | Vendor | Current Version | Direction | Notes |
|----|----------|--------|-----------------|-----------|-------|
| `contentful` | Contentful | Contentful | SaaS (continuous) | TARGET | Leading headless CMS. AI Actions, Personalization, Timeline scheduling. |
| `contentstack` | Contentstack | Contentstack | SaaS (continuous) | TARGET | Headless CMS + EDGE adaptive DXP. Agent OS for AI orchestration. Lytics acquisition. |
| `sanity` | Sanity | Sanity | v3 Studio | TARGET | "Content Operating System." $85M raise Spring 2025. GROQ query language. |
| `strapi` | Strapi | Strapi | 5.36.0 | TARGET | Open-source headless CMS. TypeScript 5.0, AI features. Strapi v4 EOL Apr 2026. |
| `hygraph` | Hygraph | Hygraph | SaaS (continuous) | TARGET | Native GraphQL, federated content. AI Assist GA Jan 2026. MCP Server available. |

### E-Commerce

| ID | Platform | Vendor | Current Version | Direction | Notes |
|----|----------|--------|-----------------|-----------|-------|
| `shopify-plus` | Shopify Plus | Shopify | SaaS (Winter '26) | TARGET | Enterprise SaaS. Horizons themes. Scripts→Functions migration Jun 2026. $2,300/mo. |
| `adobe-commerce` | Adobe Commerce (Magento) | Adobe | 2.4.8 | BOTH | Open-source + commercial. PHP 8.4. Support until Apr 2028. |
| `salesforce-commerce` | Salesforce Commerce Cloud | Salesforce | SaaS (continuous) | BOTH | Agentforce for Guided Shopping. Composable storefront + Data Cloud. |
| `commercetools` | commercetools | commercetools | SaaS | TARGET | MACH-native composable commerce. AgenticLift. AI Hub for agent ecosystems. |
| `elastic-path` | Elastic Path | Elastic Path | SaaS (continuous) | TARGET | Composable commerce. Native semantic/vector search. Built-in CMS. Next.js frontend. |
| `spryker` | Spryker | Spryker | 202512.0 | TARGET | B2B-focused composable commerce. PHP 8.4, AI Foundation module. Gartner MQ Visionary. |
| `bigcommerce` | BigCommerce | BigCommerce | Catalyst v1.4.2 | BOTH | Open SaaS. Next.js-based Catalyst storefront. |
| `woocommerce` | WooCommerce | Automattic | 10.5.2 | SOURCE | WordPress plugin. Commonly migrated FROM at enterprise scale. |

### Frameworks

| ID | Platform | Vendor | Current Version | Direction | Notes |
|----|----------|--------|-----------------|-----------|-------|
| `nextjs` | Next.js | Vercel | 16.1 | TARGET | React meta-framework. Turbopack stable. PPR + `use cache`. Dominant for headless. |
| `nuxtjs` | Nuxt.js | NuxtLabs | 4.3.1 | TARGET | Vue.js meta-framework. Nuxt 5 in early dev. Nuxt 3 EOL Jul 2026. |
| `astro` | Astro | Cloudflare | 5.17.3 / 6.0 beta | TARGET | Content-focused. Islands architecture. Acquired by Cloudflare. |
| `sveltekit` | SvelteKit | Svelte team | 2.53.0 | TARGET | Svelte meta-framework. Mature SSR/SSG. Active weekly releases. |
| `remix` | Remix / React Router v7 | Shopify | 7.13.0 | TARGET | Remix merged into React Router v7. Full-stack React. |
| `gatsby` | Gatsby | Gatsby Inc | 5.16.0 | BOTH | React SSG. Lower adoption trend; often a source migrating to Next.js/Astro. |
| `custom` | Custom / Bespoke | Various | N/A | BOTH | Any custom-built application. Common source when moving to managed platforms. |

### Legacy Platforms

| ID | Platform | Vendor | Current Version | Direction | Notes |
|----|----------|--------|-----------------|-----------|-------|
| `ektron` | Ektron | (Accel-KKR) | ~9.x (EOL) | SOURCE | Dead platform. No new features. Security patches only. Migrate immediately. |
| `sitefinity` | Sitefinity | Progress | 15.4 LTS | BOTH | ASP.NET Core + Next.js frontends. AI Assistant. 3.6% mindshare. Still developed. |
| `umbraco` | Umbraco | Umbraco | 17 LTS | BOTH | .NET 10 LTS. Open-source. Active community. Umbraco 8 EOL Feb 2025. |
| `dnn` | DNN (DotNetNuke) | DNN Corp | 10.2.1 | SOURCE | Open-source .NET CMS. ASP.NET Web Forms (2002). Commonly migrated from. |
| `episerver` | Episerver (pre-rebrand) | Optimizely | CMS 7–10 (EOL) | SOURCE | Rebranded to Optimizely. All <CMS 11 are EOL. Requires .NET Core rewrite. |
| `sdl-tridion` | SDL Tridion (RWS Tridion Sites) | RWS | Tridion Sites 10 | SOURCE | Enterprise WCM for multi-language. Declining from 6.3% to 4.0% mindshare. |
| `opentext-teamsite` | OpenText TeamSite | OpenText | Experience Cloud 24.2 | SOURCE | Rebranded to OpenText Web CMS. Legacy installs commonly migrate to modern DXPs. |

---

## Infrastructure Catalog

### Hyperscalers

| ID | Provider | Market Share | Notes |
|----|----------|-------------|-------|
| `aws` | Amazon Web Services | ~30% | Market leader. $108B+ annual revenue. Most comprehensive service portfolio. |
| `azure` | Microsoft Azure | ~20% | Fastest-growing major cloud. 34% YoY growth. Deep Microsoft ecosystem. |
| `gcp` | Google Cloud Platform | ~10% | Strong data/analytics/AI. 32% YoY growth. Reference K8s implementation (GKE). |
| `oracle-cloud` | Oracle Cloud Infrastructure | Growing | Fastest-growing hyperscaler (52% IaaS growth). Aggressive AI/GPU capacity. |

### Frontend / Edge Hosting

| ID | Provider | Notes |
|----|----------|-------|
| `vercel` | Vercel | Best-in-class for Next.js. Sitecore XM Cloud technology partner. |
| `netlify` | Netlify | Pioneered Jamstack deployment. Sitecore XM Cloud technology partner. |
| `cloudflare` | Cloudflare Pages/Workers | Fastest benchmarks. D1/KV/R2 data layer. $2.79B 2026 revenue. Acquired Astro. |
| `fastly` | Fastly | Programmable edge (Compute@Edge). Strong CDN + WAF. |

### PaaS

| ID | Provider | Status | Notes |
|----|----------|--------|-------|
| `heroku` | Heroku | Declining | Salesforce froze new feature dev Feb 2026. No new Enterprise contracts. |
| `railway` | Railway | Active | Usage-based ($5/mo baseline). Native multi-region. Excellent DX. |
| `render` | Render | Active | Zero-DevOps PaaS. Preview environments. $7-25/mo. |
| `fly-io` | Fly.io | Active | Bare-metal worldwide. Edge-native. Lightweight VMs. |
| `digitalocean` | DigitalOcean App Platform | Active | Buildpack-compatible. Simple pricing. ~$219M quarterly revenue. |

### Container Orchestration

| ID | Platform | Notes |
|----|----------|-------|
| `kubernetes` | Kubernetes (EKS/AKS/GKE/self-managed) | De facto standard. 92% of orgs use containers, 77% of Fortune 100 run K8s. |
| `openshift` | Red Hat OpenShift | Enterprise K8s with built-in policy, monitoring, compliance. |

### Vendor-Managed

| ID | Provider | Notes |
|----|----------|-------|
| `sitecore-managed-cloud` | Sitecore Managed Cloud (MCS/MCP) | Sitecore-managed XM/XP on Azure. Standard + Premium tiers. |

### Traditional

| ID | Provider | Notes |
|----|----------|-------|
| `on-prem` | On-premises / Self-hosted | Full control. Common in regulated industries. Requires dedicated ops. |
| `colocation` | Colocation | Own hardware in third-party data centers. |

---

## Supporting Services Catalog

### Search

| ID | Service | Type | Notes |
|----|---------|------|-------|
| `solr` | Apache Solr | Open source | Sitecore's default search. Mature, Java-based, Lucene-powered. |
| `elasticsearch` | Elasticsearch | SSPL/Elastic License | Full-text search + analytics. License change drove forks. |
| `opensearch` | OpenSearch | Open source (Apache 2.0) | AWS-backed Elasticsearch fork. Scalable search + observability. |
| `azure-ai-search` | Azure AI Search | Managed SaaS | AI-enriched, vector/semantic search. Formerly Cognitive Search. |
| `algolia` | Algolia | Managed SaaS | 1.75T+ searches/year, 99.999% uptime. Best-in-class managed search. |
| `typesense` | Typesense | Open source (GPL) | C++, fast, vector/hybrid search, multi-node clustering. |
| `meilisearch` | Meilisearch | Open source (MIT) | Rust, instant front-facing search. Simplest DX. |
| `coveo` | Coveo | Enterprise SaaS | AI-powered personalized search. ML-based intent understanding. |

### Cache

| ID | Service | Type | Notes |
|----|---------|------|-------|
| `redis` | Redis | Open source (AGPLv3 from v8) | Industry standard. License change in 2024 restricts cloud resale from v8+. |
| `valkey` | Valkey | Open source (BSD) | Linux Foundation Redis 7.2.4 fork. Async I/O in v8.0. Backed by AWS/Google/Oracle. |
| `dragonfly` | Dragonfly | Source available | 25x faster than Redis, API-compatible, multi-threaded. |
| `memcached` | Memcached | Open source | Lightweight, simple key-value caching. Proven at scale. |
| `varnish` | Varnish | Open source | HTTP reverse proxy/cache. High-performance web acceleration. |

### Database

| ID | Service | Type | Notes |
|----|---------|------|-------|
| `sql-server` | SQL Server / Azure SQL / SQL MI | Commercial | Sitecore's primary DB. On-prem, Azure SQL, or SQL Managed Instance. |
| `postgresql` | PostgreSQL | Open source | Most popular open-source RDBMS. Broad ecosystem. |
| `mysql` | MySQL / MariaDB | Open source | Widely used. MariaDB is community-driven fork. |
| `mongodb` | MongoDB | Source available (SSPL) | Leading NoSQL document database. |
| `cosmosdb` | Azure Cosmos DB | Managed | Globally distributed, multi-API (SQL, MongoDB, Cassandra, Gremlin). |
| `dynamodb` | Amazon DynamoDB | Managed | Serverless NoSQL. Single-digit-ms at any scale. |
| `aurora` | Amazon Aurora | Managed | MySQL/PostgreSQL-compatible. Up to 5x faster than MySQL. |
| `supabase` | Supabase | Managed/Open source | Auth + DB + Storage + Realtime + Edge Functions. Firebase alternative. |
| `neon` | Neon | Managed | Serverless Postgres, scale-to-zero. Acquired by Databricks May 2025. |
| `planetscale` | PlanetScale | Managed | MySQL (Vitess) + Postgres (Sep 2025). No free tier since Apr 2024. |
| `cockroachdb` | CockroachDB | Open source/Managed | Distributed SQL. Strongest compliance certs (PCI, HIPAA, SOC 2, ISO). |

### Message Queues / Events

| ID | Service | Type | Notes |
|----|---------|------|-------|
| `rabbitmq` | RabbitMQ | Open source | AMQP-based, flexible routing, widely adopted. |
| `kafka` | Apache Kafka | Open source | Distributed event streaming. Highest throughput, log-based. |
| `azure-service-bus` | Azure Service Bus | Managed | Enterprise messaging. Queues + topics. Azure-native. |
| `aws-sqs` | Amazon SQS / SNS | Managed | Fully managed queue. Serverless. Tight AWS integration. |
| `nats` | NATS | Open source | Lightweight, high-performance, cloud-native messaging. |

### Email / SMTP

| ID | Service | Type | Notes |
|----|---------|------|-------|
| `sendgrid` | SendGrid (Twilio) | Managed | Enterprise/high-volume. Dedicated IPs. |
| `aws-ses` | Amazon SES | Managed | Lowest cost ($0.10/1K emails). AWS-native. |
| `postmark` | Postmark (ActiveCampaign) | Managed | Best for critical transactional email. Sub-second delivery. |
| `mailgun` | Mailgun (Sinch) | Managed | Developer-focused. REST API. US/EU regions. 99.99% uptime SLA. |
| `azure-comms` | Azure Communication Services | Managed | Azure-native email + SMS + chat + voice. |
| `resend` | Resend | Managed | Modern developer-first email API. React-based templates. |

### Identity / Auth

| ID | Service | Type | Notes |
|----|---------|------|-------|
| `entra-id` | Microsoft Entra ID | Managed | Deep Microsoft ecosystem integration. Enterprise SSO standard. |
| `auth0` | Auth0 (Okta) | Managed | Developer-focused, flexible, extensive SDKs. $35-150/mo for 500 users. |
| `okta` | Okta | Managed | Enterprise workforce identity, SSO, MFA, compliance. |
| `cognito` | AWS Cognito | Managed | AWS-native auth. User pools + federated identity. |
| `keycloak` | Keycloak | Open source (CNCF) | Red Hat-originated. Zero licensing cost. Self-hosted. |
| `duende-identityserver` | Duende IdentityServer | Commercial OSS | .NET-native OIDC/OAuth 2.0. Sitecore ecosystem relevant. |
| `clerk` | Clerk | Managed | Developer-first auth with pre-built UI components. |

### CDN

| ID | Service | Notes |
|----|---------|-------|
| `cloudfront` | AWS CloudFront | Tight AWS integration. Lambda@Edge for compute. |
| `azure-front-door` | Azure Front Door | Azure-native. Global LB + CDN + WAF combined. |
| `cloudflare-cdn` | Cloudflare CDN | Largest edge network. Free tier. Integrated WAF/DDoS/Workers. |
| `akamai` | Akamai | Largest CDN by ISP reach. Enterprise-grade. Highest global penetration. |
| `fastly-cdn` | Fastly CDN | Real-time purge. Programmable edge. Developer-focused. |

### Monitoring / Observability

| ID | Service | Type | Notes |
|----|---------|------|-------|
| `datadog` | Datadog | Managed SaaS | Unified APM/infra/logs/RUM/security. Vast integration ecosystem. |
| `new-relic` | New Relic | Managed SaaS | Full-stack observability. Generous free tier (100GB/mo). |
| `dynatrace` | Dynatrace | Managed SaaS | AI-assisted (Davis engine). Auto-instrumentation. Enterprise-focused. |
| `application-insights` | Azure Application Insights | Managed | Azure-native APM, part of Azure Monitor. |
| `cloudwatch` | AWS CloudWatch | Managed | AWS-native monitoring, logs, metrics, alarms. |
| `grafana` | Grafana + Loki/Mimir/Tempo | Open source/Managed | De facto visualization standard. Full LGTM stack. |
| `prometheus` | Prometheus | Open source | Standard for K8s metrics. PromQL query language. |
| `splunk` | Splunk | Commercial | Log analytics, SIEM, enterprise observability. |
| `elastic-observability` | Elastic Observability (ELK) | Open source/Managed | Elasticsearch + Kibana + APM. ML anomaly detection. |
| `sentry` | Sentry | Open source/Managed | Error tracking + performance monitoring. Developer-focused. |

### CI/CD

| ID | Service | Market Share | Notes |
|----|---------|-------------|-------|
| `github-actions` | GitHub Actions | ~33% | Native CI/CD for GitHub repos. Largest marketplace. |
| `azure-devops` | Azure DevOps Pipelines | ~24% | Microsoft enterprise CI/CD. Strong Azure integration. |
| `jenkins` | Jenkins | ~14% | Self-hosted. 1800+ plugins. Maximum customization. |
| `gitlab-ci` | GitLab CI/CD | ~9% | Integrated DevOps lifecycle platform. |
| `circleci` | CircleCI | Active | Cloud-first CI/CD. Fast builds. Strong caching. |
| `bitbucket-pipelines` | Bitbucket Pipelines | Active | Atlassian ecosystem. Tight Jira integration. |
| `octopus-deploy` | Octopus Deploy | Active | Deployment automation. Strong .NET/Sitecore presence. |

### Storage / Media

| ID | Service | Type | Notes |
|----|---------|------|-------|
| `s3` | Amazon S3 | Managed | Market leader (~30%). 11 nines durability. Multiple storage classes. |
| `azure-blob` | Azure Blob Storage | Managed | Hot/Cool/Archive tiers. Azure-native (~24%). |
| `gcs` | Google Cloud Storage | Managed | GCP-native. Strong analytics integration. |
| `cloudflare-r2` | Cloudflare R2 | Managed | S3-compatible. Zero egress fees. Edge-integrated. |
| `minio` | MinIO | Open source | S3-compatible. 2.2+ TiB/s throughput. Self-hosted. |
| `cloudinary` | Cloudinary | Managed SaaS | Image/video optimization, transformation, delivery. |
| `imgix` | Imgix | Managed SaaS | Real-time image processing and CDN delivery. |

### DNS

| ID | Service | Notes |
|----|---------|-------|
| `route53` | AWS Route 53 | AWS-native. Health checks. Traffic routing policies. |
| `azure-dns` | Azure DNS | Azure-native. Integrates with Traffic Manager. |
| `cloudflare-dns` | Cloudflare DNS | Free tier. Fastest public resolver (1.1.1.1). |

### WAF / Security

| ID | Service | Notes |
|----|---------|-------|
| `cloudflare-waf` | Cloudflare WAF | Cloud-native. OWASP Top 10. Integrated with CDN/DDoS. |
| `aws-waf` | AWS WAF | Pay-as-you-go. Optional managed rulesets. |
| `azure-waf` | Azure WAF | Part of App Gateway / Front Door. |
| `akamai-waf` | Akamai App & API Protector | Industry-leading threat intelligence. |
| `imperva` | Imperva (Thales) | Lowest false-positive rate (0.009%). Global SOC. |

---

## MarTech Catalog

All MarTech platforms MigrateIQ will support, organized by function. These represent the tools a digital experience agency commonly implements, integrates, and migrates.

### Marketing Automation

| ID | Platform | Vendor | Current Version (Feb 2026) | Direction | Notes |
|----|----------|--------|---------------------------|-----------|-------|
| `hubspot` | HubSpot Marketing Hub | HubSpot | SaaS (continuous) | TARGET | All-in-one CRM + marketing + CMS + sales. 228K+ customers. Breeze AI agents for automation. $800/mo Professional, $3,600/mo Enterprise. |
| `marketo` | Marketo Engage | Adobe | SaaS (continuous) | BOTH | Enterprise B2B marketing automation. Deep Adobe ecosystem. AI Assistants for campaign creation. ~$895-3,195/mo. |
| `pardot` | Account Engagement (Pardot) | Salesforce | SaaS (continuous) | SOURCE | Rebranded "Marketing Cloud Account Engagement." Salesforce-native B2B. Being merged into Data Cloud. $1,250-15,000/mo. |
| `mailchimp` | Mailchimp | Intuit | SaaS (continuous) | BOTH | 11M+ active users. AI-powered email marketing. Email + SMS + social. Standard $20/mo, Premium $350/mo. Intuit acquired 2021 for $12B. |
| `activecampaign` | ActiveCampaign | ActiveCampaign | SaaS (continuous) | BOTH | Email + automation + CRM. 180K+ customers. AI content generation. $15-145/mo. |
| `klaviyo` | Klaviyo | Klaviyo | SaaS (continuous) | TARGET | E-commerce focused. IPO'd Sept 2023. Deep Shopify integration. AI segmentation. $20-2,315+/mo. |
| `brevo` | Brevo | Brevo | SaaS (continuous) | BOTH | Formerly Sendinblue. Email + SMS + WhatsApp + chat. Budget-friendly alternative. Free tier available. |
| `iterable` | Iterable | Iterable | SaaS (continuous) | TARGET | Cross-channel growth marketing. AI-powered send-time optimization. Enterprise. |
| `customer-io` | Customer.io | Customer.io | SaaS (continuous) | TARGET | Behavioral messaging. Developer-friendly APIs. Workflow automation. $100+/mo. |
| `drip` | Drip | Drip | SaaS (continuous) | BOTH | E-commerce CRM. Visual workflow builder. Shopify/WooCommerce focus. $39+/mo. |

### CRM

| ID | Platform | Vendor | Current Version | Direction | Notes |
|----|----------|--------|-----------------|-----------|-------|
| `salesforce-crm` | Salesforce | Salesforce | SaaS (Spring '26) | BOTH | Market leader (~22% share). Agentforce platform for AI agents. $25-500+/user/mo. |
| `hubspot-crm` | HubSpot CRM | HubSpot | SaaS (continuous) | BOTH | Free CRM tier. 228K+ customers. Breeze AI. Best SMB-to-enterprise bridge. |
| `dynamics-365-crm` | Dynamics 365 | Microsoft | SaaS (2026 Wave 1) | BOTH | Deep Microsoft ecosystem. Copilot integration. $65-135/user/mo. |
| `zoho-crm` | Zoho CRM | Zoho | SaaS (continuous) | SOURCE | 100M+ users across Zoho suite. Budget-friendly enterprise. $14-52/user/mo. |
| `pipedrive` | Pipedrive | Pipedrive | SaaS (continuous) | SOURCE | Sales-focused CRM. Visual pipeline management. $14-99/user/mo. |
| `monday-crm` | monday CRM | monday.com | SaaS (continuous) | SOURCE | Work OS with CRM module. Flexible, visual. 225K+ organizations. |

### Analytics

| ID | Platform | Vendor | Current Version | Direction | Notes |
|----|----------|--------|-----------------|-----------|-------|
| `google-analytics` | Google Analytics 4 | Google | GA4 (continuous) | BOTH | Free tier dominant. Event-based model. BigQuery integration. Privacy-first cookieless measurement. |
| `adobe-analytics` | Adobe Analytics | Adobe | SaaS (continuous) | BOTH | Enterprise analytics. Deep Adobe DXP integration. Advanced segmentation. |
| `mixpanel` | Mixpanel | Mixpanel | SaaS (continuous) | TARGET | Product analytics. Behavioral cohorts. AI-powered Spark assistant. Free to $833+/mo. |
| `amplitude` | Amplitude | Amplitude | SaaS (continuous) | TARGET | Digital analytics platform. Session Replay. AI-powered. Free to enterprise. |
| `heap` | Heap | Contentsquare | SaaS (continuous) | TARGET | Auto-capture analytics. No manual event tracking. Acquired by Contentsquare 2023. |
| `hotjar` | Hotjar | Contentsquare | SaaS (continuous) | BOTH | Heatmaps + session recordings + surveys. 1.3M+ websites. $0-171+/mo. |
| `fullstory` | FullStory | FullStory | SaaS (continuous) | TARGET | Digital experience intelligence. Session replay + analytics. AI-powered insights. |
| `pendo` | Pendo | Pendo | SaaS (continuous) | TARGET | Product analytics + in-app guides + feedback. Product-led growth focus. |
| `posthog` | PostHog | PostHog | Open source/SaaS | TARGET | All-in-one: analytics + session replay + feature flags + A/B testing + surveys. Open source. Self-hostable. |
| `plausible` | Plausible | Plausible | Open source/SaaS | TARGET | Privacy-first, lightweight analytics. GDPR-compliant by design. No cookies. Self-hostable. $9+/mo. |

### Customer Data Platform (CDP)

| ID | Platform | Vendor | Current Version | Direction | Notes |
|----|----------|--------|-----------------|-----------|-------|
| `segment` | Twilio Segment | Twilio | SaaS (continuous) | BOTH | Market-leading CDP. 25K+ customers. Protocols governance. Unify identity resolution. $120/mo to enterprise. |
| `tealium` | Tealium | Tealium | SaaS (continuous) | BOTH | Enterprise CDP + tag management. AudienceStream. Real-time. |
| `mparticle` | mParticle | mParticle | SaaS (continuous) | BOTH | Enterprise CDP. Data quality focus. Mobile-first heritage. |
| `sitecore-cdp` | Sitecore CDP | Sitecore | SaaS (continuous) | BOTH | Boxever acquisition. Real-time personalization. Sitecore ecosystem integration. |
| `adobe-rtcdp` | Adobe Real-Time CDP | Adobe | SaaS (continuous) | BOTH | Adobe Experience Platform-based. B2C + B2B profiles. Deep Adobe integration. |
| `bloomreach-engagement` | Bloomreach Engagement | Bloomreach | SaaS (continuous) | TARGET | CDP + marketing automation. Loomi AI personalization. Commerce-focused. |
| `rudderstack` | RudderStack | RudderStack | Open source/SaaS | TARGET | Warehouse-native CDP. Open source. Your data stays in your warehouse. $0-25K+/mo. |
| `hightouch` | Hightouch | Hightouch | SaaS (continuous) | TARGET | Composable CDP / Reverse ETL. Activates data from existing warehouse. $350+/mo. |

### Personalization / Experimentation

| ID | Platform | Vendor | Current Version | Direction | Notes |
|----|----------|--------|-----------------|-----------|-------|
| `optimizely-experimentation` | Optimizely Experimentation | Optimizely | SaaS (continuous) | TARGET | Web + Feature Experimentation. Stats Engine. Leading A/B testing platform. |
| `adobe-target` | Adobe Target | Adobe | SaaS (continuous) | BOTH | Enterprise personalization. Automated Personalization + Auto-Target powered by ML. |
| `dynamic-yield` | Dynamic Yield | Mastercard | SaaS (continuous) | TARGET | AI personalization + recommendations. Commerce-focused. Acquired by Mastercard. |
| `vwo` | VWO | Wingify | SaaS (continuous) | TARGET | Full-stack testing + personalization. Free Google Optimize migration tool. $173+/mo. |
| `launchdarkly-experimentation` | LaunchDarkly | LaunchDarkly | SaaS (continuous) | TARGET | Feature flags + progressive delivery + experimentation. 4K+ customers. $8.33/seat/mo+. |
| `kameleoon` | Kameleoon | Kameleoon | SaaS (continuous) | TARGET | AI-powered experimentation. GDPR-native (French). Server-side first. |
| `ab-tasty` | AB Tasty | AB Tasty | SaaS (continuous) | TARGET | European A/B testing. Flagship feature management. EmotionsAI targeting. |

### Digital Asset Management (DAM)

| ID | Platform | Vendor | Current Version | Direction | Notes |
|----|----------|--------|-----------------|-----------|-------|
| `bynder` | Bynder | Bynder | SaaS (continuous) | BOTH | Leading DAM. AI-powered auto-tagging. Brand portals. Creative workflow. |
| `brandfolder` | Brandfolder | Smartsheet | SaaS (continuous) | BOTH | DAM + brand management. AI-powered asset intelligence. |
| `cloudinary-dam` | Cloudinary | Cloudinary | SaaS (continuous) | TARGET | Media management + DAM + CDN. On-the-fly image/video transformation. 1M+ users. |
| `aem-assets` | AEM Assets | Adobe | SaaS (continuous) | BOTH | Enterprise DAM within Adobe ecosystem. AEM Content Hub for distribution. |
| `sitecore-content-hub` | Sitecore Content Hub | Sitecore | SaaS (continuous) | BOTH | DAM + content operations + MRM. Sitecore ecosystem. |
| `acquia-dam` | Acquia DAM | Acquia | SaaS (continuous) | BOTH | Widen acquisition. Open-source CMS integration. Drupal ecosystem. |
| `canto` | Canto | Canto | SaaS (continuous) | BOTH | Mid-market DAM. 2,500+ customers. Simple UX. |
| `frontify` | Frontify | Frontify | SaaS (continuous) | BOTH | DAM + brand guidelines + design system hosting. 8K+ brands. |

### Tag Management

| ID | Platform | Vendor | Notes |
|----|----------|--------|-------|
| `google-tag-manager` | Google Tag Manager | Google | Free. Market dominant. Server-side tagging support. |
| `tealium-iq` | Tealium iQ | Tealium | Enterprise tag management. Integrates with Tealium CDP. |
| `adobe-launch` | Adobe Experience Platform Tags | Adobe | Part of Adobe DXP. Real-time data collection. |

### Translation / Localization

| ID | Platform | Vendor | Notes |
|----|----------|--------|-------|
| `smartling` | Smartling | Smartling | AI translation management. Enterprise. Deep CMS integrations. |
| `transifex` | Transifex | Transifex | Developer-focused. API-first. Open-source integration. |
| `lokalise` | Lokalise | Lokalise | Developer & designer workflow. Figma + GitHub integration. |
| `phrase` | Phrase (Memsource) | Phrase | TMS + localization platform. AI-assisted translation. |
| `crowdin` | Crowdin | Crowdin | Cloud-based. Strong open-source community. Free for open-source. |

### SEO Tools

| ID | Platform | Vendor | Notes |
|----|----------|--------|-------|
| `semrush` | Semrush | Semrush | All-in-one SEO, content, competitor research. $139-499/mo. |
| `ahrefs` | Ahrefs | Ahrefs | Backlink analysis leader. Site audit. Content explorer. $99-999/mo. |
| `moz` | Moz Pro | Moz | Domain authority pioneer. Local SEO. SERP tracking. $99-599/mo. |
| `screaming-frog` | Screaming Frog | Screaming Frog | Desktop SEO spider/crawler. Site auditing. Industry standard for technical SEO. |
| `brightedge` | BrightEdge | BrightEdge | Enterprise SEO platform. AI-powered. DataCube. ContentIQ. |

### Consent / Privacy

| ID | Platform | Vendor | Notes |
|----|----------|--------|-------|
| `onetrust` | OneTrust | OneTrust | Market leader. GDPR, CCPA, global privacy management. |
| `cookiebot` | Cookiebot | Usercentrics | Automated cookie consent management. CMP. |
| `osano` | Osano | Osano | Easy-to-use consent management. Privacy score monitoring. |
| `iubenda` | iubenda | iubenda | Privacy/cookie policy generator + consent management. |
| `trustarc` | TrustArc | TrustArc | Enterprise privacy management platform. |

### Chat / Conversational

| ID | Platform | Vendor | Notes |
|----|----------|--------|-------|
| `intercom` | Intercom | Intercom | AI-first customer service platform. Fin AI Agent. 25K+ customers. |
| `drift` | Drift | Salesloft | Conversational marketing + sales. Revenue acceleration. |
| `zendesk` | Zendesk | Zendesk | Customer service platform. AI agents. $19-115/agent/mo. |
| `freshdesk` | Freshdesk | Freshworks | Customer support. Freddy AI. Free tier. |
| `tidio` | Tidio | Tidio | Live chat + chatbots + email. SMB-focused. Lyro AI. |

---

## AI & Development Tools Catalog

Tools that a digital experience agency uses for building, testing, deploying, and managing AI-powered experiences.

### AI Model Providers

| ID | Provider | Key Models (Feb 2026) | Notes |
|----|----------|----------------------|-------|
| `anthropic` | Anthropic | Claude Opus 4.6, Sonnet 4.6, Haiku 4.5 | Constitutional AI. 200K context. Tool use. MCP protocol. $3-75/M tokens. |
| `openai` | OpenAI | GPT-4.1, o3, o4-mini | Reasoning models (o3). Image generation (DALL-E 4). Audio (Whisper 4). $0.40-60/M tokens. |
| `google-ai` | Google | Gemini 3.1 Pro, Flash, Ultra | 2M context window. Multimodal. Deep Google Cloud integration. $0.075-10/M tokens. |
| `mistral` | Mistral AI | Large, Medium, Small, Codestral | European AI. Open-weight models. Edge deployment. |
| `cohere` | Cohere | Command A | Enterprise RAG focus. Rerank API. Embed v4. |
| `meta-ai` | Meta | Llama 4 (Scout, Maverick) | Open-weight. 10M context (Scout). Free for most uses. |
| `xai` | xAI | Grok 4 | Real-time data access. Code generation. Reasoning. |
| `amazon-nova` | Amazon | Nova 2 Pro, Lite, Micro | AWS-native. Bedrock integration. Cost-optimized. |
| `deepseek` | DeepSeek | DeepSeek-V3, DeepSeek-R1 | Open-source reasoning models. Extremely cost-efficient. |

### AI Coding & Development Tools

| ID | Tool | Vendor | Notes |
|----|------|--------|-------|
| `claude-code` | Claude Code | Anthropic | CLI-based AI coding agent. Autonomous multi-file editing. MCP integration. Tool use. |
| `github-copilot` | GitHub Copilot | GitHub/Microsoft | IDE-integrated AI pair programmer. Code completion + chat. $10-39/mo. |
| `cursor` | Cursor | Anysphere | AI-first IDE. Fork of VS Code. Multi-file editing. Agent mode. $20+/mo. |
| `windsurf` | Windsurf | Codeium | AI IDE. Cascade flow for multi-file. Acquired OpenAI partnership rumors. $15+/mo. |
| `amazon-q` | Amazon Q Developer | Amazon | AWS-native AI assistant. Code transformation (.NET Framework→.NET 8). Free tier. |

### Agent Frameworks

| ID | Framework | Vendor | Notes |
|----|-----------|--------|-------|
| `langchain` | LangChain | LangChain Inc | Most popular LLM framework. Chains, tools, memory. Python + JS. |
| `langgraph` | LangGraph | LangChain Inc | Stateful multi-agent orchestration. Graph-based workflows. |
| `crewai` | CrewAI | CrewAI | Multi-agent framework. Role-based agent teams. Task delegation. |
| `ms-agent-framework` | Microsoft Agent Framework | Microsoft | RC release. Multi-agent. A2A protocol. Enterprise-grade. |
| `anthropic-sdk` | Anthropic SDK (Agent) | Anthropic | Claude agent building. Tool use. MCP clients. Python + TS. |
| `openai-sdk` | OpenAI Agents SDK | OpenAI | Agent loop + handoffs + guardrails. Python SDK. |
| `vercel-ai-sdk` | Vercel AI SDK | Vercel | Streaming LLM responses. React/Next.js native. Multi-provider. |
| `pydantic-ai` | PydanticAI | Pydantic | Type-safe AI agents. Structured outputs. Dependency injection. |

### Vector Databases

| ID | Database | Type | Notes |
|----|----------|------|-------|
| `pinecone` | Pinecone | Managed SaaS | Serverless vector DB. Production-grade. Fastest query latency. |
| `weaviate` | Weaviate | Open source/Managed | Hybrid vector + keyword search. Multi-modal. GraphQL API. |
| `qdrant` | Qdrant | Open source/Managed | Rust-based. High-performance. Rich filtering. |
| `chroma` | Chroma | Open source | Lightweight, embeddable. Popular for prototyping and small-scale RAG. |
| `milvus` | Milvus | Open source/Managed (Zilliz) | Scalable. 1B+ vector support. GPU-accelerated. |
| `pgvector` | pgvector | Open source (PostgreSQL extension) | Vector search in existing PostgreSQL. No separate infra needed. |

### Feature Management

| ID | Platform | Vendor | Notes |
|----|----------|--------|-------|
| `launchdarkly` | LaunchDarkly | LaunchDarkly | Market leader. Feature flags + progressive delivery. 4K+ customers. |
| `statsig` | Statsig | OpenAI (acquired) | Feature flags + experimentation + analytics. Acquired by OpenAI Jan 2025. |
| `split-io` | Split | Harness | Feature flags + testing. Acquired by Harness. Part of software delivery platform. |

### Accessibility

| ID | Tool | Vendor | Notes |
|----|------|--------|-------|
| `siteimprove` | Siteimprove | Siteimprove | Automated accessibility testing + SEO + analytics. WCAG conformance. |
| `deque-axe` | axe DevTools / axe Monitor | Deque Systems | Industry standard. axe-core open source. Browser extensions + CI integration. |
| `level-access` | Level Access | Level Access | Enterprise accessibility platform + managed services + auditing. |
| `audioeye` | AudioEye | AudioEye | Automated + manual accessibility. Legal compliance focus. |

### Design & Prototyping

| ID | Tool | Vendor | Notes |
|----|------|--------|-------|
| `figma` | Figma | Figma | Dominant design tool. Figma Make for AI generation. Dev Mode. ~$15-75/editor/mo. |
| `storybook` | Storybook | Storybook | Component development environment. v10 with improved perf. Open source. |

### Performance Testing

| ID | Tool | Vendor | Notes |
|----|------|--------|-------|
| `lighthouse` | Lighthouse | Google | Open source web performance auditing. Integrated in Chrome DevTools. Industry standard. |
| `speedcurve` | SpeedCurve | SpeedCurve | Real user monitoring + synthetic testing. Core Web Vitals tracking. |
| `debugbear` | DebugBear | DebugBear | Page speed monitoring. CrUX data tracking. Performance budgets. |

### Workflow / Project Management

| ID | Tool | Vendor | Notes |
|----|------|--------|-------|
| `jira` | Jira | Atlassian | Market leader for engineering teams. Agile boards. Atlassian Intelligence AI. |
| `linear` | Linear | Linear | Modern project management. Keyboard-first. Popular with startups. $8/user/mo. |
| `notion` | Notion | Notion | All-in-one workspace. Docs + wikis + project management. Notion AI. $8-15/user/mo. |
| `clickup` | ClickUp | ClickUp | All-in-one productivity. 800K+ teams. AI features. $7-12/user/mo. |

---

## Data & Commerce Infrastructure Catalog

Backend systems that power digital experience platforms — product data, ERP, data warehousing, ETL, and payments.

### PIM (Product Information Management)

| ID | Platform | Vendor | Notes |
|----|----------|--------|-------|
| `akeneo` | Akeneo PIM | Akeneo | Open source + Enterprise. Market leader in PIM. Product data governance. |
| `salsify` | Salsify | Salsify | PXM platform. Commerce-focused. Digital shelf analytics. |
| `inriver` | inriver | inriver | Cloud-native PIM. Supply chain integration. Headless API. |
| `pimcore` | Pimcore | Pimcore | Open source PIM + DAM + MDM + CDP. PHP/Symfony. Self-hosted. |

### ERP Integration

| ID | Platform | Vendor | Notes |
|----|----------|--------|-------|
| `sap` | SAP S/4HANA | SAP | Enterprise ERP market leader. Cloud + on-prem. Mandatory migration from ECC by 2027. |
| `netsuite` | NetSuite | Oracle | Cloud ERP for mid-market. 38K+ customers. SuiteCommerce for B2B/B2C. |
| `dynamics-365-erp` | Dynamics 365 F&O/BC | Microsoft | Finance + Supply Chain + Business Central (SMB). Copilot AI. |

### Data Warehousing

| ID | Platform | Vendor | Current Version | Notes |
|----|----------|--------|-----------------|-------|
| `snowflake` | Snowflake | Snowflake | SaaS (continuous) | Cloud data platform. Snowpark for ML. Cortex AI. ~$2.5B annual revenue. |
| `databricks` | Databricks | Databricks | SaaS (continuous) | Lakehouse platform. Delta Lake. Unity Catalog. Mosaic AI. Acquired Neon. $2.4B+ revenue. |
| `bigquery` | BigQuery | Google | SaaS (continuous) | Serverless data warehouse. ML integration (BigQuery ML). Omni for multi-cloud. |
| `redshift` | Amazon Redshift | Amazon | SaaS (continuous) | AWS-native warehouse. Redshift Serverless. ML integration. |
| `clickhouse` | ClickHouse | ClickHouse Inc | Open source/SaaS | Real-time OLAP. Blazing fast analytical queries. Open source. |
| `apache-iceberg` | Apache Iceberg | Apache Foundation | Open source | Open table format. Vendor-neutral lakehouse. Adopted by Snowflake, Databricks, AWS. |

### ETL / Data Integration

| ID | Platform | Vendor | Current Version | Notes |
|----|----------|--------|-----------------|-------|
| `fivetran` | Fivetran + dbt | Fivetran | SaaS (continuous) | Merged with dbt Labs (Feb 2025, $5.2B deal). 500+ connectors + SQL transformations. |
| `airbyte` | Airbyte | Airbyte | Open source/SaaS | 350+ connectors. Open source. Self-hostable. Growing rapidly. |
| `airflow` | Apache Airflow | Apache Foundation | 3.0 (2025) | Workflow orchestration. Python-native. Airflow 3.0 with major architecture overhaul. |
| `dagster` | Dagster | Dagster Labs | Open source/SaaS | Software-defined data assets. Type-safe. Modern alternative to Airflow. |
| `prefect` | Prefect | Prefect | Open source/SaaS | Python workflow orchestration. Dynamic workflows. Prefect 3.x. |

### Payments

| ID | Platform | Vendor | Notes |
|----|----------|--------|-------|
| `stripe` | Stripe | Stripe | Market leader for online payments. Stripe Connect, Billing, Revenue Recognition. $60B+ valuation. |
| `adyen` | Adyen | Adyen | Enterprise unified commerce. Single platform: online + in-store + mobile. $1.6B+ revenue. |
| `paypal` | PayPal / Braintree | PayPal | Consumer payments + Braintree for developers. 430M+ active accounts. |
| `square` | Square | Block (Jack Dorsey) | Commerce ecosystem. POS + online. Developer APIs. SMB focus. |
| `worldpay` | Worldpay | GTCR + Global Payments | Enterprise payment processing. Highest global transaction volume. |

---

## Migration Paths

### CMS Platform Migrations

| Path | Prevalence | Complexity | Primary Drivers |
|------|-----------|------------|----------------|
| **Sitecore XP → Sitecore XM Cloud (AI)** | Very Common | Transformational | Vendor strategic push to SaaS. Eliminates $471K+/yr in infrastructure/upgrade costs. Despite being a "migration," this is effectively a full rebuild — new headless frontend (Next.js/React), new deployment model, new content architecture. Sitecore claims AI Pathway tool cuts timeline by 70%. |
| **Sitecore XP → Optimizely** | Common (growing) | Major | 50+ companies migrated with zero reported reverse migrations. Driven by Sitecore's escalating licensing fees, complex infrastructure costs, and pain of XM Cloud rebuild. Familiar .NET underpinnings. |
| **Sitecore XP → Contentful + headless** | Common | Transformational | Full exit from Sitecore ecosystem to composable API-first architecture. Sitecore's own AI Pathway tool now supports migration to Contentful, acknowledging this path. |
| **Sitecore XP → Custom headless** | Common | Transformational | Full architectural freedom. Organizations tired of vendor lock-in pair a headless CMS with Next.js/Nuxt. Better Core Web Vitals, faster TTM, developer flexibility. |
| **Optimizely → Sitecore XM Cloud** | Niche | Major | Rare. Industry data shows movement overwhelmingly Sitecore→Optimizely. Only for specific Sitecore ecosystem requirements (deep CDP/personalization). |
| **Optimizely CMS → Optimizely SaaS** | Very Common | Major | Optimizely's SaaS CMS launched July 2024. Purely headless, versionless. PaaS customers being pushed to SaaS. Equivalent of Sitecore's XM Cloud push. |
| **Episerver → Optimizely** | Very Common | Minor–Moderate | Rebrand in Jan 2021. Platform evolution CMS 11→12 involves .NET Framework 4 → .NET 6+ migration. CMS 13 launching Q1 2026 is most significant upgrade in platform history. |
| **WordPress → Headless WP + Next.js** | Very Common | Moderate–Major | Keep WP's authoring experience with modern frontend performance. Vercel provides first-class integration. Typical migration 4-8 weeks. |
| **WordPress → Contentful/Sanity/Strapi** | Common | Major | Outgrowing monolithic architecture. Plugin complexity and security concerns. All headless targets enable omnichannel delivery across 8+ channels. |
| **Drupal 7/8 → Drupal 10/11** | Very Common | Major | Drupal 7 EOL Jan 5, 2025. ~40% of sites were still on v7 at EOL. Requires Migrate module, module replacement, theme rebuilds (PHPTemplate→Twig). Drupal 10 EOL Dec 2026 — Drupal 11 is real target. |
| **Drupal → Headless CMS** | Common | Transformational | Using Drupal EOL as opportunity to exit ecosystem entirely. Composable architecture goals. Contentstack and Contentful both offer enterprise headless alternatives. |
| **AEM on-prem → AEM Cloud Service** | Very Common | Major–Transformational | Adobe's strategic push. Auto-scaling, zero-downtime updates, integrated CI/CD. Four phases: Readiness→Implementation→Go-Live→Post Go-Live. Adobe provides Cloud Acceleration Manager. |
| **Ektron → Anything** | Common | Major | Dead platform. Active development ceased. $10K-50K/yr licensing for deprecated product. Primary targets: Optimizely (natural successor), WordPress, Drupal, Contentful. |
| **Sitefinity → Sitecore/Optimizely/Headless** | Niche–Common | Major | Sitefinity's mindshare at 3.6%. Organizations outgrowing capabilities migrate to larger ecosystems or go headless. Progress continues development. |
| **DNN → Modern CMS** | Common | Major | Architecture built on ASP.NET Web Forms from 2002. Slow page loads, heavy resource usage. Targets: Umbraco, Kentico, Sitecore (.NET), WordPress, Drupal, headless. |
| **Kentico → Xperience by Kentico** | Very Common | Major | Kentico 12 and earlier are EOL. Open-source Migration Tool transfers content from v11/12/13. One corporate site migrated in ~60 hrs using tool vs ~300 hrs to rebuild (80% reduction). |
| **SDL Tridion → Headless CMS** | Niche | Major–Transformational | Mindshare declining 6.3%→4.0%. Complex enterprise WCM. Xillio provides specialized migration connectors. Driven by desire to simplify and reduce costs. |

### Version Upgrade Paths

| Path | Prevalence | Complexity | Primary Drivers |
|------|-----------|------------|----------------|
| **Sitecore 9.x → 10.x** | Very Common | Major | Sitecore 9.2/9.3 extended support ended Dec 2025. Traditional upgrades can exceed $500K. Complexity from customization, third-party integrations, deprecated features. Often a waypoint to XM Cloud. |
| **Sitecore 10.x → XM Cloud** | Very Common | Transformational | Even on supported version, Sitecore pushing toward XM Cloud. Eliminates $471K+/yr costs. Requires full frontend rebuild on Next.js/React. Many orgs "downgrade" from XP to XM first. |
| **Umbraco 8 → 10 → 13 → 14+** | Very Common | Moderate–Major | Umbraco 8 EOL Feb 24, 2025. No direct v8→v13 path — must go through v10 (.NET Framework→.NET Core). v10→v13 smoother. Tools: uSync, Umbraco Deploy. ~$2,500 for standard sites. |
| **Drupal 7 → 10/11** | Very Common | Major | Critical urgency. ~40% of sites still on v7 at EOL. Extended security support until Jan 2027 (stopgap). Requires Migrate module, module review, theme rebuilds. |
| **Kentico 12 → Xperience by Kentico** | Very Common | Major | Kentico 12 is EOL. Path: v12→Kentico 13→Xperience by Kentico. Open-source Migration Tool. 80% effort reduction vs rebuild. 6-12 month timeline. |
| **Optimizely CMS 11 → 12** | Very Common | Moderate–Major | .NET Framework 4 → .NET 6+. No DB migration needed (except user tables: ASP.NET Identity→OpenId). MS Upgrade Assistant extended with CMS-specific rules. |
| **.NET Framework → .NET 8+** | Very Common | Major | .NET 6 EOL Nov 2024. .NET 8 LTS through 2026, .NET 10 LTS through 2028. WebForms fully deprecated (no migration path — must redesign). WCF unsupported (use CoreWCF). AI tools showing 35% reduction in migration time. |

### Cloud Infrastructure Migrations

| Path | Prevalence | Complexity | Primary Drivers |
|------|-----------|------------|----------------|
| **AWS → Azure** | Common | Major | Microsoft enterprise agreements and bundling. .NET workload affinity. Compliance requirements. 87% of enterprises now multi-cloud. |
| **Azure → AWS** | Common | Major | AWS's broader service catalog. Specific AI/ML requirements. Cost optimization for compute-heavy workloads. |
| **On-prem → AWS** | Very Common | Major–Transformational | AWS calls 2025 "the inflection point." Average 20-30% IT cost reduction vs on-prem. AI/ML workloads now 25%+ of cloud spending. AWS Migration Hub + DMS. |
| **On-prem → Azure** | Very Common | Major–Transformational | MS enterprise agreement bundling. .NET compatibility. Azure Arc for hybrid. Government cloud certifications. Azure Migrate tooling. |
| **On-prem → GCP** | Common | Major–Transformational | AI-first workloads. BigQuery for analytics. GKE as reference K8s. Cost optimization for specific verticals. |
| **Any Cloud → Multi-Cloud** | Very Common | Transformational | 87% of enterprises adopt multi-cloud. 58% of CIOs cite single-hyperscaler dependency as key risk. ~90% expected hybrid by 2027. |
| **Traditional → Vercel/Netlify** | Very Common | Moderate–Major | JAMstack "gold standard" for modern web. 40% increase in organic mobile traffic reported. 85% page load improvement (Smashing Magazine). |
| **VMs → Kubernetes** | Very Common | Major–Transformational | 76% of orgs adopted containers. 36% median compute cost reduction. VMware licensing changes accelerating K8s adoption. |
| **IaaS → PaaS** | Very Common | Major | 63%+ of projects hosted on PaaS. 32% operational efficiency boost, 25% scalability improvement, 35% less downtime. |
| **Monolith → Microservices** | Very Common | Transformational | Market growing $2B→$5.61B by 2030 (22.88% CAGR). 74% of enterprises plan to move away from monoliths by 2026. Strangler pattern dominant. Modular monolith as pragmatic middle ground. |

### E-Commerce Migrations

| Path | Prevalence | Complexity | Primary Drivers |
|------|-----------|------------|----------------|
| **Magento → Shopify Plus** | Very Common | Major | "The Great Replatforming." Merchants fleeing escalating hidden Magento costs (infra, custom dev, security patching, perf tuning). 88% of larger orgs plan commerce modernization within 12 months. |
| **Magento → Adobe Commerce Cloud** | Common | Major | Natural upgrade for Adobe ecosystem commitment. Managed infrastructure eliminates self-hosted overhead. Retains Magento customization depth. |
| **Magento → commercetools** | Emerging | Transformational | 87% of leaders have favorable view of composable commerce. API-first architecture. Faster AI integration via composable approach. |
| **Salesforce Commerce → Shopify Plus** | Common (growing) | Major | "Soaring platform costs and constraints." Brands like Fenty Beauty, Crabtree & Evelyn migrated. Shopify Plus significantly cheaper to operate. |
| **WooCommerce → Shopify Plus** | Very Common | Moderate | Constant plugin updates, technical management, hosting costs, security concerns push growing businesses to all-in-one reliability. Note: 2026 counter-trend of some brands returning to WooCommerce for AI customization flexibility. |
| **Custom → commercetools/Elastic Path** | Emerging–Common | Transformational | Aging custom platforms face mounting technical debt. Composable commerce replaces custom code with managed microservices. Cross-border commerce in 2026 requires real-time tax, localized currency, multi-warehouse fulfillment. |

### MarTech Migrations

#### Marketing Automation

| Path | Prevalence | Complexity | Primary Drivers |
|------|-----------|------------|----------------|
| **Mailchimp → HubSpot** | Very Common | Moderate | Growth beyond email-only to full CRM + marketing automation. Mailchimp's limited CRM and workflow capabilities. HubSpot's all-in-one CRM + marketing + sales + service. Common path for SMBs graduating to enterprise marketing. |
| **Mailchimp → Klaviyo** | Very Common | Moderate | E-commerce businesses needing deeper Shopify/WooCommerce integration. Klaviyo's superior product recommendation engine and behavioral segmentation. Revenue attribution reporting. $20-2,315+/mo. |
| **Marketo → HubSpot** | Common | Major | Marketo's complexity and cost ($895-3,195/mo) vs HubSpot's integrated UX. Organizations simplifying their stack. Adobe ecosystem lock-in concerns. Data migration (lead scoring, nurture programs, templates) is the hard part. |
| **Pardot → HubSpot** | Common (growing) | Major | Salesforce's confusing MCAE rebranding. Limited UI innovation. Organizations that don't need the full Salesforce CRM but were locked in via Pardot. HubSpot's superior reporting and ease of use. |
| **ActiveCampaign → HubSpot** | Common | Moderate | Outgrowing ActiveCampaign's reporting. Need for CRM + marketing + sales alignment. HubSpot's ecosystem of integrations. |

#### CRM

| Path | Prevalence | Complexity | Primary Drivers |
|------|-----------|------------|----------------|
| **Salesforce → HubSpot CRM** | Common | Major | Cost reduction ($25-500+/user/mo vs HubSpot's free CRM). Simpler UX. SMB/mid-market orgs that over-bought Salesforce. Data migration (custom objects, automations, reports) is complex. 12-16 week typical timeline. |
| **HubSpot CRM → Salesforce** | Common | Major | Enterprise growth requiring advanced customization, CPQ, complex reporting. Salesforce's AppExchange ecosystem. Organizations graduating to enterprise-grade CRM. |
| **Dynamics 365 → Salesforce** | Niche-Common | Major | Moving away from Microsoft ecosystem. Salesforce's larger partner ecosystem. Better mobile experience. Industry-specific solutions. |

#### Analytics

| Path | Prevalence | Complexity | Primary Drivers |
|------|-----------|------------|----------------|
| **GA Universal → GA4** | Very Common (forced) | Moderate | Google sunset Universal Analytics July 2023, stopped processing hits July 2024. Completely different data model (sessions→events). 40%+ of sites struggled with transition. |
| **GA4 → Privacy-first alternatives** | Emerging (growing) | Moderate | GDPR/CCPA compliance concerns. Cookie consent fatigue reducing GA4 data quality by 30-60%. PostHog, Plausible, Fathom gaining share. Self-hosted options for data sovereignty. |
| **Adobe Analytics → Mixpanel/Amplitude** | Niche | Major | Cost reduction. Simpler implementation. Product analytics focus vs marketing analytics. Developer-friendly APIs. |

#### CDP

| Path | Prevalence | Complexity | Primary Drivers |
|------|-----------|------------|----------------|
| **No CDP → First CDP** | Very Common | Major | Organizations with data silos needing unified customer view. Cookie deprecation driving first-party data strategy. Typical first CDPs: Segment (most popular), Tealium (enterprise), RudderStack (open source). |
| **Segment → RudderStack** | Emerging | Moderate | Segment pricing concerns at scale. Data sovereignty requirements (RudderStack is warehouse-native). Open-source option for self-hosting. |
| **Segment → Hightouch** | Emerging | Moderate | "Composable CDP" movement. Hightouch activates data directly from existing data warehouse (Snowflake, BigQuery) instead of duplicating it. Lower cost at scale. |
| **DMP → CDP** | Common | Major | Third-party cookie deprecation killing DMPs. Oracle Advertising shutdown (Sep 2024). Migration to first-party CDPs (Segment, Tealium, mParticle). Fundamental architecture shift. |

#### Personalization / Experimentation

| Path | Prevalence | Complexity | Primary Drivers |
|------|-----------|------------|----------------|
| **Google Optimize → VWO/Optimizely/AB Tasty** | Very Common (forced) | Minor-Moderate | Google Optimize sunset September 2023. VWO offered free migration tool. Optimizely and AB Tasty captured enterprise share. Biggest beneficiary: VWO (aggressive pricing + migration support). |
| **Custom rules → ML-based personalization** | Emerging | Major | Manual rule-based personalization hitting ceiling. Dynamic Yield, Bloomreach, and Coveo leading AI-powered personalization. 20-30% revenue lift reported. |

#### DAM

| Path | Prevalence | Complexity | Primary Drivers |
|------|-----------|------------|----------------|
| **SharePoint/filesystem → DAM** | Very Common | Moderate-Major | Unstructured asset storage → governed DAM. Brand consistency. Metadata taxonomy. Typical targets: Bynder, Brandfolder, Cloudinary. |
| **Legacy DAM → Cloudinary** | Common | Moderate | On-prem DAM → cloud-native media management. Real-time transformation. CDN delivery. Developer-friendly APIs. |

### AI Adoption Paths

| Path | Prevalence | Complexity | Primary Drivers |
|------|-----------|------------|----------------|
| **No AI → AI-powered features** | Very Common | Moderate-Major | Adding AI capabilities to existing digital experiences: chatbots, content generation, semantic search, recommendation engines. Claude API, OpenAI API, or Vercel AI SDK integration. Typical starting points: chat support (Intercom Fin), content assist, AI search. |
| **Traditional search → Semantic/vector search** | Common (growing) | Major | Keyword search → vector-powered semantic understanding. Adding Pinecone/Weaviate/pgvector alongside existing search. RAG pipelines for documentation and knowledge bases. 2-4x improvement in search relevance reported. |
| **No agents → AI agent workflows** | Emerging | Major | Building agent-powered automation: Claude Code for development, LangGraph for orchestration, CrewAI for multi-agent teams. Content generation pipelines, automated QA, intelligent customer service. MCP protocol for tool integration. |
| **Manual content → AI content generation** | Very Common | Minor-Moderate | Adding AI content assist to CMS workflows. Claude/GPT integration for draft generation, translation, SEO optimization. Most CMS vendors now offer native AI features (Sitecore AI, Contentful AI, Hygraph AI Assist). |
| **Traditional analytics → AI-powered insights** | Common | Moderate | Moving from manual dashboard analysis to AI-generated insights. Tools: PostHog AI, Amplitude AI, Mixpanel Spark. Predictive analytics, anomaly detection, natural language querying. |

### Data Infrastructure Migrations

| Path | Prevalence | Complexity | Primary Drivers |
|------|-----------|------------|----------------|
| **On-prem DW → Snowflake** | Very Common | Major-Transformational | Legacy Oracle/SQL Server/Teradata → cloud-native Snowflake. Elastic scaling. Consumption-based pricing. Cortex AI for in-warehouse ML. Average 30-50% cost reduction after migration. |
| **On-prem DW → Databricks** | Common | Major-Transformational | Lakehouse architecture combining data warehouse + data lake. Best for ML-heavy workloads. Unity Catalog for governance. Delta Lake for ACID transactions on data lakes. |
| **Manual ETL → Fivetran + dbt** | Very Common | Moderate-Major | Custom scripts → managed ELT. Fivetran for ingestion (500+ connectors), dbt for transformation (SQL-based). Merged Feb 2025 ($5.2B deal). Reduced data engineering overhead by 60-80%. |
| **Manual ETL → Airbyte** | Common | Moderate | Open-source alternative to Fivetran. Self-hostable. 350+ connectors. Lower cost at scale. Growing community. Good for data sovereignty requirements. |
| **No MLOps → ML pipeline** | Emerging | Major | Adding ML capabilities. MLflow, Weights & Biases, SageMaker, Vertex AI. Feature stores (Feast, Tecton). Model monitoring. Typical first use cases: recommendation engines, churn prediction, demand forecasting. |

### Payment / Commerce Infrastructure Migrations

| Path | Prevalence | Complexity | Primary Drivers |
|------|-----------|------------|----------------|
| **Legacy payments → Stripe** | Very Common | Moderate-Major | Moving from legacy payment gateways to Stripe's unified platform. Revenue recognition, billing management, Connect for marketplaces. Developer-first API. Webhook-driven architecture. |
| **Single PSP → Multi-PSP** | Common | Major | Adding payment orchestration (Stripe + Adyen + PayPal) for global reach, redundancy, and cost optimization. Smart routing for transaction success rate improvement (2-5% lift). |
| **Legacy PIM → Akeneo** | Common | Major | Spreadsheets/legacy PIM → modern PIM. Product data governance. Multi-channel publishing. AI-powered data quality. Average 50% reduction in time-to-market for new products. |
| **SAP ECC → S/4HANA** | Very Common (forced) | Transformational | SAP ECC mandatory migration to S/4HANA by 2027 (extended from 2025). Massive enterprise project. Cloud-native architecture. Embedded analytics. Average 18-24 month timeline. |

### Cross-Cutting Trends (2025-2026)

1. **AI-Accelerated Migration**: AI tools reducing timelines by 35-70%. Sitecore AI Pathway, Microsoft Upgrade Assistant, GoatSwitch, LegacyLeap transforming 12-18 month projects into 4-6 month efforts. Claude Code and AI coding assistants transforming custom development.
2. **Composable Architecture**: Dominant pattern driving migrations. Monolithic DXPs → best-of-breed, API-first compositions. MACH Alliance principles becoming default.
3. **EOL Cascade**: 2025 saw historic convergence — Drupal 7, Umbraco 8, Sitecore 9.x, .NET 6 all hit EOL. SAP ECC mandatory migration by 2027 is next wave.
4. **SaaS Vendor Push**: Every major vendor (Sitecore, Optimizely, Adobe, Kentico) pushing customers toward SaaS/cloud. Self-hosted increasingly unsupported.
5. **Multi-Cloud Default**: 87% of enterprises adopting multi-cloud. 90% expected hybrid by 2027. Single-cloud is the exception.
6. **CDP + First-Party Data**: Third-party cookie deprecation driving CDP adoption. Oracle Advertising shutdown. DMP→CDP migration wave. Warehouse-native CDPs (RudderStack, Hightouch) emerging.
7. **AI Agent Economy**: LLM-powered agents entering every MarTech category. Salesforce Agentforce, Intercom Fin, HubSpot Breeze, Sitecore AI. MCP protocol enabling tool connectivity.
8. **Privacy-First Analytics**: GDPR enforcement + cookie consent fatigue driving 30-60% data quality loss in GA4. PostHog, Plausible, and server-side analytics growing rapidly.
9. **Data Stack Consolidation**: Fivetran + dbt merger ($5.2B). Snowflake Cortex AI. Databricks + Neon acquisition. Data warehouses becoming AI-powered platforms.
10. **MarTech Rationalization**: Average enterprise uses 91 MarTech tools. Consolidation trend toward platforms (HubSpot, Salesforce) that replace 5-10 point solutions.

---

## Knowledge URL Registry

Every knowledge pack must capture **source URLs** for all claims. This enables:
- **Traceability**: Every fact in an estimate can be traced to its source
- **Freshness verification**: Re-check URLs to see if information has changed
- **Client transparency**: Share sources with clients who want to verify claims
- **Research agent re-runs**: Agents can revisit sources to update knowledge

### URL Registry Schema

Each knowledge pack includes a `sources.json`:

```json
{
  "pack_id": "sitecore-xp",
  "last_updated": "2026-02-22",
  "sources": [
    {
      "id": "src-001",
      "url": "https://developers.sitecore.com/...",
      "title": "Sitecore XP 10.4 Release Notes",
      "type": "vendor-docs",       // vendor-docs | community | case-study | pricing | changelog | forum | blog
      "accessed": "2026-02-22",
      "claims": ["versions/version-matrix.json#10.4", "architecture/overview.md#topology-support"],
      "confidence": "verified",
      "still_accessible": true
    }
  ]
}
```

### URL Categories

| Type | Description | Confidence Weight |
|------|-------------|-------------------|
| `vendor-docs` | Official vendor documentation, release notes, API docs | Highest |
| `changelog` | Official changelogs, release announcements | High |
| `pricing` | Official pricing pages (snapshot — these change frequently) | High (time-sensitive) |
| `case-study` | Published migration case studies, ROI reports | High |
| `community` | Community blogs, Stack Overflow, forum posts | Medium |
| `forum` | Vendor community forums, GitHub discussions | Medium |
| `blog` | Third-party blog posts, analysis articles | Medium-Low |
| `benchmark` | Performance benchmarks, comparison reports | Medium (verify methodology) |

### Freshness Protocol

- **Research agents** capture all URLs during initial research
- **Freshness checker** (automated) pings URLs monthly to verify accessibility
- **Re-research trigger**: If >20% of URLs for a pack are stale, trigger agent re-research
- **Version bumps**: When a vendor releases a new major version, trigger targeted re-research of affected packs

---

## Research Agent Team

### Agent Roster

| # | Agent | Responsibility | Primary Sources | Output Files |
|---|-------|---------------|-----------------|--------------|
| 1 | **Architecture Analyst** | Component maps, data flows, topology constraints, deployment models | Vendor docs, deployment guides, reference architectures, Docker/K8s configs | `architecture/`, `topologies.json`, `component-map.json` |
| 2 | **Version Historian** | Breaking changes, deprecations, upgrade paths, compatibility matrices | Release notes, changelogs, migration guides, community forums | `versions/`, `version-matrix.json`, `breaking-changes/` |
| 3 | **Ecosystem Scout** | Module compatibility, package health, integration patterns, community vitality | Marketplace, GitHub/NuGet/npm, community blogs, forum activity | `ecosystem/` |
| 4 | **Gotcha Miner** | Real-world failure patterns, edge cases, production war stories | Stack Overflow, forums, blog posts, post-mortems, case studies | `heuristics/gotcha-patterns.json`, `migration/` |
| 5 | **Effort Calibrator** | Baseline hours, role requirements, timeline patterns, cost benchmarks | Case studies, RFP responses, vendor PS estimates, consulting benchmarks | `heuristics/effort-hours.json`, `heuristics/multipliers.json` |
| 6 | **Security Auditor** | CVEs, patching requirements, compliance implications, hardening guides | NVD, vendor security bulletins, OWASP, CIS benchmarks | `security/` |
| 7 | **Licensing Analyst** | Cost models, tier implications, migration licensing gotchas, vendor lock-in | Vendor pricing pages, partner program docs, licensing FAQs | `licensing/` |
| 8 | **Path Mapper** | Source→target service mappings, migration tooling, data transformation strategies | Vendor migration docs, competitor comparison guides, tool documentation | `migration-paths/` |
| 9 | **Discovery Builder** | Generate discovery tree questions from platform profile | All agent outputs + existing discovery trees as templates | `discovery/discovery-tree.json` |

### Research Protocol

Each agent follows a structured protocol:

1. **Gather** — Search vendor docs, community sources, case studies
2. **Cross-reference** — Verify facts across multiple sources, note conflicts
3. **Structure** — Output data in the pack schema (JSON/markdown)
4. **Confidence tag** — Every fact gets a confidence level:
   - `verified` — Confirmed in official vendor docs
   - `community` — Multiple community sources agree
   - `inferred` — Logical deduction from related facts
   - `unverified` — Single source, needs validation
5. **Source cite** — Every claim links to its source URL/document
6. **Review gate** — Human reviews before pack goes live

### Agent Orchestration

```
Platform Research Pipeline:
                                        ┌─────────────────────┐
                              ┌────────→│ Version Historian    │────┐
                              │         └─────────────────────┘    │
┌──────────────────┐          │         ┌─────────────────────┐    │    ┌──────────────────┐
│ Architecture     │──────────┼────────→│ Ecosystem Scout     │────┼───→│ Discovery        │
│ Analyst          │          │         └─────────────────────┘    │    │ Builder          │
└──────────────────┘          │         ┌─────────────────────┐    │    └──────────────────┘
        │                     ├────────→│ Security Auditor    │────┤            │
        │                     │         └─────────────────────┘    │            │
        │                     │         ┌─────────────────────┐    │            ▼
        │                     ├────────→│ Licensing Analyst   │────┤    ┌──────────────────┐
        │                     │         └─────────────────────┘    │    │ Effort           │
        │                     │         ┌─────────────────────┐    │    │ Calibrator       │
        │                     └────────→│ Gotcha Miner        │────┘    └──────────────────┘
        │                               └─────────────────────┘                 │
        │                                                                       ▼
        │                               ┌─────────────────────┐         ┌──────────────────┐
        └──────────────────────────────→│ Path Mapper         │────────→│ Human Review     │
                                        └─────────────────────┘         └──────────────────┘
```

1. **Architecture Analyst** runs first — establishes the platform's component model
2. **5 parallel agents** run next using the architecture as input
3. **Discovery Builder** synthesizes all agent outputs into the discovery tree
4. **Effort Calibrator** uses discovery tree + gotchas to build effort estimates
5. **Path Mapper** runs per target platform to build migration path knowledge
6. **Human Review** validates and approves the pack

---

## Implementation Phases

### Phase 0: Foundation (Current Sprint)
> Restructure what exists without breaking anything

- [x] **0.1** Write this plan document
- [x] **0.2** Save architecture decisions to project memory
- [ ] **0.3** Update og:image and tagline for broader positioning (currently says "Sitecore Migration Planning")
- [ ] **0.4** Update og:description in app.html to reflect digital experience migration positioning
- [ ] **0.5** **Wipe existing Sitecore-specific knowledge data** — all existing files in `skills/migrate-knowledge/` will be replaced with fresh research using the new pack structure. Current data was hand-built and Sitecore-only; the new system will regenerate everything via research agents.
- [x] **0.6** Add Knowledge URL Registry infrastructure — Implemented as `knowledge_source_urls` DB table + `save_source_urls` MCP tool (freshness checker TBD)

### Phase 1: Knowledge Base DB Schema
> Move knowledge from JSON files into PostgreSQL, accessed via MCP tools

**Supersedes** the original file-based restructure plan. Knowledge now lives in the database, not in `skills/migrate-knowledge/` JSON files. Research agents write directly via MCP tools.

- [x] **1.1** Design and create 14 knowledge base tables in Drizzle schema:
  - `knowledge_packs` — core platform/service/martech entities with category, direction, compatibility
  - `knowledge_pack_versions` — auto-incrementing snapshot tracking per pack
  - `knowledge_discovery_trees` — versioned discovery question trees (JSONB)
  - `knowledge_effort_hours` — base hours per component
  - `knowledge_multipliers` — complexity multipliers with conditions
  - `knowledge_gotcha_patterns` — risk patterns with mitigation
  - `knowledge_dependency_chains` — ordering constraints between components
  - `knowledge_phase_mappings` — phase→component grouping
  - `knowledge_roles` — role definitions with rate ranges
  - `migration_paths` — source→target migration knowledge with service maps, guides, gotchas
  - `knowledge_ai_alternatives` — AI tool catalog per pack
  - `knowledge_source_urls` — URL registry for source traceability
  - `assessment_knowledge_pins` — assessment↔knowledge version pinning
  - `knowledge_proficiency_catalog` — global tech proficiency categories
- [x] **1.2** Create query functions (6 files in `packages/db/src/queries/`):
  - `knowledge-packs.ts` — save/get/getFull/list/delete with parallel multi-table expansion
  - `knowledge-heuristics.ts` — atomic delete-then-insert for all 6 heuristic types + multi-pack fetch
  - `knowledge-discovery.ts` — versioned save + multi-pack composed tree fetch
  - `migration-paths.ts` — upsert + lookup by ID or source+target pair + filtered list
  - `knowledge-sources.ts` — bulk append + filtered fetch by pack or path
  - `knowledge-pins.ts` — auto-resolve latest version + upsert pins with pack metadata join
- [x] **1.3** Register 16 MCP tools in `apps/mcp-server/src/tools/knowledge.ts`:
  - Pack CRUD: `save_knowledge_pack`, `get_knowledge_pack`, `list_knowledge_packs`, `delete_knowledge_pack`
  - Discovery: `save_discovery_tree`, `get_discovery_tree`
  - Heuristics: `save_heuristics`, `get_heuristics`
  - Migration paths: `save_migration_path`, `get_migration_path`, `list_migration_paths`
  - Sources & AI: `save_source_urls`, `save_ai_alternatives`
  - Pinning: `pin_knowledge_version`, `get_pinned_knowledge`
  - Catalog: `save_proficiency_catalog`
- [x] **1.4** Push schema to PostgreSQL — all 14 tables verified
- [x] **1.5** Seed initial Sitecore XP pack from existing `skills/migrate-knowledge/` JSON files into DB — 22 effort hours, 28 multipliers, 21 gotchas, 18 dependency chains, 5 phases, 5 roles, 17 discovery dimensions, 25 AI alternatives, 11 proficiency categories, 6 source URLs
- [x] **1.6** Seed initial AWS + Azure infrastructure packs and migration path (`sitecore-xp-aws->azure`) with full 16-category service map, incompatibilities, Azure requirements, and topology decision tree
- [x] **1.7** Update `/migrate discover` skill to read discovery tree from DB via `get_discovery_tree` MCP tool (with file fallback)
- [x] **1.8** Update `/migrate analyze` skill to read heuristics + migration path from DB via `get_heuristics` and `get_migration_path` MCP tools (with file fallback)
- [x] **1.9** Update `/migrate estimate` skill to read effort hours, multipliers, gotchas, chains, AI alternatives from DB via `get_heuristics` and `get_knowledge_pack` MCP tools (with file fallback)
- [x] **1.10** Add URL freshness checker — `checkUrlFreshness()` query function, `check_url_freshness` MCP tool, and `check-url-freshness.ts` CLI script. HEAD-requests with GET fallback, batched 5 at a time, respects stale threshold (default 7 days), updates `still_accessible` + `accessed_at`

### Phase 2: Data Model Evolution
> Update assessment schema to support generic source/target stacks

- [x] **2.1** Add `source_stack`, `target_stack`, `migration_scope` JSONB columns to `assessments` table — schema pushed to PostgreSQL
- [x] **2.2** Update DB queries (`SaveAssessmentInput`), MCP tool Zod schema, MCP server registration, and web API endpoint to accept and persist new fields
- [x] **2.3** Write migration script (`migrate-stacks.ts`) — populated 3 existing assessments from legacy fields. Idempotent (skips already-migrated).
- [x] **2.4** Legacy fields (`sitecore_version`, `topology`, `source_cloud`, `target_cloud`) kept in schema and populated on save for backward compatibility
- [x] **2.5** Update UI assessment creation flow:
  - New page server loads knowledge packs (`platforms`, `infrastructure`) from DB
  - Step 3 form replaced: source stack builder (platform → version → topology → infrastructure from packs) + target stack builder
  - `createAssessment` builds `source_stack`, `target_stack`, `migration_scope` objects + derives legacy fields
  - Review step shows pack names and infra→infra path
- [x] **2.6** Update overview page (desktop + mobile migration path display), home page project cards, and deliverables finalize endpoint to read from `source_stack`/`target_stack` with legacy field fallbacks
- [x] **2.7** Update all skills (`/migrate new`, `/migrate discover`, `/migrate analyze`, `/migrate estimate`, `/migrate plan`) to read pack IDs from assessment `source_stack`/`target_stack` for dynamic knowledge loading

### Phase 3: Discovery Tree Composition Engine ✅
> Dynamic discovery trees based on source/target stack

- [x] **3.1** Build a tree composition function: `composeDiscoveryTree(sourceStack, targetStack) → mergedTree` — implemented in `packages/db/src/queries/composition.ts` with `resolvePackIds()`, `composeDiscoveryTree()`, and `composeHeuristics()`. Priority-based merging (infra=10 > platform=20 > service=30). Exported via `packages/db/src/index.ts`. MCP tools `get_composed_discovery_tree` and `get_composed_heuristics` registered in `apps/mcp-server/`.
- [x] **3.2** Handle question deduplication (infrastructure questions appear in both source and base) — dimensions merged by ID, questions deduped by `id`/`question_id` with first-seen (higher-priority pack) wins
- [x] **3.3** Handle conditional questions that depend on the migration path — migration path gotchas and effort adjustments overlaid onto composed result; `decision_points` text available via `migration_path_id` in response. Structured path discovery questions deferred to Phase 4 Path Mapper agent.
- [x] **3.4** Update `/migrate discover` skill to use composed trees — cascading fallback: `get_composed_discovery_tree` → `get_discovery_tree` → JSON files. Removed hardcoded "17 dimensions".
- [x] **3.5** Update `/migrate analyze` to load heuristics from the correct packs — uses `get_composed_heuristics` as primary (includes path gotchas, no separate `get_migration_path` needed), with per-pack and JSON fallbacks
- [x] **3.6** Update `/migrate estimate` to compose effort hours from multiple packs — uses `get_composed_heuristics` as primary, with per-pack and JSON fallbacks. Web app `recompute.ts` also tries DB composition first with JSON fallback.

### Phase 4: Research Agent Team ✅
> Build agents that can deep-research any platform and write results directly to DB via MCP tools

- [x] **4.1** Define the research skill schema — standardized prompts, output formats, quality gates → `skills/migrate-research/SCHEMA.md`
- [x] **4.2** Build **Architecture Analyst** agent skill (→ `save_knowledge_pack`) → `skills/migrate-research/agents/architecture-analyst.md`
- [x] **4.3** Build **Version Historian** agent skill (→ `save_knowledge_pack` version fields) → `skills/migrate-research/agents/version-historian.md`
- [x] **4.4** Build **Ecosystem Scout** agent skill (→ `save_knowledge_pack` compatibility fields) → `skills/migrate-research/agents/ecosystem-scout.md`
- [x] **4.5** Build **Gotcha Miner** agent skill (→ `save_heuristics` gotcha_patterns) → `skills/migrate-research/agents/gotcha-miner.md`
- [x] **4.6** Build **Effort Calibrator** agent skill (→ `save_heuristics` effort_hours + multipliers) → `skills/migrate-research/agents/effort-calibrator.md`
- [x] **4.7** Build **Security Auditor** agent skill (→ `save_heuristics` gotcha_patterns + `save_source_urls`) → `skills/migrate-research/agents/security-auditor.md`
- [x] **4.8** Build **Licensing Analyst** agent skill (→ `save_source_urls` + pack metadata) → `skills/migrate-research/agents/licensing-analyst.md`
- [x] **4.9** Build **Path Mapper** agent skill (→ `save_migration_path`) → `skills/migrate-research/agents/path-mapper.md`
- [x] **4.10** Build **Discovery Builder** agent skill (→ `save_discovery_tree`) → `skills/migrate-research/agents/discovery-builder.md`
- [x] **4.11** Build orchestrator skill: `/migrate research {platform}` — runs the full pipeline → `skills/migrate-research/SKILL.md`, registered in `plugin.json`
- [x] **4.12** Test: run full pipeline on Sitecore XP and compare output to existing hand-built knowledge → Created `packages/db/src/seed-sitecore-knowledge.ts` to seed all existing hand-built knowledge into DB (3 packs, 17-dimension discovery tree, 22 components + 28 multipliers + 21 gotchas + 18 chains + 5 phases + 5 roles, aws→azure migration path with 16-category service map + 3 path gotchas + 2 effort adjustments). Verified composition engine resolves correct packs from assessment `source_stack`/`target_stack`, composes discovery tree (17 dims), and merges heuristics with path overlay (24 effort hours, 24 gotchas). Live `/migrate research` pipeline test deferred to Phase 5.

### Phase 5: First New Platform Packs
> Prove the system works end-to-end with additional platforms

- [ ] **5.1** Choose second platform (likely Umbraco or Optimizely based on client demand)
- [ ] **5.2** Run research agent pipeline
- [ ] **5.3** Human review and refinement of generated pack
- [ ] **5.4** Create a test assessment using the new platform
- [ ] **5.5** Run full workflow: new → discover → analyze → estimate → refine
- [ ] **5.6** Compare estimate quality against known real-world migration (if available)
- [ ] **5.7** Iterate: run pipeline on 3rd and 4th platforms

### Phase 6: Migration Path Knowledge
> Build source→target specific knowledge (agents write to `migration_paths` table via MCP)

- [x] **6.1** Seed existing Sitecore XP → Azure path into `migration_paths` table from current knowledge files → Seeded via `seed-sitecore-knowledge.ts`: `aws->azure` migration path with complete service map (16 categories), known incompatibilities, step-by-step guide, decision points, 3 path-specific gotcha patterns, 2 effort adjustments. Also seeded 3 knowledge packs (`sitecore-xp`, `aws`, `azure`), discovery tree, and full heuristics.
- [ ] **6.2** Generate: Sitecore XP → Sitecore AI (via Path Mapper agent → `save_migration_path`)
- [ ] **6.3** Generate: AWS → Azure infrastructure (via Path Mapper agent)
- [ ] **6.4** Generate: Sitecore XP → Optimizely
- [ ] **6.5** Generate: Sitecore XP → Contentful + headless
- [ ] **6.6** Generate migration paths for subsequent platforms and their targets
- [x] **6.7** Update estimate engine to factor in path-specific effort adjustments → Already handled by Phase 3's composition engine: `composeHeuristics()` appends `path_effort_adjustments` to effort_hours and `path_gotcha_patterns` to gotcha_patterns from the migration path. Web app `recompute.ts` uses `getComposedKnowledge()` which calls composition engine.

### Phase 7: Platform Catalog UI
> Let users browse supported platforms and migration paths (reads from knowledge DB tables)

- [x] **7.1** Platform catalog page: browse all packs via `list_knowledge_packs` with confidence levels and version info → `apps/web/src/routes/knowledge/+page.svelte` with KPI row, search (/ shortcut), category chip filters, pack grid with health stats
- [x] **7.2** Migration path explorer: given a source, show available targets via `list_migration_paths` with complexity ratings → Pack detail page `apps/web/src/routes/knowledge/[id]/+page.svelte` Migration Paths tab shows "Migrate From" and "Migrate To" sections with complexity/confidence badges
- [x] **7.3** Knowledge pack health dashboard: coverage %, last updated, confidence scores → Catalog KPIs (platforms, paths, verified, needs research) + per-pack stats (components, gotchas, paths) + detail page Heuristics tab with collapsible effort hours, gotchas, multipliers, chains, phases, roles
- [x] **7.4** Admin: trigger research agent re-run for a platform → Re-Research button on detail page POSTs to `apps/web/src/routes/api/knowledge/[id]/research/+server.ts`, resets confidence to draft

---

## Key Design Decisions

### Decided

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Stack model | Layered composition | Clients have multi-layer environments; migrations can target any layer independently |
| Knowledge approach | Agent-built full knowledge packs | Deep, curated quality with agent speed; human review gate ensures accuracy |
| Discovery trees | Composed from pack layers | Avoids monolithic trees; enables mix-and-match for any migration scenario |
| Custom platform ID | `custom` (not `nextjs-custom`) | Any bespoke build — could be Next.js, Nuxt, SvelteKit, or anything. Framework-specific packs exist separately. |
| Knowledge storage | PostgreSQL via MCP tools (not JSON files) | Agents can write knowledge directly via MCP; enables cross-pack queries, version pinning, and composition |
| Pack versioning | Auto-incrementing integer per pack with assessment pinning | Simple, monotonic, reproducible; `assessment_knowledge_pins` table locks assessments to specific versions |

### Open Questions

| Question | Options | Impact |
|----------|---------|--------|
| How to handle "unknown" platforms? | AI-generated lightweight pack vs. refuse until researched | UX for edge cases |
| ~~Pack versioning strategy?~~ | **Resolved:** Auto-incrementing integer per pack (`knowledge_pack_versions` table) with assessment pinning (`assessment_knowledge_pins`). Assessments pin to specific pack versions for reproducibility. | ~~Reproducibility of estimates~~ |
| How to handle multi-CMS migrations? | One assessment per CMS vs. single assessment with multiple source platforms | Data model complexity |
| Service packs vs. inline? | Separate `services/solr/` pack vs. bundled into platform pack | Reusability vs. simplicity |
| How granular should topologies be? | Enum per platform vs. freeform with validation | Flexibility vs. structure |

---

## Success Metrics

- **Platform coverage:** Number of platforms with "high confidence" knowledge packs across all categories (CMS, MarTech, AI, Data, Commerce, Infrastructure)
- **Time to new platform:** Hours from "we want to support X" to first usable assessment
- **Estimate accuracy:** Actual vs. estimated hours (tracked via calibration system)
- **Migration path coverage:** % of source→target pairs with specific path knowledge
- **Knowledge freshness:** Average age of pack data (target: < 6 months)
- **URL health:** % of source URLs in Knowledge URL Registry that are still accessible
- **MarTech stack coverage:** % of common DX agency tool categories with at least one knowledge pack
- **Cross-layer migrations:** Number of assessments that span multiple stack layers (CMS + MarTech + Infrastructure etc.)

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Knowledge packs become stale | High | Medium | Knowledge URL Registry freshness checks, re-research triggers, automated URL monitoring |
| Agent-generated knowledge has errors | Medium | High | Human review gate, confidence scoring, calibration feedback loop, source URL traceability |
| Data model migration breaks existing assessments | Medium | High | Backward compatibility layer, thorough testing, phased rollout |
| Discovery tree composition produces weird question ordering | Medium | Low | Manual override capability, priority weighting system |
| Scope creep — trying to support too many platforms at once | High | Medium | Prioritize by client demand, one platform at a time through full pipeline |
| Research agent costs escalate with 200+ platforms | Medium | Medium | Batch research runs, cache web search results, incremental updates vs full re-research |
| MarTech landscape changes too fast | High | Medium | Focus on migration-relevant knowledge (not feature parity). Flag SaaS tools that change pricing/features frequently. |
| AI model knowledge becomes outdated within weeks | High | Medium | Date-stamp all AI model claims. Re-research quarterly. Focus on patterns (how to integrate) not versions. |
| Cross-layer migration estimates have compounding errors | Medium | High | Separate confidence scores per layer. Flag cross-layer interactions. Human review for multi-layer assessments. |
| Vendor pricing pages change without notice | High | Low | Snapshot pricing with date. Mark pricing confidence as "time-sensitive". Don't embed pricing in estimates. |

---

## Sources

### Platform Research (Feb 2026)
- [Sitecore XM Cloud Changelog](https://developers.sitecore.com/changelog/xm-cloud)
- [SitecoreAI Announcement](https://cmscritic.com/shock-and-ai-awe-sitecore-unleashes-sitecoreai-its-next-gen-ai-powered-dxp)
- [Sitecore XP 10.4 Release](https://www.getfishtank.com/insights/new-features-in-the-latest-sitecore-version-and-the-future-of-sitecore)
- [Optimizely CMS 12 Release Notes](https://support.optimizely.com/hc/en-us/articles/33309043090189)
- [Optimizely CMS 13 Preview](https://www.optimizely.com/insights/cms-13-what-you-need-to-know/)
- [Xperience by Kentico Jan 2026 Refresh](https://community.kentico.com/blog/xperience-by-kentico-refresh-january-22-2026)
- [AEM Cloud Service Release Notes](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/release-notes/release-notes/release-notes-current)
- [Drupal 11 and Roadmap](https://www.acquia.com/blog/drupal-11)
- [WordPress 7.0 Development](https://make.wordpress.org/core/7-0/)
- [Contentful Innovation Showcase 2025](https://www.contentful.com/innovation-showcase-2025/)
- [Sanity Spring Release 2025](https://www.sanity.io/spring-release-2025)
- [Strapi 5 Migration](https://strapi.io/blog/strapi-5-migration-why-it-is-essential-for-modern-cms)
- [Hygraph Winter 2025 Update](https://hygraph.com/events/2025-winter-product-update)
- [Shopify Editions Winter '26](https://www.shopify.com/editions/winter2026)
- [Adobe Commerce Released Versions](https://experienceleague.adobe.com/en/docs/commerce-operations/release/versions)
- [commercetools API Releases](https://docs.commercetools.com/api/releases)
- [Next.js 16.1 Release](https://nextjs.org/blog/next-16-1)
- [Nuxt 4.3 Release](https://nuxt.com/blog/v4-3)
- [Astro 6 Beta](https://astro.build/blog/astro-6-beta/)
- [Umbraco 17 LTS](https://blog.nashtechglobal.com/umbraco-17-lts-the-ultimate-cms-for-marketing-websites-in-2026/)

### Infrastructure & Services Research (Feb 2026)
- [Cloud Computing Market Share 2026](https://www.programming-helper.com/tech/cloud-computing-market-share-2026-aws-azure-google-cloud-analysis)
- [Heroku Development Freeze](https://www.theregister.com/2026/02/09/heroku_freeze/)
- [Kubernetes Statistics 2026](https://releaserun.com/kubernetes-statistics-adoption-2026/)
- [Valkey vs Redis Guide](https://www.dragonflydb.io/guides/valkey-vs-redis)
- [Best CI/CD Tools 2026](https://spacelift.io/blog/ci-cd-tools)
- [Best WAF Solutions 2025-2026](https://www.fastly.com/blog/best-waf-solutions-2025-2026)
- [Best Cloud Observability Tools 2026](https://cloudchipr.com/blog/best-cloud-observability-tools-2026)
- [Sitecore XM Cloud Frontend Hosting](https://developers.sitecore.com/learn/accelerate/xm-cloud/pre-development/hosting-applications/hosting-web-application)

### Migration Path Research (Feb 2026)
- [Sitecore XM Cloud Migration — Forrester TEI](https://tei.forrester.com/go/sitecore/XMCloudSpotlight/)
- [Cloud Migration Statistics 2025](https://duplocloud.com/blog/cloud-migration-statistics/)
- [AWS 2025 Inflection Point](https://aws.amazon.com/blogs/enterprise-strategy/why-2025-is-the-inflection-point-for-aws-cloud-migration/)
- [Commerce Replatforming Report — commercetools](https://commercetools.com/migration-report)
- [Ecommerce Replatforming Guide — Shopify](https://www.shopify.com/enterprise/blog/ecommerce-replatforming-guide)
- [Drupal 7 EOL Migration Guide](https://www.ctidigital.com/insights/drupal-7-end-of-life-how-to-migrate-to-drupal-10-or-11-in-2025/)
- [AEM Cloud Service Migration](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/migration-journey/getting-started)
- [Sitecore to Optimizely Migration](https://www.optimizely.com/insights/blog/migrating-from-sitecore-to-optimizely/)
- [Kentico Xperience Migration](https://www.kentico.com/platform/upgrade-xperience-by-kentico)
- [Umbraco 8 to 13 Upgrade Guide](https://www.pixelbuilders.com/blog/upgrading-your-website-from-umbraco-8-to-umbraco-13-lts-a-comprehensive-guide/)
- [.NET 8 Migration Guide](https://wojciechowski.app/en/articles/dotnet-migration-guide)
- [VMs to Kubernetes Roadmap](https://thenewstack.io/migrating-vms-to-kubernetes-a-roadmap-for-cloud-native-enterprises/)
- [Monolith to Microservices 2025](https://acropolium.com/blog/migrating-monolith-to-microservices/)
- [JAMstack Trends 2025](https://medium.com/@harzeno/jamstack-in-2025-is-it-still-relevant-9bce6d29c287)

### MarTech Research (Feb 2026)
- [HubSpot Company Overview](https://www.hubspot.com/our-story)
- [Mailchimp Platform Features](https://mailchimp.com/features/)
- [Klaviyo IPO and Growth](https://investors.klaviyo.com/)
- [Marketo Engage Documentation](https://experienceleague.adobe.com/en/docs/marketo/using/home)
- [Salesforce Agentforce Platform](https://www.salesforce.com/agentforce/)
- [Segment CDP Overview](https://segment.com/docs/)
- [RudderStack Warehouse-Native CDP](https://www.rudderstack.com/)
- [Hightouch Composable CDP](https://hightouch.com/)
- [Google Optimize Sunset](https://support.google.com/optimize/answer/12979939)
- [VWO Google Optimize Migration Tool](https://vwo.com/google-optimize-alternative/)
- [PostHog Open Source Analytics](https://posthog.com/)
- [Plausible Privacy-First Analytics](https://plausible.io/)
- [Oracle Advertising Shutdown](https://www.oracle.com/cx/advertising/)
- [Dynamic Yield by Mastercard](https://www.dynamicyield.com/)
- [OneTrust Privacy Platform](https://www.onetrust.com/)
- [Intercom Fin AI Agent](https://www.intercom.com/fin)
- [Bynder DAM Platform](https://www.bynder.com/)
- [Cloudinary Media Management](https://cloudinary.com/)
- [Smartling Translation Platform](https://www.smartling.com/)
- [Average MarTech Stack Size (91 tools)](https://chiefmartec.com/2023/05/marketing-technology-landscape-2023/)

### AI & Development Tools Research (Feb 2026)
- [Claude Opus 4.6 / Claude Code](https://docs.anthropic.com/)
- [OpenAI GPT-4.1 and o3 Models](https://platform.openai.com/docs/)
- [Google Gemini 3.1](https://ai.google.dev/)
- [Meta Llama 4 Release](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)
- [DeepSeek Open Source Models](https://github.com/deepseek-ai)
- [LangChain / LangGraph Framework](https://www.langchain.com/)
- [CrewAI Multi-Agent Framework](https://www.crewai.com/)
- [Microsoft Agent Framework RC](https://devblogs.microsoft.com/semantic-kernel/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [PydanticAI Agent Framework](https://ai.pydantic.dev/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Pinecone Serverless Vector DB](https://www.pinecone.io/)
- [Weaviate Vector Database](https://weaviate.io/)
- [pgvector PostgreSQL Extension](https://github.com/pgvector/pgvector)
- [LlamaIndex RAG Framework](https://www.llamaindex.ai/)
- [LaunchDarkly Feature Management](https://launchdarkly.com/)
- [Statsig Acquired by OpenAI](https://blog.statsig.com/)
- [GitHub Copilot](https://github.com/features/copilot)
- [Cursor AI IDE](https://cursor.sh/)
- [Amazon Q Developer](https://aws.amazon.com/q/developer/)
- [Figma Make AI](https://www.figma.com/)
- [Storybook 10](https://storybook.js.org/)
- [axe DevTools Accessibility](https://www.deque.com/axe/)
- [Siteimprove Accessibility](https://www.siteimprove.com/)

### Data & Commerce Infrastructure Research (Feb 2026)
- [Snowflake Cortex AI](https://www.snowflake.com/en/data-cloud/cortex/)
- [Databricks + Neon Acquisition](https://www.databricks.com/blog/databricks-neon)
- [Fivetran + dbt Labs Merger](https://www.fivetran.com/blog/fivetran-dbt-labs)
- [Airbyte Open Source Connectors](https://airbyte.com/)
- [Apache Airflow 3.0](https://airflow.apache.org/)
- [Dagster Modern Orchestration](https://dagster.io/)
- [Apache Iceberg Open Table Format](https://iceberg.apache.org/)
- [ClickHouse Real-Time Analytics](https://clickhouse.com/)
- [Stripe Platform Overview](https://stripe.com/docs)
- [Adyen Unified Commerce](https://www.adyen.com/)
- [Akeneo PIM Platform](https://www.akeneo.com/)
- [SAP S/4HANA Migration Timeline](https://www.sap.com/products/erp/s4hana.html)
- [Oracle NetSuite ERP](https://www.netsuite.com/)
- [Pimcore Open Source PIM](https://pimcore.com/)
- [BigQuery ML Integration](https://cloud.google.com/bigquery/docs/bqml-introduction)
