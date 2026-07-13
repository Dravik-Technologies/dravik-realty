targetScope = 'resourceGroup'

@allowed([
  'staging'
  'prod'
])
param environmentName string

param location string = resourceGroup().location
param appName string = 'command-center'
param acrName string
param containerAppsEnvironmentName string
param imageName string = 'command-center'
param imageTag string
param managedIdentityName string
param maxReplicas int = environmentName == 'prod' ? 20 : 5
param minReplicas int = environmentName == 'prod' ? 2 : 1

@secure()
param databaseUrl string = ''

@allowed([
  'local'
  'entra'
])
param authProvider string = environmentName == 'prod' ? 'entra' : 'local'

@secure()
param authSessionSecret string = ''

param entraAllowedEmails string = ''
param entraAuthority string = ''
param entraBootstrapEntitlements string = ''
param entraBootstrapRole string = 'broker_owner'
param entraClientId string = ''

@secure()
param entraClientSecret string = ''

param entraCommandRedirectUri string = ''
param entraPortalAllowedEmails string = ''
param entraPortalRedirectUri string = ''
param entraPostLogoutRedirectUri string = ''
param entraTenantId string = ''

@allowed([
  '0.5'
  '1.0'
  '2.0'
])
param cpuCores string = environmentName == 'prod' ? '1.0' : '0.5'

@allowed([
  '1Gi'
  '2Gi'
  '4Gi'
])
param memory string = environmentName == 'prod' ? '2Gi' : '1Gi'

var containerAppName = 'dravik-${environmentName}-${appName}'
var databaseSecrets = empty(databaseUrl) ? [] : [
  {
    name: 'database-url'
    value: databaseUrl
  }
]
var databaseEnvironment = empty(databaseUrl) ? [] : [
  {
    name: 'DATABASE_URL'
    secretRef: 'database-url'
  }
]
var authSecrets = authProvider == 'entra' ? [
  {
    name: 'auth-session-secret'
    value: authSessionSecret
  }
  {
    name: 'entra-client-secret'
    value: entraClientSecret
  }
] : []
var authEnvironment = concat([
  {
    name: 'AUTH_PROVIDER'
    value: authProvider
  }
], authProvider == 'entra' ? [
  {
    name: 'AUTH_SESSION_SECRET'
    secretRef: 'auth-session-secret'
  }
  {
    name: 'ENTRA_ALLOWED_EMAILS'
    value: entraAllowedEmails
  }
  {
    name: 'ENTRA_AUTHORITY'
    value: entraAuthority
  }
  {
    name: 'ENTRA_BOOTSTRAP_ENTITLEMENTS'
    value: entraBootstrapEntitlements
  }
  {
    name: 'ENTRA_BOOTSTRAP_ROLE'
    value: entraBootstrapRole
  }
  {
    name: 'ENTRA_CLIENT_ID'
    value: entraClientId
  }
  {
    name: 'ENTRA_CLIENT_SECRET'
    secretRef: 'entra-client-secret'
  }
  {
    name: 'ENTRA_COMMAND_REDIRECT_URI'
    value: entraCommandRedirectUri
  }
  {
    name: 'ENTRA_PORTAL_ALLOWED_EMAILS'
    value: entraPortalAllowedEmails
  }
  {
    name: 'ENTRA_PORTAL_REDIRECT_URI'
    value: entraPortalRedirectUri
  }
  {
    name: 'ENTRA_POST_LOGOUT_REDIRECT_URI'
    value: entraPostLogoutRedirectUri
  }
  {
    name: 'ENTRA_TENANT_ID'
    value: entraTenantId
  }
] : [])

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: acrName
}

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' existing = {
  name: containerAppsEnvironmentName
}

resource appIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: managedIdentityName
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${appIdentity.id}': {}
    }
  }
  properties: {
    configuration: {
      activeRevisionsMode: 'Single'
      secrets: concat(databaseSecrets, authSecrets)
      ingress: {
        allowInsecure: false
        external: true
        targetPort: 3000
        transport: 'auto'
      }
      registries: [
        {
          identity: appIdentity.id
          server: containerRegistry.properties.loginServer
        }
      ]
    }
    managedEnvironmentId: containerAppsEnvironment.id
    template: {
      containers: [
        {
          name: appName
          image: '${containerRegistry.properties.loginServer}/${imageName}:${imageTag}'
          env: concat([
            {
              name: 'APP_ENV'
              value: environmentName
            }
            {
              name: 'NEXT_PUBLIC_APP_ENV'
              value: environmentName
            }
            {
              name: 'HOSTNAME'
              value: '0.0.0.0'
            }
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '3000'
            }
          ], databaseEnvironment, authEnvironment)
          resources: {
            cpu: json(cpuCores)
            memory: memory
          }
        }
      ]
      scale: {
        maxReplicas: maxReplicas
        minReplicas: minReplicas
        rules: [
          {
            name: 'http-concurrency'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output containerAppName string = containerApp.name
