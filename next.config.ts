import type {NextConfig} from 'next';
const isPages=process.env.GITHUB_PAGES==='true';
const nextConfig:NextConfig={...(isPages?{output:'export',basePath:'/newwave-africa',assetPrefix:'/newwave-africa/',trailingSlash:true,images:{unoptimized:true}}:{})};
export default nextConfig;
