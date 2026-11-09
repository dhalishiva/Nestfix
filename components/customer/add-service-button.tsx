'use client';
import { Minus, Plus } from 'lucide-react';
import { useCart, toCartItem } from '@/lib/cart-store';
import type { Service } from '@/lib/catalog';

export function AddServiceButton({ service }: { service:Service }) {
 const qty=useCart(state=>state.lines.find(x=>x.id===service.id)?.qty ?? 0);
 const add=useCart(state=>state.add);
 const setQty=useCart(state=>state.setQty);
 return <div className="inline-flex min-h-11 items-center rounded-xl border border-primary/30 bg-background text-primary" onClick={e=>e.stopPropagation()}>
   {qty===0 ? <button type="button" className="min-h-11 px-5 text-sm font-bold" onClick={()=>add(toCartItem(service))} aria-label={`Add ${service.name} to cart`}>Add +</button> :
   <><button type="button" className="grid size-11 place-items-center" onClick={()=>setQty(service.id,qty-1)} aria-label={`Remove one ${service.name}`}><Minus size={16}/></button>
   <span className="min-w-5 text-center font-bold" aria-live="polite">{qty}</span>
   <button type="button" className="grid size-11 place-items-center" onClick={()=>setQty(service.id,qty+1)} aria-label={`Add one ${service.name}`} disabled={qty>=20}><Plus size={16}/></button></>}
 </div>;
}
