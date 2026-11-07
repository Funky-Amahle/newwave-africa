import type {Metadata} from 'next';
import localFont from 'next/font/local';
import './globals.css';
const editorial=localFont({src:[{path:'../public/fonts/fraunces-regular.ttf',weight:'400',style:'normal'},{path:'../public/fonts/fraunces-italic.ttf',weight:'400',style:'italic'}],variable:'--font-editorial',display:'swap'});
export const metadata:Metadata={title:'NewWave Africa | Stories Move Us',description:'Discover African perspectives and develop your own story with human-centred writing, voice and visual tools.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={editorial.variable}>{children}</body></html>}
