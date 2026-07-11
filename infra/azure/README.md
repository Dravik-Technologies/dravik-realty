# Azure Deployment Foundation

Dravik Realty runs from one shared Azure Container Apps deployment per environment, with production in `dravik-realty` and staging in `dravik-realty-staging`.

## Shape

- Azure Container Apps hosts the Next.js command center container.
- Azure Container Registry stores versioned app images.
- User-assigned managed identity pulls from ACR and is granted scoped access to storage and Key Vault.
- Azure Database for PostgreSQL Flexible Server provides the first control database; tenant databases can be added from the same foundation.
- Azure Storage Blob containers separate live client documents from deal archive exports.
- Log Analytics and Application Insights collect runtime telemetry.

The app is still using the local identity foundation. The Azure resources are ready for the next identity, tenant registry, storage, and database integration phases.

## First-Time Setup

Use the commercial Azure cloud:

```bash
az cloud set --name AzureCloud
az login
az account set --subscription "<subscription id>"
```

Register the providers:

```bash
scripts/azure/register-providers.sh
```

Create or verify the resource groups:

```bash
az group create --name dravik-realty-staging --location eastus --tags environment=staging product=dravik-realty
az group create --name dravik-realty --location eastus --tags environment=prod product=dravik-realty
```

Create the GitHub OIDC deployment identity:

```bash
scripts/azure/bootstrap-github-oidc.sh
```

The deployment identity gets `Contributor`, `Role Based Access Control Administrator`, and `AcrPush` on both resource groups. The RBAC role is required because the Bicep deployment creates scoped role assignments for the app's managed identity.

Add the printed Azure values as GitHub secrets. Add `POSTGRES_ADMIN_PASSWORD` as an environment secret in both the `staging` and `production` GitHub environments.

## Manual Validation

Compile the infrastructure modules without provisioning resources:

```bash
az bicep build --file infra/azure/core.bicep
az bicep build --file infra/azure/app.bicep
```

Preview staging:

```bash
az deployment group what-if \
  --resource-group dravik-realty-staging \
  --template-file infra/azure/core.bicep \
  --parameters environmentName=staging postgresAdminPassword="<strong password>"
```

## Deployment

Merges to `main` run `.github/workflows/deploy-azure.yml`. The workflow deploys staging first, then production. Configure required reviewers on the `production` GitHub environment before enabling automatic production rollout.

Custom domains are not wired yet. Start with the generated Container Apps URL, then map `dravik-realty.macsys.us` after DNS is ready.
