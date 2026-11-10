'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useCart, toCartItem } from '@/lib/cart-store';
import type { Service } from '@/lib/catalog';

export function AddServiceButton({service}:{service:Service}) {
  const qty=useCart(s=>s.lines.find(x=>x.id===service.id)?.qty??0);
  const add=useCart(s=>s.add);
  const setQty=useCart(s=>s.setQty);
  const reduceMotion=useReducedMotion();

  return <div className="relative inline-flex min-h-11 min-w-[105px] items-center justify-center overflow-hidden rounded-xl border border-primary/35 bg-background text-primary" onClick={e=>e.stopPropagation()}>
    <AnimatePresence mode="wait" initial={false}>
      {qty===0?
        <motion.button key="add" type="button" whileTap={reduceMotion?undefined:{scale:.95}} initial={reduceMotion?false:{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} exit={reduceMotion?{opacity:0}:{opacity:0,scale:.94}} transition={{duration:reduceMotion?0:.15}}
          className="inline-flex min-h-11 items-center justify-center gap-1 px-5 text-sm font-extrabold" onClick={()=>add(toCartItem(service))} aria-label={'Add '+service.name+' to cart'}>
          Add <Plus size={16} strokeWidth={2.5}/>
        </motion.button>:
        <motion.div key="stepper" initial={reduceMotion?false:{opacity:0,scale:.92}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:reduceMotion?0:.16}} className="inline-flex items-center">
          <button type="button" className="grid size-11 place-items-center rounded-lg transition-colors hover:bg-secondary" onClick={()=>setQty(service.id,qty-1)} aria-label={'Remove one '+service.name}><Minus size={16}/></button>
          <span className="relative grid min-w-5 place-items-center font-extrabold" aria-live="polite" aria-atomic="true"><motion.span key={qty} initial={reduceMotion?false:{opacity:.2,y:-5}} animate={{opacity:1,y:0}} transition={{duration:reduceMotion?0:.18}}>{qty}</motion.span></span>
          <button type="button" disabled={qty>=20} className="grid size-11 place-items-center rounded-lg transition-colors hover:bg-secondary disabled:opacity-40" onClick={()=>setQty(service.id,qty+1)} aria-label={'Add one '+service.name}><Plus size={16}/></button>
        </motion.div>}
    </AnimatePresence>
  </div>;
}
