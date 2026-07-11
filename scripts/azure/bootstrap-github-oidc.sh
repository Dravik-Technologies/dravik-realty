#!/usr/bin/env bash
set -euo pipefail

github_owner="${GITHUB_OWNER:-Dravik-Technologies}"
github_repo="${GITHUB_REPO:-dravik-realty}"
app_display_name="${AZURE_APP_DISPLAY_NAME:-dravik-realty-github-deploy}"

subscription_id="$(az account show --query id -o tsv)"
tenant_id="$(az account show --query tenantId -o tsv)"

client_id="$(az ad app create --display-name "$app_display_name" --query appId -o tsv)"
az ad sp create --id "$client_id" --only-show-errors >/dev/null

tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT

for environment_name in staging production; do
  cat > "$tmp_file" <<JSON
{
  "name": "github-${environment_name}",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:${github_owner}/${github_repo}:environment:${environment_name}",
  "description": "GitHub Actions ${environment_name} deployments for ${github_owner}/${github_repo}",
  "audiences": ["api://AzureADTokenExchange"]
}
JSON

  az ad app federated-credential create --id "$client_id" --parameters "$tmp_file" --only-show-errors >/dev/null
done

for resource_group in dravik-realty-staging dravik-realty; do
  scope="/subscriptions/${subscription_id}/resourceGroups/${resource_group}"
  az role assignment create --assignee "$client_id" --role Contributor --scope "$scope" --only-show-errors >/dev/null
  az role assignment create --assignee "$client_id" --role AcrPush --scope "$scope" --only-show-errors >/dev/null
done

cat <<EOF
Add these as GitHub repository or environment secrets:

AZURE_CLIENT_ID=${client_id}
AZURE_TENANT_ID=${tenant_id}
AZURE_SUBSCRIPTION_ID=${subscription_id}

Also add POSTGRES_ADMIN_PASSWORD as an environment secret for both:
- staging
- production
EOF
