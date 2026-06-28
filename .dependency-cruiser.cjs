module.exports = {
  forbidden: [
    {
      name: "R1-no-feature-package-cross-imports",
      severity: "error",
      from: {
        path: "^packages/(crm|realty|lending|marketing|referrals|broker|billing|portal)/",
      },
      to: {
        path: "^packages/(crm|realty|lending|marketing|referrals|broker|billing|portal)/",
        pathNot: "^packages/$1/",
      },
    },
    {
      name: "R2-shared-contracts-no-workspace-imports",
      severity: "error",
      from: {
        path: "^packages/shared/",
      },
      to: {
        path: "^packages/(?!shared/)",
      },
    },
    {
      name: "R2-shared-contracts-no-workspace-imports",
      severity: "error",
      from: {
        path: "^packages/contracts/",
      },
      to: {
        path: "^packages/(?!contracts/)",
      },
    },
    {
      name: "R3-ui-only-imports-shared",
      severity: "error",
      from: {
        path: "^packages/ui/",
      },
      to: {
        path: "^packages/(?!shared/|ui/)",
      },
    },
    {
      name: "R4-packages-no-app-imports",
      severity: "error",
      from: {
        path: "^packages/",
      },
      to: {
        path: "^apps/",
      },
    },
    {
      name: "R5-packages-no-app-alias",
      severity: "error",
      from: {
        path: "^packages/",
      },
      to: {
        path: "^@/",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    exclude: {
      path: "node_modules|\\.next|test-results|playwright-report",
    },
  },
};
