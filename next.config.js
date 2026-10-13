/** @type {import('next').NextConfig} */

// Uploaded images are served through the image optimizer (see
// lib/image-url.ts), which only fetches from this project's public Storage.
function supabaseStoragePattern() {
  try {
    const { hostname } = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    return [{ protocol: "https", hostname, pathname: "/storage/v1/object/public/**" }];
  } catch {
    return [];
  }
}

const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  images: {
    remotePatterns: supabaseStoragePattern(),
    // Uploads never change once stored (new files get new names), so keep
    // optimized copies for a month even if a file's own cache header is short.
    minimumCacheTTL: 2678400,
  },
};

module.exports = nextConfig;
