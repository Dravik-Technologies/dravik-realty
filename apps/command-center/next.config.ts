import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  transpilePackages: ["@dravik/shared", "@dravik/ui", "@dravik/contracts", "@dravik/crm", "@dravik/realty"],
};

export default nextConfig;
