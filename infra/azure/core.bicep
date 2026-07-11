targetScope = 'resourceGroup'

@allowed([
  'staging'
  'prod'
])
param environmentName string

param location string = resourceGroup().location
param projectName string = 'dravik-realty'
param createPostgres bool = true
param postgresAdminLogin string = 'dravikadmin'

@secure()
param postgresAdminPassword string = ''

param postgresSkuName string = 'Standard_B1ms'
param postgresSkuTier string = 'Burstable'
param postgresStorageGb int = 32
param postgresBackupRetentionDays int = 7

var shortEnvironmentName = environmentName == 'prod' ? 'prd' : 'stg'
var suffix = uniqueString(subscription().id, resourceGroup().id, projectName, environmentName)
var acrName = take('drv${shortEnvironmentName}${suffix}', 50)
var applicationInsightsName = 'drv-${shortEnvironmentName}-appi-${suffix}'
var containerAppsEnvironmentName = 'drv-${shortEnvironmentName}-cae-${suffix}'
var keyVaultName = take('drv-${shortEnvironmentName}-kv-${suffix}', 24)
var logAnalyticsName = 'drv-${shortEnvironmentName}-logs-${suffix}'
var managedIdentityName = 'drv-${shortEnvironmentName}-aca-${suffix}'
var postgresServerName = 'drv-${shortEnvironmentName}-pg-${suffix}'
var storageAccountName = take('drv${shortEnvironmentName}${suffix}', 24)

var acrPullRoleDefinitionId = '7f951dda-4ed3-4680-a7ca-43fe172d538d'
var keyVaultSecretsUserRoleDefinitionId = '4633458b-17de-408a-b874-0445c86b69e6'
var storageBlobDataContributorRoleDefinitionId = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: environmentName == 'prod' ? 'Standard' : 'Basic'
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

resource appIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: managedIdentityName
  location: location
}

resource acrPullAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerRegistry.id, appIdentity.id, acrPullRoleDefinitionId)
  scope: containerRegistry
  properties: {
    principalId: appIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleDefinitionId)
  }
}

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    retentionInDays: environmentName == 'prod' ? 90 : 30
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: applicationInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppsEnvironmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  name: 'default'
  parent: storageAccount
  properties: {
    containerDeleteRetentionPolicy: {
      days: 30
      enabled: true
    }
    deleteRetentionPolicy: {
      days: 30
      enabled: true
    }
  }
}

resource clientDocumentsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  name: 'client-documents'
  parent: blobService
  properties: {
    publicAccess: 'None'
  }
}

resource dealArchivesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  name: 'deal-archives'
  parent: blobService
  properties: {
    publicAccess: 'None'
  }
}

resource storageBlobContributorAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, appIdentity.id, storageBlobDataContributorRoleDefinitionId)
  scope: storageAccount
  properties: {
    principalId: appIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageBlobDataContributorRoleDefinitionId)
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    enableRbacAuthorization: true
    enableSoftDelete: true
    publicNetworkAccess: 'Enabled'
    sku: {
      family: 'A'
      name: 'standard'
    }
    softDeleteRetentionInDays: 90
    tenantId: tenant().tenantId
  }
}

resource keyVaultSecretsUserAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, appIdentity.id, keyVaultSecretsUserRoleDefinitionId)
  scope: keyVault
  properties: {
    principalId: appIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUserRoleDefinitionId)
  }
}

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = if (createPostgres) {
  name: postgresServerName
  location: location
  sku: {
    name: postgresSkuName
    tier: postgresSkuTier
  }
  properties: {
    administratorLogin: postgresAdminLogin
    administratorLoginPassword: postgresAdminPassword
    backup: {
      backupRetentionDays: postgresBackupRetentionDays
      geoRedundantBackup: environmentName == 'prod' ? 'Enabled' : 'Disabled'
    }
    highAvailability: {
      mode: environmentName == 'prod' ? 'ZoneRedundant' : 'Disabled'
    }
    storage: {
      storageSizeGB: postgresStorageGb
    }
    version: '16'
  }
}

resource controlDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = if (createPostgres) {
  name: 'dravik_control'
  parent: postgresServer
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

output acrLoginServer string = containerRegistry.properties.loginServer
output acrName string = containerRegistry.name
output applicationInsightsName string = applicationInsights.name
output containerAppsEnvironmentName string = containerAppsEnvironment.name
output keyVaultName string = keyVault.name
output managedIdentityName string = appIdentity.name
output postgresHost string = createPostgres ? '${postgresServerName}.postgres.database.azure.com' : ''
output storageAccountName string = storageAccount.name
