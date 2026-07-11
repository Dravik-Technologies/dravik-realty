#!/usr/bin/env bash
set -euo pipefail

namespaces=(
  Microsoft.App
  Microsoft.ContainerRegistry
  Microsoft.DBforPostgreSQL
  Microsoft.Insights
  Microsoft.KeyVault
  Microsoft.ManagedIdentity
  Microsoft.OperationalInsights
  Microsoft.Storage
)

for namespace in "${namespaces[@]}"; do
  state="$(az provider show --namespace "$namespace" --query registrationState -o tsv 2>/dev/null || true)"
  if [[ "$state" != "Registered" ]]; then
    az provider register --namespace "$namespace" --only-show-errors >/dev/null
  fi
done

for namespace in "${namespaces[@]}"; do
  state="$(az provider show --namespace "$namespace" --query registrationState -o tsv)"
  printf '%s=%s\n' "$namespace" "$state"
done
