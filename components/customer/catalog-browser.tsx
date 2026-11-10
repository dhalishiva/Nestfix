'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Check, Clock3, HeartHandshake, MapPin, Search, ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles, Star, X } from 'lucide-react';
import { AddServiceButton } from '@/components/customer/add-service-button';
import { categoryIconFor } from '@/components/customer/category-icon';
import { ServiceQuickView } from '@/components/customer/service-quick-view';
import type { Category, Service } from '@/lib/catalog';
import { money } from '@/lib/utils/currency';
import { useCart } from '@/lib/cart-store';

type SortMode = 'popular' | 'low' | 'high';

const stagger = {show:{transition:{staggerChildren:0.1}}};
const enter = {
  hidden:{opacity:0,y:28},
  show:{opacity:1,y:0,transition:{duration:0.58,ease:[0.22,1,0.36,1] as [number,number,number,number]}},
};

export function CatalogBrowser({categories,services}:{categories:Category[];services:Service[]}) {
  const [search,setSearch]=useState('');
  const [active,setActive]=useState('all');
  const [sort,setSort]=useState<SortMode>('popular');
  const [shown,setShown]=useState(9);
  const [preview,setPreview]=useState<Service|null>(null);
  const searchRef=useRef<HTMLInputElement>(null);
  const reduceMotion=useReducedMotion();
  const closePreview=useCallback(()=>setPreview(null),[]);
  const cartCount=useCart(s=>s.lines.reduce((n,line)=>n+line.qty,0));
  const subtotal=useCart(s=>s.lines.reduce((n,line)=>n+line.qty*line.price,0));

  useEffect(()=>{
    function hotkey(e:KeyboardEvent){
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){
        e.preventDefault();searchRef.current?.focus();
      }
      if(e.key==='Escape'&&document.activeElement===searchRef.current)searchRef.current?.blur();
    }
    window.addEventListener('keydown',hotkey);
    return ()=>window.removeEventListener('keydown',hotkey);
  },[]);

  const filtered=useMemo(()=>{
    const q=search.trim().toLocaleLowerCase('en-IN');
    const matching=services.filter(s=>(active==='all'||s.category_slug===active)&&(!q||[s.name,s.description,s.category_name,s.subcategory_name].join(' ').toLocaleLowerCase('en-IN').includes(q)));
    if(sort==='low')matching.sort((a,b)=>a.price-b.price);
    if(sort==='high')matching.sort((a,b)=>b.price-a.price);
    return matching;
  },[services,active,search,sort]);

  const changeCategory=(slug:string)=>{
    setActive(slug);setShown(9);
    document.getElementById('service-results')?.scrollIntoView({block:'nearest',behavior:reduceMotion?'instant':'smooth'});
  };
  const spotlight=services.slice(0,2);
  const highlighted=services.slice(0,3);

  return <main className="overflow-hidden pb-28 md:pb-14">
    <section className="hero-mesh relative isolate overflow-hidden">
      <div className="hero-orb pointer-events-none absolute -right-28 -top-36 h-[490px] w-[490px] rounded-full border border-white/15 md:right-[8%]" aria-hidden/>
      <div className="hero-orb pointer-events-none absolute -bottom-72 right-1/3 h-[460px] w-[460px] rounded-full border border-white/10" aria-hidden/>
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 sm:px-8 md:grid-cols-[1.1fr_.9fr] md:gap-12 md:py-24 lg:py-28">
        <motion.div variants={reduceMotion?undefined:stagger} initial={reduceMotion?false:'hidden'} animate="show" className="relative z-10">
          <motion.div variants={reduceMotion?undefined:enter} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[.2em] text-[#e6efe7] backdrop-blur">
            <Sparkles size={15} className="text-[#e5c98d]" aria-hidden/> Meet a more cared-for home
          </motion.div>
          <motion.h1 variants={reduceMotion?undefined:enter} className="mt-7 max-w-[720px] font-display text-[clamp(3.3rem,7.6vw,6.9rem)] font-extrabold leading-[.99] tracking-[-.065em] text-[#fffaf0]">
            Good homes.<br/><span className="font-display italic text-[#e6cb97]">Great care.</span>
          </motion.h1>
          <motion.p variants={reduceMotion?undefined:enter} className="mt-7 max-w-[510px] text-base leading-7 text-[#d7e7dc] sm:text-lg sm:leading-8">
            The little fixes. The big refreshes. All your home essentials, in one beautifully simple place.
          </motion.p>
          <motion.div variants={reduceMotion?undefined:enter} className="mt-9 flex flex-wrap gap-3">
            <Link href="/#explore" className="group inline-flex min-h-[54px] items-center gap-3 rounded-2xl bg-[#f2dab1] px-6 text-sm font-extrabold text-[#153b2a] shadow-[0_12px_25px_rgba(0,0,0,.12)] transition-transform hover:-translate-y-0.5 focus-visible:outline-offset-4">
              Explore services <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/>
            </Link>
            <Link href="/cart" className="inline-flex min-h-[54px] items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-6 text-sm font-bold text-[#f8f9f1] backdrop-blur transition-colors hover:bg-white/20">
              <ShoppingBag size={18}/> My cart {cartCount>0&&<span className="rounded-full bg-white/20 px-2 py-0.5">{cartCount}</span>}
            </Link>
          </motion.div>
          <motion.div variants={reduceMotion?undefined:enter} className="mt-11 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold tracking-wide text-[#d8e6da]">
            <span className="inline-flex items-center gap-2"><Check className="text-[#f5d899]" size={16}/> Clear service prices</span>
            <span className="inline-flex items-center gap-2"><Check className="text-[#f5d899]" size={16}/> Services for Indian homes</span>
          </motion.div>
        </motion.div>
        <div className="relative mx-auto flex min-h-[340px] w-full max-w-[430px] items-center justify-center md:min-h-[460px]" aria-label="Featured Nestfix services">
          <motion.div initial={reduceMotion?false:{opacity:0,y:44,rotate:-4}} animate={{opacity:1,y:0,rotate:-3}} transition={{duration:.7,ease:[.22,1,.36,1],delay:.15}}
            className="absolute left-[3%] top-[3%] z-10 w-[75%] rounded-[2rem] border border-white/30 bg-[#fdf9ef] p-5 text-[#183a2d] shadow-[0_28px_90px_rgba(0,0,0,.22)] sm:p-7">
            <div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-[.22em] text-[#557466]">Your next little win</span><div className="grid size-8 place-items-center rounded-full bg-[#e6f1e6]"><Sparkles size={16}/></div></div>
            {spotlight[0]&&<><div className="relative mt-6 grid h-32 place-items-center overflow-hidden rounded-2xl bg-[#e8efe4]"><div className="absolute size-36 rounded-full border border-[#c4d5bd]"/><div className="absolute size-24 rounded-full border border-[#c4d5bd]"/>{(() => {const Icon=categoryIconFor(spotlight[0].category_name);return <Icon size={60} className="relative z-10 text-[#2a6549]" strokeWidth={1.5}/>;})()}</div>
              <p className="mt-5 text-xs font-semibold text-[#527363]">{spotlight[0].category_name}</p><div className="mt-1 flex items-end justify-between gap-2"><p className="max-w-[65%] font-display text-xl font-extrabold leading-tight">{spotlight[0].name}</p><span className="shrink-0 font-display text-lg font-bold">{money(spotlight[0].price)}</span></div>
            </>}
          </motion.div>
          <motion.div initial={reduceMotion?false:{opacity:0,y:44,rotate:8}} animate={{opacity:1,y:0,rotate:7}} transition={{duration:.7,ease:[.22,1,.36,1],delay:.32}}
            className="absolute bottom-[7%] right-[1%] z-20 w-[65%] rounded-[1.6rem] border border-white/50 bg-[#f2dbb8] p-5 text-[#223a2d] shadow-[0_25px_70px_rgba(0,0,0,.2)]">
            <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-[#fff8eb]"><HeartHandshake size={23}/></div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#6b735e]">Made for real life</p>
            <p className="mt-2 font-display text-xl font-extrabold leading-[1.14] sm:text-2xl">Less to-do.<br/>More living.</p>
            <div className="mt-4 h-px bg-[#d5bc9c]"/><p className="mt-3 text-[11px] font-medium">Discover • Choose • Add</p>
          </motion.div>
          <motion.div initial={reduceMotion?false:{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{duration:.55,delay:.6}} className="absolute right-[3%] top-[2%] grid size-24 place-items-center rounded-full border border-white/25 bg-[#e8c88b] text-center text-[#174332] shadow-xl">
            <div><Sparkles size={23} className="mx-auto"/><span className="text-[9px] font-extrabold uppercase tracking-widest">Nestfix</span></div>
          </motion.div>
        </div>
      </div>
      <div className="relative border-t border-white/15 bg-[#06291f]/35">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-white/10 px-5 py-5 text-center sm:px-8">
          <div><span className="font-display text-2xl font-extrabold text-[#fffbef] sm:text-3xl">{categories.length}</span><p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#bbd3c5] sm:text-xs">Categories</p></div>
          <div><span className="font-display text-2xl font-extrabold text-[#fffbef] sm:text-3xl">{services.length}</span><p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#bbd3c5] sm:text-xs">Services</p></div>
          <div><span className="font-display text-2xl font-extrabold text-[#fffbef] sm:text-3xl">5</span><p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#bbd3c5] sm:text-xs">Cities</p></div>
        </div>
      </div>
    </section>

    <section id="explore" className="scroll-mt-24 bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="eyebrow">Made for your everyday</p><h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-.045em] sm:text-5xl">What needs a little <span className="text-primary">love?</span></h2><p className="mt-3 text-sm text-muted-foreground sm:text-base">Pick a category, or find exactly what you need.</p></div>
          <div className="relative w-full md:max-w-sm">
            <Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"/>
            <input ref={searchRef} type="search" value={search} onChange={e=>{setSearch(e.target.value);setShown(9);}} placeholder="Search for a service..." aria-label="Search services"
              className="min-h-[56px] w-full rounded-2xl border border-border bg-card px-12 pr-16 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
            <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-lg border bg-secondary px-2 py-1 text-[10px] font-bold text-muted-foreground md:block">⌘ K</kbd>
          </div>
        </div>
        <div className="mt-9 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          <motion.button whileTap={reduceMotion?undefined:{scale:.97}} type="button" aria-pressed={active==='all'} onClick={()=>changeCategory('all')}
            className={'group flex min-h-28 flex-col items-center justify-center gap-3 rounded-[1.3rem] border px-2 py-4 text-center text-xs font-bold transition-colors sm:min-h-32 ' + (active==='all'?'border-primary bg-primary text-primary-foreground shadow-[0_12px_25px_rgba(17,74,52,.16)]':'bg-card hover:border-primary/40 hover:bg-secondary/60')}>
            <span className={'grid size-12 place-items-center rounded-2xl ' + (active==='all'?'bg-white/15':'bg-secondary text-primary')}><Sparkles size={24}/></span><span>All services</span>
          </motion.button>
          {categories.map(category=>{
            const Icon=categoryIconFor(category.name);
            const selected=active===category.slug;
            return <motion.button whileTap={reduceMotion?undefined:{scale:.97}} key={category.id} type="button" aria-pressed={selected} onClick={()=>changeCategory(category.slug)}
              className={'group flex min-h-28 flex-col items-center justify-center gap-2.5 rounded-[1.3rem] border px-2 py-4 text-center text-xs font-bold transition-all sm:min-h-32 ' + (selected?'border-primary bg-primary text-primary-foreground shadow-[0_12px_25px_rgba(17,74,52,.16)]':'bg-card hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft')}>
              <span className={'grid size-12 place-items-center rounded-2xl transition-colors ' + (selected?'bg-white/15':'bg-secondary text-primary group-hover:bg-accent')}><Icon size={24} strokeWidth={1.8}/></span>
              <span className="line-clamp-2 leading-snug">{category.name}</span>
            </motion.button>;
          })}
        </div>
      </div>
    </section>

    <section id="service-results" className="scroll-mt-32 bg-secondary/25 pb-20 pt-12 sm:pt-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="eyebrow">The service edit</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">{active==='all'?'Explore all services':categories.find(c=>c.slug===active)?.name??'Services'}</h2><p className="mt-3 text-sm text-muted-foreground">{filtered.length} {filtered.length===1?'service':'services'} available to explore</p></div>
          <label className="inline-flex min-h-12 items-center gap-2 rounded-xl border bg-card px-4 text-sm font-semibold text-muted-foreground"><SlidersHorizontal size={17} className="text-primary"/><span className="sr-only">Sort services</span><select aria-label="Sort services" value={sort} onChange={e=>{setSort(e.target.value as SortMode);setShown(9);}} className="max-w-44 bg-transparent text-foreground outline-none"><option value="popular">Popular first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
        </div>
        <motion.div layout={!reduceMotion} className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false} mode="popLayout">
            {filtered.slice(0,shown).map((service,index)=>{
              const Icon=categoryIconFor(service.category_name);
              const isBestseller=service.tags.some(t=>t.toLowerCase().includes('bestsell'));
              return <motion.article key={service.id} layout={!reduceMotion}
                initial={reduceMotion?false:{opacity:0,y:20,scale:.975}} animate={{opacity:1,y:0,scale:1}} exit={reduceMotion?{opacity:0}:{opacity:0,y:-12,scale:.98}}
                transition={{duration:reduceMotion?0:.25,delay:reduceMotion?0:Math.min(index,5)*.035}}
                className="group flex min-h-[380px] flex-col overflow-hidden rounded-[1.6rem] border border-border/80 bg-card shadow-[0_8px_30px_rgba(18,64,44,.035)] transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-[0_24px_55px_rgba(18,64,44,.12)]">
                <div className="relative m-3 mb-0 flex h-36 items-center justify-center overflow-hidden rounded-[1.12rem] bg-[radial-gradient(circle_at_35%_25%,hsl(var(--accent)),hsl(var(--secondary))_65%)]">
                  <div className="absolute -right-7 -top-8 size-44 rounded-full border border-primary/10"/>
                  <div className="absolute -bottom-14 -left-9 size-36 rounded-full border border-primary/10"/>
                  <motion.div whileHover={reduceMotion?undefined:{rotate:-9,scale:1.12}} transition={{type:'spring',stiffness:250,damping:17}} className="grid size-24 place-items-center rounded-[1.8rem] border border-white/30 bg-card/65 text-primary shadow-sm backdrop-blur-sm"><Icon size={48} strokeWidth={1.4}/></motion.div>
                  {isBestseller&&<span className="absolute left-3 top-3 rounded-full bg-[#f4dfb5] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#29523b]">Bestseller</span>}
                  <button type="button" onClick={()=>setPreview(service)} className="absolute bottom-3 right-3 inline-flex min-h-9 items-center gap-1 rounded-full bg-card/95 px-3 text-xs font-bold text-foreground shadow-sm backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground" aria-label={'Quick view '+service.name}>
                    Quick view <ArrowUpRight size={14}/>
                  </button>
                </div>
                <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
                  <p className="text-[11px] font-extrabold uppercase tracking-[.13em] text-primary">{service.category_name}</p>
                  <Link href={'/services/'+service.slug} className="mt-2 font-display text-xl font-extrabold leading-snug tracking-[-.02em] transition-colors hover:text-primary">{service.name}</Link>
                  <p className="mt-2 line-clamp-2 min-h-[42px] text-sm leading-6 text-muted-foreground">{service.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Clock3 size={14}/>{service.duration_minutes} min</span>
                    {service.rating_count>0&&<span className="inline-flex items-center gap-1"><Star size={13} className="fill-amber-500 text-amber-500"/>{service.rating_avg.toFixed(1)}</span>}
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-3 border-t pt-5">
                    <div><span className="font-display text-[1.45rem] font-extrabold tracking-tight">{money(service.price)}</span>{service.mrp>service.price&&<span className="ml-2 text-xs text-muted-foreground line-through">{money(service.mrp)}</span>}<p className="mt-1 text-[11px] text-muted-foreground">Fixed service price</p></div>
                    <AddServiceButton service={service}/>
                  </div>
                </div>
              </motion.article>;
            })}
          </AnimatePresence>
        </motion.div>
        {filtered.length===0&&<div className="mt-8 flex flex-col items-center rounded-[1.6rem] border border-dashed bg-card px-6 py-14 text-center"><Search size={35} className="text-primary"/><h3 className="mt-5 font-display text-2xl font-bold">Nothing here just yet.</h3><p className="mt-2 text-sm text-muted-foreground">Try another search or browse all the services.</p><button type="button" onClick={()=>{setSearch('');setActive('all');setShown(9)}} className="mt-6 min-h-11 rounded-xl bg-primary px-5 font-bold text-primary-foreground">See all services</button></div>}
        {shown<filtered.length&&<div className="mt-9 text-center"><button type="button" onClick={()=>setShown(n=>n+9)} className="group inline-flex min-h-12 items-center gap-3 rounded-2xl border bg-card px-7 font-bold transition-colors hover:border-primary/40 hover:bg-secondary">Load more services <ArrowDown size={17} className="transition-transform group-hover:translate-y-1"/></button></div>}
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="grid gap-8 md:grid-cols-[.95fr_1.05fr] md:items-center">
        <div><p className="eyebrow">A simpler way to care</p><h2 className="mt-4 max-w-lg font-display text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">Your space, <span className="italic text-primary">sorted.</span></h2><p className="mt-5 max-w-md leading-8 text-muted-foreground">From a quick repair to a whole-home reset, explore service details and prices with clarity.</p><Link href="/cart" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-2xl border border-primary px-5 font-bold text-primary transition-colors hover:bg-secondary">See your selections <ArrowRight size={18}/></Link></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {Icon:ShieldCheck,title:'Know what to expect',text:'See what each service includes before adding it.'},
            {Icon:BadgeCheck,title:'Clear pricing',text:'Compare listed prices and savings in one view.'},
            {Icon:MapPin,title:'Built for local homes',text:'Browse services available across five Indian cities.'},
            {Icon:Sparkles,title:'The easy part',text:'Keep a neat, saved cart while you explore.'}
          ].map(({Icon,title,text},i)=><div key={title} className={'rounded-[1.5rem] border p-6 ' + (i===0?'bg-primary text-primary-foreground':'bg-card')}><div className={'grid size-12 place-items-center rounded-2xl ' + (i===0?'bg-white/15':'bg-secondary text-primary')}><Icon size={23}/></div><h3 className="mt-5 font-display text-lg font-extrabold">{title}</h3><p className={'mt-2 text-sm leading-6 ' + (i===0?'text-primary-foreground/80':'text-muted-foreground')}>{text}</p></div>)}
        </div>
      </div>
    </section>

    <AnimatePresence>
      {cartCount>0&&<motion.div initial={reduceMotion?false:{opacity:0,y:28}} animate={{opacity:1,y:0}} exit={reduceMotion?{opacity:0}:{opacity:0,y:20}} transition={{duration:reduceMotion?0:.22}}
        className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-4 right-4 z-30 mx-auto max-w-md rounded-[1.25rem] border border-white/20 bg-[#133f2e] p-2 text-[#fffaf0] shadow-[0_18px_50px_rgba(4,35,22,.28)] md:bottom-7">
        <Link href="/cart" className="flex min-h-[54px] items-center justify-between gap-3 px-3"><span className="inline-flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white/15"><ShoppingBag size={19}/></span><span><strong className="block text-sm">{cartCount} {cartCount===1?'service':'services'} in cart</strong><span className="text-xs text-white/75">{money(subtotal)} estimated</span></span></span><span className="inline-flex items-center gap-1 text-sm font-bold">View cart <ArrowRight size={17}/></span></Link>
      </motion.div>}
    </AnimatePresence>
    <ServiceQuickView service={preview} onClose={closePreview}/>
  </main>;
}
