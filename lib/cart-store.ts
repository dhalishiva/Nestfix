'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Service } from '@/lib/catalog';

export type CartLine = Pick<Service,'id'|'slug'|'name'|'price'|'mrp'|'duration_minutes'|'category_slug'> & {qty:number};
type CartState = {
 lines: CartLine[];
 add: (item: Omit<CartLine,'qty'>) => void;
 setQty: (id:string,qty:number) => void;
 clear: () => void;
};
export const useCart = create<CartState>()(persist((set) => ({
 lines: [],
 add: item => set(state => {
   const prev=state.lines.find(x=>x.id===item.id);
   return { lines: prev ? state.lines.map(x=>x.id===item.id?{...x,qty:Math.min(20,x.qty+1)}:x) : [...state.lines,{...item,qty:1}] };
 }),
 setQty:(id,qty)=>set(state=>({lines: qty<=0 ? state.lines.filter(x=>x.id!==id) : state.lines.map(x=>x.id===id ? {...x,qty:Math.min(20,qty)} : x)})),
 clear:()=>set({lines:[]}),
}), { name:'nestfix-cart-v1' }));
export function toCartItem(service: Service): Omit<CartLine,'qty'> {
 return { id:service.id,slug:service.slug,name:service.name,price:service.price,mrp:service.mrp,duration_minutes:service.duration_minutes,category_slug:service.category_slug };
}
