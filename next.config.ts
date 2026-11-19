import type { NextConfig } from "next";

const config: NextConfig = {
  // A self-contained server (node .next/standalone/server.js) for Docker and most hosts.
  output: "standalone",
  poweredByHeader: false,
};

export default config;
