import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  transpilePackages: ["@dravik/shared", "@dravik/ui", "@dravik/contracts", "@dravik/crm", "@dravik/realty", "@dravik/lending", "@dravik/marketing", "@dravik/referrals", "@dravik/broker", "@dravik/portal", "@dravik/billing"],
  async redirects() {
    return [
      { source: "/leads", destination: "/crm/leads", permanent: true },
      { source: "/inbox", destination: "/crm/inbox", permanent: true },
      { source: "/prospecting", destination: "/crm/prospecting", permanent: true },
      { source: "/mapping", destination: "/realty/mapping", permanent: true },
      { source: "/transactions", destination: "/realty/transactions", permanent: true },
      { source: "/mortgage", destination: "/lending", permanent: true },
      { source: "/referral-network", destination: "/referrals", permanent: true },
      { source: "/team", destination: "/broker/team", permanent: true },
      { source: "/reports", destination: "/broker/reports", permanent: true },
      { source: "/settings", destination: "/broker/settings", permanent: true },
    ];
  },
};

export default nextConfig;
