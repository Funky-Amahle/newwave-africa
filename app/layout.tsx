import type {Metadata} from 'next';
import {SiteShell} from '../components/site-shell';
import localFont from 'next/font/local';
import './globals.css';
const editorial=localFont({src:[{path:'../public/fonts/fraunces-regular.ttf',weight:'400',style:'normal'},{path:'../public/fonts/fraunces-italic.ttf',weight:'400',style:'italic'}],variable:'--font-editorial',display:'swap'});
const studioSans=localFont({src:'../public/fonts/inter-tight.ttf',variable:'--font-studio-sans',display:'swap'});
const studioSerif=localFont({src:[{path:'../public/fonts/instrument-serif.ttf',weight:'400',style:'normal'},{path:'../public/fonts/instrument-serif-italic.ttf',weight:'400',style:'italic'}],variable:'--font-studio-serif',display:'swap'});
export const metadata:Metadata={title:'NewWave Africa | Stories Move Us',description:'Discover African perspectives and develop your own story with human-centred writing, voice and visual tools.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={`${editorial.variable} ${studioSans.variable} ${studioSerif.variable}`}><SiteShell>{children}</SiteShell></body></html>}
