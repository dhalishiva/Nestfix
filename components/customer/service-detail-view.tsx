'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clock3, HeartHandshake, ShieldCheck, Star, X } from 'lucide-react';
import { AddServiceButton } from '@/components/customer/add-service-button';
import { categoryIconFor } from '@/components/customer/category-icon';
import type { Service } from '@/lib/catalog';
import { money } from '@/lib/utils/currency';

export function ServiceDetailView({service}:{service:Service}){
  const reduced=useReducedMotion();
  const Icon=categoryIconFor(service.category_name);
  return <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8 md:pt-14">
    <Link href="/#explore" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline"><ArrowLeft size={17}/> Explore services</Link>
    <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-start">
      <motion.div initial={reduced?false:{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.45}}>
        <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-[2rem] bg-[radial-gradient(ellipse_at_60%_40%,hsl(var(--accent)),hsl(var(--secondary))_65%)] p-10 md:min-h-80">
          <div className="absolute -right-10 -top-16 size-72 rounded-full border border-primary/15"/>
          <div className="absolute -bottom-28 -left-20 size-80 rounded-full border border-primary/15"/>
          <motion.div initial={reduced?false:{rotate:-8,scale:.85}} animate={{rotate:0,scale:1}} transition={reduced?{duration:0}:{type:'spring',stiffness:150,damping:15}} className="relative z-10 grid size-36 place-items-center rounded-[2.5rem] border border-white/40 bg-card/70 text-primary shadow-[0_20px_60px_rgba(22,65,46,.14)] backdrop-blur sm:size-44"><Icon size={86} strokeWidth={1.3}/></motion.div>
          <span className="absolute bottom-5 left-5 rounded-full border border-primary/15 bg-card/85 px-4 py-2 text-xs font-bold text-primary backdrop-blur">{service.category_name}</span>
        </div>
        <div className="mt-8"><p className="eyebrow">{service.category_name} / {service.subcategory_name}</p><h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-[-.045em] sm:text-5xl">{service.name}</h1><p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">{service.description}</p></div>
        <div className="mt-7 flex flex-wrap gap-3 text-sm text-muted-foreground"><span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2"><Clock3 size={17} className="text-primary"/>{service.duration_minutes} minutes</span>{service.rating_count>0&&<span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2"><Star size={17} className="fill-amber-500 text-amber-500"/>{service.rating_avg.toFixed(1)} rating</span>}</div>
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          <section className="rounded-[1.6rem] border bg-card p-6"><h2 className="font-display text-xl font-extrabold">What’s included</h2>{service.includes.length?<ul className="mt-5 space-y-4">{service.includes.map(item=><li key={item} className="flex gap-3 text-sm leading-6"><Check size={18} className="mt-0.5 shrink-0 text-primary"/>{item}</li>)}</ul>:<p className="mt-4 text-sm text-muted-foreground">See service description for details.</p>}</section>
          <section className="rounded-[1.6rem] border bg-card p-6"><h2 className="font-display text-xl font-extrabold">Not included</h2>{service.excludes.length?<ul className="mt-5 space-y-4">{service.excludes.map(item=><li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><X size={18} className="mt-0.5 shrink-0"/>{item}</li>)}</ul>:<p className="mt-4 text-sm text-muted-foreground">No exclusions listed.</p>}</section>
        </div>
      </motion.div>
      <motion.aside initial={reduced?false:{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.4,delay:reduced?0:.1}} className="h-fit rounded-[1.8rem] border bg-card p-7 shadow-soft lg:sticky lg:top-28">
        <p className="eyebrow">Upfront service price</p><div className="mt-4 font-display text-4xl font-extrabold tracking-tight">{money(service.price)}</div>
        {service.mrp>service.price&&<p className="mt-1 text-sm text-muted-foreground"><s>{money(service.mrp)}</s><span className="ml-3 font-bold text-primary">Save {money(service.mrp-service.price)}</span></p>}
        <div className="mt-7 flex items-center gap-2 rounded-xl bg-secondary/70 p-4 text-sm"><ShieldCheck className="shrink-0 text-primary" size={19}/> Clear service details</div>
        <p className="mt-6 text-sm font-bold">Add this service to your cart</p><div className="mt-3"><AddServiceButton service={service}/></div>
        <Link href="/cart" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 font-bold text-primary-foreground">View your cart <ArrowRight size={18}/></Link>
        <p className="mt-5 flex gap-2 text-xs leading-5 text-muted-foreground"><HeartHandshake size={17} className="shrink-0 text-primary"/> Booking and payment are being prepared. Adding to cart does not reserve a slot.</p>
      </motion.aside>
    </div>
  </main>;
}
