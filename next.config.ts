import type {NextConfig} from 'next';
const isPages=process.env.GITHUB_PAGES==='true';
const nextConfig:NextConfig={outputFileTracingRoot:process.cwd(),env:{NEXT_PUBLIC_SITE_BASE_PATH:isPages?'/newwave-africa':'',NEXT_PUBLIC_STATIC_SITE:String(isPages)},...(isPages?{output:'export',basePath:'/newwave-africa',assetPrefix:'/newwave-africa/',trailingSlash:true,images:{unoptimized:true}}:{output:'standalone'})};
export default nextConfig;
