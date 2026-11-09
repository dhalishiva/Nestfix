import Link from 'next/link';
import { HousePlus, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
export function Header() {
  return <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
    <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-5">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg font-display text-2xl font-extrabold tracking-tight" aria-label="Nestfix home">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><HousePlus size={23}/></span>nestfix<span className="text-primary">.</span>
      </Link>
      <div className="flex items-center gap-2"><span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex"><ShieldCheck size={15}/> Made for Indian homes</span><ThemeToggle/></div>
    </div>
  </header>;
}
