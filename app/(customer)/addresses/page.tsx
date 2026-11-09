'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

type City={id:string,name:string;slug:string};
type Address={id:string;label:'Home'|'Work'|'Other';house:string;area:string;landmark:string|null;pincode:string;city_id:string;is_default:boolean};
const schema=z.object({house:z.string().min(2).max(160),area:z.string().min(2).max(160),pincode:z.string().regex(/^[0-9]{6}$/),city_id:z.string().uuid()});
export default function AddressesPage() {
  const [user,setUser]=useState<string|null>(null),[loaded,setLoaded]=useState(false),[cities,setCities]=useState<City[]>([]),[addresses,setAddresses]=useState<Address[]>([]);
  const [house,setHouse]=useState(''),[area,setArea]=useState(''),[landmark,setLandmark]=useState(''),[pincode,setPincode]=useState(''),[city,setCity]=useState(''),[label,setLabel]=useState<'Home'|'Work'|'Other'>('Home');
  const [error,setError]=useState(''),[busy,setBusy]=useState(false),[editing,setEditing]=useState<string|null>(null);
  const load=useCallback(async()=>{
    const client=createClient();
    const auth=await client.auth.getUser();
    setUser(auth.data.user?.id??null);
    const {data:citiesData}=await client.from('cities').select('id,name,slug').eq('is_active',true).order('name');
    setCities((citiesData??[]) as City[]);
    if(auth.data.user){
      const {data:addr,error:err}=await client.from('addresses').select('id,label,house,area,landmark,pincode,city_id,is_default').eq('user_id',auth.data.user.id).order('created_at',{ascending:false});
      if(err)setError(err.message);else setAddresses((addr??[]) as Address[]);
    }
    setLoaded(true);
  },[]);
  useEffect(()=>{void load()},[load]);
  function reset(){setHouse('');setArea('');setLandmark('');setPincode('');setLabel('Home');setCity('');setEditing(null);}
  async function save(e:React.FormEvent) {
    e.preventDefault();setError('');
    if(!user) return setError('Sign in to manage addresses.');
    const result=schema.safeParse({house,area,pincode,city_id:city});
    if(!result.success)return setError(result.error.issues[0].message);
    setBusy(true);
    const client=createClient();
    try{
      const {data:pin,error:pinError}=await client.from('serviceable_pincodes').select('pincode').eq('city_id',city).eq('pincode',pincode).maybeSingle();
      if(pinError)throw pinError;
      if(!pin)throw new Error('We are not in this PIN code yet. Choose a supported area.');
      const payload={...result.data,label,landmark:landmark.trim()||null,user_id:user};
      const response=editing?await client.from('addresses').update(payload).eq('id',editing).eq('user_id',user):await client.from('addresses').insert(payload);
      if(response.error)throw response.error;
      reset();await load();
    }catch(e){setError(e instanceof Error?e.message:'Unable to save address.');}
    finally{setBusy(false);}
  }
  async function remove(id:string){if(!user)return;setBusy(true);const {error}=await createClient().from('addresses').delete().eq('id',id).eq('user_id',user);if(error)setError(error.message);else await load();setBusy(false);}
  function edit(a:Address){setEditing(a.id);setHouse(a.house);setArea(a.area);setLandmark(a.landmark??'');setPincode(a.pincode);setCity(a.city_id);setLabel(a.label);}
  return <main className="mx-auto max-w-4xl px-5 py-10"><Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-primary"><ArrowLeft size={18}/> Browse services</Link><h1 className="mt-4 font-display text-4xl font-bold">Saved addresses</h1>
  {!loaded?<p className="mt-8">Loading...</p>:!user?<div className="mt-8 rounded-2xl border bg-card p-8"><p>Sign in to save your service addresses securely.</p><Link className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground" href="/login">Sign in</Link></div>:
  <div className="mt-7 grid gap-6 md:grid-cols-[1fr_1fr]"><section className="space-y-3">{addresses.length===0&&<div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No addresses saved yet.</div>}{addresses.map(a=><article key={a.id} className="rounded-2xl border bg-card p-5"><div className="flex items-start gap-3"><MapPin className="mt-1 shrink-0 text-primary"/><div className="flex-1"><h2 className="font-semibold">{a.label}{a.is_default?' · Default':''}</h2><p className="mt-2 text-sm text-muted-foreground">{a.house}, {a.area}, {a.pincode}</p></div></div><div className="mt-4 flex gap-3 text-sm"><button type="button" onClick={()=>edit(a)} className="min-h-11 rounded-xl border px-4">Edit</button><button type="button" disabled={busy} onClick={()=>void remove(a.id)} className="inline-flex min-h-11 items-center gap-1 rounded-xl border px-4"><Trash2 size={15}/> Delete</button></div></article>)}</section>
  <form onSubmit={e=>void save(e)} className="h-fit space-y-4 rounded-2xl border bg-card p-6"><h2 className="flex items-center gap-2 font-display text-xl font-bold"><Plus size={19}/>{editing?'Edit address':'Add an address'}</h2><label className="block text-sm font-semibold">Address type<select className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3" value={label} onChange={e=>setLabel(e.target.value as 'Home'|'Work'|'Other')}><option>Home</option><option>Work</option><option>Other</option></select></label><label className="block text-sm font-semibold">House / flat<input required minLength={2} maxLength={160} className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3" value={house} onChange={e=>setHouse(e.target.value)}/></label><label className="block text-sm font-semibold">Area / locality<input required minLength={2} maxLength={160} className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3" value={area} onChange={e=>setArea(e.target.value)}/></label><label className="block text-sm font-semibold">Landmark (optional)<input className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3" value={landmark} onChange={e=>setLandmark(e.target.value)}/></label><label className="block text-sm font-semibold">City<select required className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3" value={city} onChange={e=>setCity(e.target.value)}><option value="">Select city</option>{cities.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label className="block text-sm font-semibold">PIN code<input inputMode="numeric" required pattern="[0-9]{6}" maxLength={6} className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3" value={pincode} onChange={e=>setPincode(e.target.value.replace(/\D/g,''))}/></label><button disabled={busy} className="min-h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground">{busy?'Saving...':editing?'Save changes':'Save address'}</button>{editing&&<button type="button" className="min-h-11 w-full text-sm underline" onClick={reset}>Cancel edit</button>}</form></div>}
  {error&&<p role="alert" className="mt-5 rounded-xl border border-destructive p-4 text-sm">{error}</p>}</main>;
}
