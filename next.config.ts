import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [72, 75, 78],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbsbx.com" },
      { protocol: "https", hostname: "scontent.cdninstagram.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "f.rivne.travel" },
      { protocol: "https", hostname: "www.zamokdubno.com.ua" },
      { protocol: "https", hostname: "dubnohospital.com.ua" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "res2.weblium.site" },
      { protocol: "https", hostname: "cdn-media.choiceqr.com" },
      { protocol: "https", hostname: "dwfvpbrjajjfs.cloudfront.net" },
      { protocol: "https", hostname: "site-assets.novapost.com" },
      { protocol: "https", hostname: "www.ukrposhta.ua" },
      { protocol: "https", hostname: "s3.eu-west-1.amazonaws.com" },
      { protocol: "https", hostname: "rada.info" },
      { protocol: "https", hostname: "gymnasium2.com.ua" },
      { protocol: "http", hostname: "gymnasium2.com.ua" },
      { protocol: "https", hostname: "blogger.googleusercontent.com" },
      { protocol: "https", hostname: "ua.igotoworld.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
    /** Keep visited tabs warm so switching back feels instant (Next 15 default dynamic=0). */
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
