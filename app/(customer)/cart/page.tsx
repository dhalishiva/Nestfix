'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Gift, Minus, Plus, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { money } from '@/lib/utils/currency';

export default function CartPage(){
  const [hydrated,setHydrated]=useState(false);
  useEffect(()=>setHydrated(true),[]);
  const reduced=useReducedMotion();
  const lines=useCart(s=>s.lines);
  const setQty=useCart(s=>s.setQty);
  const clear=useCart(s=>s.clear);
  const count=lines.reduce((n,line)=>n+line.qty,0);
  const subtotal=lines.reduce((n,line)=>n+line.qty*line.price,0);
  const mrp=lines.reduce((n,line)=>n+line.qty*line.mrp,0);
  const visit=subtotal>=999?0:49;
  const tax=Math.round(visit*.18);
  const progress=Math.min(100,subtotal/999*100);
  return <main className="mx-auto min-h-[68vh] max-w-6xl px-5 pb-20 pt-8 sm:px-8 md:pt-14">
    <Link href="/#explore" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary transition-transform hover:-translate-x-1"><ArrowLeft size={17}/> Continue exploring</Link>
    <div className="mt-5 flex items-end justify-between gap-5"><div><p className="eyebrow">Your thoughtful selections</p><h1 className="mt-2 font-display text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">The good stuff, <span className="italic text-primary">together.</span></h1><p className="mt-3 text-sm text-muted-foreground">A little care goes a long way.</p></div><div className="hidden size-20 place-items-center rounded-[1.6rem] bg-secondary text-primary sm:grid"><ShoppingBag size={35}/></div></div>
    {!hydrated?<div role="status" className="mt-10 grid gap-4 sm:grid-cols-2"><div className="h-32 animate-pulse rounded-3xl bg-secondary"/><div className="h-32 animate-pulse rounded-3xl bg-secondary"/></div>:
    lines.length===0?
      <motion.section initial={reduced?false:{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.4}} className="mt-10 flex flex-col items-center rounded-[2rem] border border-dashed bg-card px-6 py-16 text-center">
        <span className="grid size-20 place-items-center rounded-[1.6rem] bg-secondary text-primary"><ShoppingBag size={36}/></span><h2 className="mt-6 font-display text-2xl font-extrabold">Nothing in your bag. Yet.</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Discover the services your home has been waiting for and add them here.</p><Link href="/#explore" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-6 font-bold text-primary-foreground">Explore services <ArrowRight size={18}/></Link>
      </motion.section>:
      <div className="mt-10 grid gap-7 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-5">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-extrabold">{count} {count===1?'service':'services'} selected</h2><button onClick={clear} type="button" className="min-h-11 text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground">Clear cart</button></div>
          <div className="space-y-3">
            <AnimatePresence initial={false} mode="popLayout">{lines.map(line=><motion.article key={line.id} layout={!reduced}
              initial={reduced?false:{opacity:0,x:-16}} animate={{opacity:1,x:0}} exit={reduced?{opacity:0}:{opacity:0,x:22,scale:.98}} transition={{duration:reduced?0:.22}}
              className="flex items-center justify-between gap-4 rounded-[1.45rem] border bg-card p-4 shadow-sm sm:p-5">
              <div className="flex min-w-0 items-center gap-4"><div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary text-primary"><Sparkles size={25}/></div><div className="min-w-0"><Link href={'/services/'+line.slug} className="font-display text-base font-extrabold leading-snug hover:text-primary sm:text-lg">{line.name}</Link><p className="mt-1 text-xs text-muted-foreground">{line.duration_minutes} min · {money(line.price)} each</p></div></div>
              <div className="shrink-0 text-right"><p className="mb-2 font-display font-extrabold">{money(line.qty*line.price)}</p><div className="inline-flex items-center rounded-xl border border-primary/30 text-primary">
                <motion.button whileTap={reduced?undefined:{scale:.85}} type="button" aria-label={'Remove one '+line.name} onClick={()=>setQty(line.id,line.qty-1)} className="grid size-10 place-items-center"><Minus size={16}/></motion.button>
                <span className="min-w-5 font-bold" aria-live="polite">{line.qty}</span>
                <motion.button whileTap={reduced?undefined:{scale:.85}} type="button" disabled={line.qty>=20} aria-label={'Add one '+line.name} onClick={()=>setQty(line.id,line.qty+1)} className="grid size-10 place-items-center disabled:opacity-40"><Plus size={16}/></motion.button>
              </div></div>
            </motion.article>)}</AnimatePresence>
          </div>
          <div className="rounded-[1.5rem] border border-primary/15 bg-secondary/55 p-5">
            <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-xl bg-card text-primary"><Gift size={18}/></span><strong className="text-sm">{visit===0?'You unlocked a free visit fee!':'A little extra saves more'}</strong></div>
            <p className="mt-3 text-sm text-muted-foreground">{visit===0?'Your selected services qualify for a waived visit fee.':'Add '+money(999-subtotal)+' more in services to waive the estimated visit fee.'}</p>
            <div role="progressbar" aria-label="Progress toward free visit fee" aria-valuemin={0} aria-valuemax={999} aria-valuenow={Math.min(subtotal,999)} className="mt-4 h-2.5 overflow-hidden rounded-full bg-card"><motion.div className="h-full rounded-full bg-primary" initial={false} animate={{width:progress+'%'}} transition={reduced?{duration:0}:{type:'spring',stiffness:130,damping:22}}/></div>
          </div>
        </div>
        <aside className="h-fit rounded-[1.7rem] border bg-card p-6 shadow-soft lg:sticky lg:top-28">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-extrabold">Price summary</h2><ShieldCheck size={23} className="text-primary"/></div>
          <dl className="mt-7 space-y-4 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Services MRP</dt><dd>{money(mrp)}</dd></div><div className="flex justify-between text-primary"><dt>Service savings</dt><dd>-{money(mrp-subtotal)}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Visit fee</dt><dd>{visit===0?<span className="font-bold text-primary">FREE</span>:money(visit)}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">GST on visit fee</dt><dd>{money(tax)}</dd></div><div className="flex items-center justify-between border-t pt-5 font-display text-xl font-extrabold"><dt>Estimated total</dt><motion.dd key={subtotal+visit+tax} initial={reduced?false:{opacity:.3,y:-6}} animate={{opacity:1,y:0}}>{money(subtotal+visit+tax)}</motion.dd></div></dl>
          <div className="mt-6 rounded-2xl bg-secondary/70 p-4 text-xs leading-6 text-muted-foreground"><div className="flex items-start gap-2"><ShieldCheck size={17} className="mt-1 shrink-0 text-primary"/>Checkout is still being built; these are estimates, not a booking or payment request.</div></div>
          <Link href="/login" className="group mt-5 flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">Sign in to Nestfix <ArrowRight size={18} className="transition-transform group-hover:translate-x-1"/></Link>
          <Link href="/#explore" className="mt-3 flex min-h-11 items-center justify-center text-xs font-semibold text-muted-foreground underline underline-offset-4">Explore more services</Link>
        </aside>
      </div>}
  </main>;
}
