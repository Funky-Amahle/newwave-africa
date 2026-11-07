import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'NewWave Africa | Stories Move Us',description:'Discover African perspectives and develop your own story with human-centred writing, voice and visual tools.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
