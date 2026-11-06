import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'NewWave Africa | Beyond the Popular', description: 'A discovery-first home for the full diversity of African stories.' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
