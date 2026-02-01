import type { NextConfig } from "next";

// Vercel sets VERCEL=1 in the build environment
// On Vercel, use root ''. On GitHub Pages, use '/Apex-Financial-Bank'
const isVercel = process.env.VERCEL === '1';

const nextConfig: NextConfig = {
    output: 'export',
    basePath: isVercel ? '' : '/Apex-Financial-Bank',
    assetPrefix: isVercel ? '' : '/Apex-Financial-Bank',
    images: {
        unoptimized: true,
    },
};

export default nextConfig;

