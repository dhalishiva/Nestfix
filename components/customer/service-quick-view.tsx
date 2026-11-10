'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check, Clock3, ShieldCheck, X } from 'lucide-react';
import { AddServiceButton } from '@/components/customer/add-service-button';
import { categoryIconFor } from '@/components/customer/category-icon';
import type { Service } from '@/lib/catalog';
import { money } from '@/lib/utils/currency';

export function ServiceQuickView({service,onClose}:{service:Service|null;onClose:()=>void}) {
  const panelRef=useRef<HTMLDivElement>(null);
  const reduceMotion=useReducedMotion();
  useEffect(()=>{
    if(!service) return;
    const previouslyFocused=document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    panelRef.current?.querySelector<HTMLButtonElement>('[data-close]')?.focus();
    function handleKey(event:KeyboardEvent){
      if(event.key==='Escape'){event.preventDefault();onClose();return;}
      if(event.key!=='Tab')return;
      const focusables=panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if(!focusables?.length)return;
      const first=focusables[0], last=focusables[focusables.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
    document.addEventListener('keydown',handleKey);
    return ()=>{
      document.body.style.overflow=oldOverflow;
      document.removeEventListener('keydown',handleKey);
      previouslyFocused?.focus();
    };
  },[service,onClose]);
  const Icon=service ? categoryIconFor(service.category_name):null;
  return <AnimatePresence>
    {service&&<div className="fixed inset-0 z-[80]">
      <motion.button type="button" aria-label="Close service preview" className="absolute inset-0 h-full w-full cursor-default bg-[#071f18]/65 backdrop-blur-[5px]" onClick={onClose}
        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduceMotion?0:0.24}} />
      <motion.div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="service-preview-title"
        initial={reduceMotion?{opacity:0}:{opacity:0,y:52}} animate={{opacity:1,y:0}} exit={reduceMotion?{opacity:0}:{opacity:0,y:55}}
        transition={{duration:reduceMotion?0:0.32,ease:[0.22,1,0.36,1]}}
        className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[2rem] border-t bg-background shadow-2xl md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-full md:max-w-[480px] md:rounded-none md:border-l md:border-t-0">
        <div className="flex items-center justify-between border-b px-6 py-5"><p className="text-xs font-extrabold uppercase tracking-[.21em] text-primary">A closer look</p>
          <button data-close type="button" onClick={onClose} aria-label="Close preview" className="grid size-11 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-muted"><X size={20}/></button>
        </div>
        <div className="overflow-y-auto px-6 pb-8 pt-6">
          <div className="flex items-center gap-4"><div className="grid size-16 shrink-0 place-items-center rounded-[1.25rem] bg-secondary text-primary">{Icon&&<Icon size={30}/>}</div><div><span className="text-xs font-semibold text-primary">{service.category_name}</span><h2 id="service-preview-title" className="font-display text-2xl font-extrabold leading-tight">{service.name}</h2></div></div>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">{service.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3"><span className="font-display text-3xl font-extrabold">{money(service.price)}</span>{service.mrp>service.price&&<span className="text-sm text-muted-foreground line-through">{money(service.mrp)}</span>}
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-2 text-xs font-semibold"><Clock3 size={14}/>{service.duration_minutes} min</span></div>
          <div className="mt-7 rounded-[1.4rem] border bg-card p-5"><h3 className="font-display text-lg font-extrabold">What’s included</h3>
            {service.includes.length>0?<ul className="mt-4 space-y-3">{service.includes.map(x=><li key={x} className="flex gap-3 text-sm leading-6"><Check className="mt-0.5 shrink-0 text-primary" size={18}/>{x}</li>)}</ul>:<p className="mt-3 text-sm text-muted-foreground">Check the full service page for more details.</p>}
          </div>
          {service.excludes.length>0&&<div className="mt-5 rounded-[1.4rem] bg-secondary/60 p-5"><h3 className="text-sm font-bold">Not included</h3><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{service.excludes.map(x=><li key={x}>• {x}</li>)}</ul></div>}
          <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck size={17} className="shrink-0 text-primary"/> Add items now; scheduling and payment are still being built.</p>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-t bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <AddServiceButton service={service}/><Link href={`/services/${service.slug}`} onClick={onClose} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground">Full details <ArrowUpRight size={17}/></Link>
        </div>
      </motion.div>
    </div>}
  </AnimatePresence>;
}
