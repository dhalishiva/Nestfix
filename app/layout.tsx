import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Figtree } from 'next/font/google';
import { Providers } from '@/components/layout/providers';
import './globals.css';
const display = Bricolage_Grotesque({subsets:['latin'],variable:'--font-bricolage',display:'swap'});
const body = Figtree({subsets:['latin'],variable:'--font-figtree',display:'swap'});
export const metadata: Metadata = {title:{default:'Nestfix | Care for every corner',template:'%s | Nestfix'},description:'Reliable home care, on your schedule. Nestfix is preparing to serve homes across India.',applicationName:'Nestfix', icons:{icon:'/icon.svg'}};
export const viewport: Viewport = {themeColor:'#145339',width:'device-width',initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en-IN" suppressHydrationWarning><body className={`${display.variable} ${body.variable} font-sans`}><Providers>{children}</Providers></body></html>;
}
