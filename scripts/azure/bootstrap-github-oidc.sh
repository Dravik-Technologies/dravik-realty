#!/usr/bin/env bash
set -euo pipefail

github_owner="${GITHUB_OWNER:-Dravik-Technologies}"
github_repo="${GITHUB_REPO:-dravik-realty}"
app_display_name="${AZURE_APP_DISPLAY_NAME:-dravik-realty-github-deploy}"

subscription_id="$(az account show --query id -o tsv)"
tenant_id="$(az account show --query tenantId -o tsv)"

client_id="$(az ad app list --display-name "$app_display_name" --query '[0].appId' -o tsv)"

if [[ -z "$client_id" ]]; then
  client_id="$(az ad app create --display-name "$app_display_name" --query appId -o tsv)"
fi

if ! az ad sp show --id "$client_id" --query id -o tsv >/dev/null 2>&1; then
  az ad sp create --id "$client_id" --only-show-errors >/dev/null
fi

tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT

for environment_name in staging production; do
  credential_name="github-${environment_name}"
  existing_credential_id="$(az ad app federated-credential list --id "$client_id" --query "[?name=='${credential_name}'] | [0].id" -o tsv)"

  if [[ -n "$existing_credential_id" ]]; then
    continue
  fi

  cat > "$tmp_file" <<JSON
{
  "name": "${credential_name}",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:${github_owner}/${github_repo}:environment:${environment_name}",
  "description": "GitHub Actions ${environment_name} deployments for ${github_owner}/${github_repo}",
  "audiences": ["api://AzureADTokenExchange"]
}
JSON

  az ad app federated-credential create --id "$client_id" --parameters "$tmp_file" --only-show-errors >/dev/null
done

ensure_role_assignment() {
  local role_name="$1"
  local scope="$2"

  existing_assignment_id="$(az role assignment list --assignee "$client_id" --role "$role_name" --scope "$scope" --query '[0].id' -o tsv)"

  if [[ -z "$existing_assignment_id" ]]; then
    az role assignment create --assignee "$client_id" --role "$role_name" --scope "$scope" --only-show-errors >/dev/null
  fi
}

for resource_group in dravik-realty-staging dravik-realty; do
  scope="/subscriptions/${subscription_id}/resourceGroups/${resource_group}"
  ensure_role_assignment "Contributor" "$scope"
  ensure_role_assignment "Role Based Access Control Administrator" "$scope"
  ensure_role_assignment "AcrPush" "$scope"
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
