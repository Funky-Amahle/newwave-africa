import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'NewWave Africa | Stories Move Us',description:'Discover African stories told by the people who live them. Every category. Every voice.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
