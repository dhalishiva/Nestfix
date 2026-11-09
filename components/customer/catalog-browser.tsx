'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, CalendarClock, Search, ShieldCheck, Sparkles, Star, Tag, Truck } from 'lucide-react';
import { AddServiceButton } from '@/components/customer/add-service-button';
import type { Category, Service } from '@/lib/catalog';
import { money } from '@/lib/catalog';
import { useCart } from '@/lib/cart-store';

export function CatalogBrowser({categories,services}:{categories:Category[],services:Service[]}) {
 const [search,setSearch]=useState('');
 const [active,setActive]=useState('all');
 const cartCount=useCart(s=>s.lines.reduce((n,x)=>n+x.qty,0));
 const filtered=useMemo(()=>services.filter(s=>(active==='all'||s.category_slug===active)&&(`${s.name} ${s.description} ${s.category_name}`.toLowerCase().includes(search.trim().toLowerCase()))),[services,search,active]);
 return <main className="pb-24">
   <section className="relative overflow-hidden bg-secondary/55">
     <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-[1.2fr_.8fr] md:items-center md:py-20">
       <div><span className="inline-flex gap-2 rounded-full border bg-background px-4 py-2 text-sm font-semibold text-primary"><BadgeCheck size={18}/> Home services, handled with care</span>
         <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight md:text-6xl">Your home deserves <span className="text-primary">the best.</span></h1>
         <p className="mt-5 max-w-xl text-lg text-muted-foreground">Explore transparent, fixed-price services across 5 Indian cities. Choose exactly what your home needs.</p>
         <div className="relative mt-7 max-w-xl"><Search className="absolute left-4 top-4 text-muted-foreground" size={20}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search AC, bathroom cleaning, plumbing..." className="min-h-14 w-full rounded-2xl border bg-background pl-12 pr-5 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Search services"/></div>
       </div>
       <div className="rounded-3xl border bg-card p-8 shadow-soft"><div className="flex size-16 items-center justify-center rounded-2xl bg-accent text-primary"><Sparkles size={33}/></div><h2 className="mt-6 font-display text-2xl font-bold">Every corner, cared for.</h2><p className="mt-3 text-muted-foreground">From a leaky tap to a home refresh, find your next service with confidence.</p><div className="mt-7 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-secondary px-3 py-2">Fixed prices</span><span className="rounded-full bg-secondary px-3 py-2">11 categories</span><span className="rounded-full bg-secondary px-3 py-2">46 services</span></div></div>
     </div>
   </section>
   <section className="mx-auto max-w-6xl px-5 py-10">
     <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-wider text-primary">Explore services</p><h2 className="mt-1 font-display text-3xl font-bold">What can we help with?</h2></div><Link href="/cart" className="relative inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">My cart {cartCount>0&&<span className="rounded-full bg-white/20 px-2">{cartCount}</span>}<ArrowRight size={16}/></Link></div>
     <div className="mt-6 flex snap-x gap-2 overflow-x-auto pb-3" role="group" aria-label="Filter by category">
       <button type="button" aria-pressed={active==='all'} onClick={()=>setActive('all')} className={`min-h-11 shrink-0 rounded-xl border px-4 text-sm font-semibold ${active==='all'?'bg-primary text-primary-foreground':'bg-card'}`}>All services</button>
       {categories.map(c=><button key={c.id} type="button" aria-pressed={active===c.slug} onClick={()=>setActive(c.slug)} className={`min-h-11 shrink-0 rounded-xl border px-4 text-sm font-semibold ${active===c.slug?'bg-primary text-primary-foreground':'bg-card'}`}>{c.name}</button>)}
     </div>
     <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(s=><article key={s.id} className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-soft"><div><span className="text-xs font-semibold text-primary">{s.category_name} · {s.subcategory_name}</span><h3 className="mt-2 font-display text-xl font-bold"><Link href={`/services/${s.slug}`} className="hover:underline">{s.name}</Link></h3><p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">{s.description}</p><div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">{s.rating_count>0&&<span className="inline-flex items-center gap-1"><Star size={13} className="fill-current text-amber-500"/>{s.rating_avg.toFixed(1)}</span>}<span><CalendarClock size={13} className="mr-1 inline"/>{s.duration_minutes} min</span>{s.tags.includes('Bestseller')&&<span className="rounded bg-accent px-1.5 text-primary">Bestseller</span>}</div></div><div className="mt-5 flex items-end justify-between gap-3 border-t pt-4"><div><strong className="text-lg">{money(s.price)}</strong> {s.mrp>s.price&&<s className="ml-1 text-sm text-muted-foreground">{money(s.mrp)}</s>}<Link href={`/services/${s.slug}`} className="mt-1 block text-xs text-primary underline">View details</Link></div><AddServiceButton service={s}/></div></article>)}</div>
     {filtered.length===0&&<div className="mt-10 rounded-2xl border border-dashed p-12 text-center"><Search className="mx-auto text-muted-foreground"/><h3 className="mt-3 font-semibold">No matching services</h3><p className="mt-1 text-sm text-muted-foreground">Try another search or browse all categories.</p><button type="button" className="mt-4 rounded-xl border px-5 py-3" onClick={()=>{setSearch('');setActive('all')}}>Show all services</button></div>}
   </section>
   <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8 md:grid-cols-3">{[{Icon:ShieldCheck,title:'Thoughtful service',text:'Transparent information before you book.'},{Icon:Tag,title:'Clear prices',text:'See the service price and savings upfront.'},{Icon:Truck,title:'At-home convenience',text:'Designed around your household schedule.'}].map(({Icon,title,text})=><div key={title} className="flex gap-3 rounded-2xl bg-secondary/60 p-5"><Icon size={24} className="shrink-0 text-primary"/><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></div></div>)}</section>
 </main>;
}
