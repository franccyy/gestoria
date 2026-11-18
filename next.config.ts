import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A raiz do projeto é esta pasta (evita o aviso de "multiple lockfiles").
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
