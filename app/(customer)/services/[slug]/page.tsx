import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, Clock3, ShieldCheck, X } from 'lucide-react';
import { AddServiceButton } from '@/components/customer/add-service-button';
import { loadService, money } from '@/lib/catalog';
export const dynamic = 'force-dynamic';
export default async function ServiceDetail({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;
 const service=await loadService(slug);
 if(!service) notFound();
 return <main className="mx-auto max-w-4xl px-5 py-10">
 <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-primary"><ArrowLeft size={18}/> All services</Link>
 <div className="mt-5 grid gap-8 md:grid-cols-[1fr_280px]">
   <section><span className="text-sm font-semibold text-primary">{service.category_name} / {service.subcategory_name}</span><h1 className="mt-3 font-display text-4xl font-extrabold">{service.name}</h1><p className="mt-5 leading-7 text-muted-foreground">{service.description}</p>
   <div className="mt-8 rounded-2xl border bg-card p-6"><h2 className="font-display text-xl font-bold">What’s included</h2><ul className="mt-4 space-y-3">{service.includes.map(x=><li key={x} className="flex gap-3 text-sm"><Check size={19} className="shrink-0 text-primary"/>{x}</li>)}</ul>{service.includes.length===0&&<p className="text-sm text-muted-foreground">See service description for details.</p>}</div>
   <div className="mt-4 rounded-2xl border bg-card p-6"><h2 className="font-display text-xl font-bold">What’s not included</h2><ul className="mt-4 space-y-3">{service.excludes.map(x=><li key={x} className="flex gap-3 text-sm"><X size={19} className="shrink-0 text-muted-foreground"/>{x}</li>)}</ul>{service.excludes.length===0&&<p className="text-sm text-muted-foreground">No exclusions listed.</p>}</div>
   </section><aside className="h-fit rounded-2xl border bg-card p-6 shadow-soft md:sticky md:top-24"><div className="font-display text-3xl font-bold">{money(service.price)}</div>{service.mrp>service.price&&<p className="text-sm text-muted-foreground"><s>{money(service.mrp)}</s> · Save {money(service.mrp-service.price)}</p>}<p className="mt-4 flex items-center gap-2 text-sm"><Clock3 size={16}/>{service.duration_minutes} minutes</p><p className="mt-2 flex items-center gap-2 text-sm"><ShieldCheck size={16}/> At-home service</p><div className="mt-6"><AddServiceButton service={service}/></div><Link href="/cart" className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground">View cart</Link></aside></div>
 </main>;
}
