import { ArrowRight, BadgeCheck, CalendarDays, HandHeart, IndianRupee, ShieldCheck, Sparkles, Wind, Wrench } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
const highlights = [
  {name:'Home cleaning',description:'A fresher space, with care',Icon:Sparkles},
  {name:'AC service & repair',description:'Comfort when you need it',Icon:Wind},
  {name:'Plumbing',description:'Fix the everyday',Icon:Wrench},
  {name:'Salon at home',description:'Little moments for you',Icon:HandHeart},
];
const benefits: { title: string; description: string; Icon: LucideIcon }[] = [
  {title:'Verified professionals',description:'Document review and thoughtful onboarding.',Icon:ShieldCheck},
  {title:'Upfront pricing',description:'Clear service prices before you decide.',Icon:IndianRupee},
  {title:'Convenient time slots',description:'Pick a time that works for your household.',Icon:CalendarDays},
];
export default function Home() {
  return <main>
    <section className="relative overflow-hidden border-b bg-secondary/55">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-28">
        <div><span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-primary"><BadgeCheck size={16}/> Thoughtfully built for your home</span>
          <h1 className="mt-6 max-w-2xl font-display text-5xl font-extrabold leading-[1.07] tracking-tight md:text-7xl">Home care,<br/><span className="text-primary">beautifully simple.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">Fixed prices. Trusted professionals. Time back for what matters. Nestfix is laying the groundwork for easy home-service bookings.</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-card px-4 py-3 text-sm font-medium"><CalendarDays size={17}/> Customer bookings launch in Phase 3. <ArrowRight size={15}/></p>
        </div>
        <div className="relative rounded-[2rem] border bg-card p-7 shadow-soft"><div className="absolute -right-4 -top-5 flex size-20 items-center justify-center rounded-full bg-accent text-primary"><ShieldCheck size={34}/></div>
          <p className="font-display text-2xl font-bold">A better way to care</p><p className="mt-2 text-muted-foreground">From little repairs to a sparkling clean.</p>
          <div className="mt-8 grid grid-cols-2 gap-3">{highlights.map(({name,description,Icon})=><div className="rounded-2xl bg-secondary/60 p-5" key={name}><Icon className="mb-5 text-primary" size={27}/><p className="font-semibold">{name}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div>)}</div>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-16"><p className="text-sm font-bold uppercase tracking-widest text-primary">Designed for trust</p><h2 className="mt-3 max-w-xl font-display text-3xl font-bold md:text-4xl">A service experience you can feel good about.</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">{benefits.map(({title,description,Icon})=><Card className="p-6" key={title}><Icon className="mb-4 text-primary" size={28}/><h3 className="font-display text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></Card>)}</div>
    </section>
  </main>;
}
