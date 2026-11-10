'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, HousePlus, ShoppingBag, UserRound } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useCart } from '@/lib/cart-store';

export function Header() {
  const [mounted,setMounted]=useState(false);
  useEffect(()=>setMounted(true),[]);
  const count=useCart(s=>s.lines.reduce((n,line)=>n+line.qty,0));
  const reduceMotion=useReducedMotion();
  return <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
    <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
      <Link href="/" className="group inline-flex min-h-11 items-center gap-2.5 rounded-lg font-display text-[1.72rem] font-extrabold tracking-[-.055em]" aria-label="Nestfix home">
        <span className="flex size-10 items-center justify-center rounded-[.9rem] bg-primary text-primary-foreground shadow-[0_6px_18px_rgba(13,75,49,.18)] transition-transform group-hover:-rotate-6"><HousePlus size={22} strokeWidth={2.4}/></span>nestfix<span className="-ml-2 text-primary">.</span>
      </Link>
      <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
        <Link href="/" className="text-sm font-bold text-foreground transition-colors hover:text-primary">Home</Link>
        <Link href="/#explore" className="text-sm font-bold text-muted-foreground transition-colors hover:text-primary">Explore services</Link>
        <Link href="/addresses" className="text-sm font-bold text-muted-foreground transition-colors hover:text-primary">Addresses</Link>
      </nav>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link href="/cart" aria-label={mounted&&count>0?'Cart with '+count+' services':'Cart'} className="relative inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors hover:bg-secondary">
          <ShoppingBag size={19}/><span className="hidden sm:inline">Cart</span>
          <AnimatePresence mode="wait" initial={false}>{mounted&&count>0&&<motion.span key="badge" initial={reduceMotion?false:{scale:0}} animate={{scale:1}} exit={{scale:0}} transition={{type:'spring',stiffness:450,damping:25}} className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-extrabold text-primary-foreground">{count>99?'99+':count}</motion.span>}</AnimatePresence>
        </Link>
        <Link href="/login" aria-label="Sign in" className="grid size-11 place-items-center rounded-xl transition-colors hover:bg-secondary"><UserRound size={19}/></Link>
        <ThemeToggle/>
      </div>
    </div>
  </header>;
}
