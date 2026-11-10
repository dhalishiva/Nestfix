import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';

export default function CustomerLayout({children}:{children:React.ReactNode}) {
  return <><Header/>{children}<footer className="mx-auto max-w-7xl px-5 pb-28 pt-10 text-center text-xs text-muted-foreground md:pb-10">© {new Date().getFullYear()} Nestfix. Made for everyday care.</footer><MobileNav/></>;
}
