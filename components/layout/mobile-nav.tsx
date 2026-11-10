'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { House, LayoutGrid, ShoppingBag, UserRound } from 'lucide-react';
import { useCart } from '@/lib/cart-store';

const links = [
  {href:'/', label:'Home', Icon:House},
  {href:'/#explore', label:'Explore', Icon:LayoutGrid},
  {href:'/cart', label:'Cart', Icon:ShoppingBag},
  {href:'/login', label:'Account', Icon:UserRound},
];

export function MobileNav(){
  const pathname=usePathname();
  const count=useCart(s=>s.lines.reduce((n,line)=>n+line.qty,0));
  const reduced=useReducedMotion();
  return <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_35px_rgba(14,47,31,.07)] backdrop-blur-xl md:hidden">
    <div className="mx-auto grid h-[68px] max-w-lg grid-cols-4 gap-1">
      {links.map(({href,label,Icon})=>{
        const active = href==='/' ? pathname==='/' : href==='/#explore' ? false : pathname.startsWith(href);
        return <Link key={href} href={href} aria-current={active?'page':undefined} className="relative flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold text-muted-foreground">
          {active&&<motion.span layoutId="nestfix-mobile-nav" className="absolute inset-x-3 inset-y-2 -z-10 rounded-2xl bg-secondary" transition={reduced?{duration:0}:{type:'spring',stiffness:420,damping:36}}/>}
          <span className={`relative ${active?'text-primary':''}`}><Icon aria-hidden size={20} strokeWidth={active?2.4:1.9}/>{href==='/cart'&&count>0&&<span className="absolute -right-3 -top-2 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">{count>9?'9+':count}</span>}</span>
          <span className={active?'text-primary':''}>{label}</span>
        </Link>;
      })}
    </div>
  </nav>;
}
