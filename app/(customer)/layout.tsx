import { Header } from '@/components/layout/header';
export default function CustomerLayout({children}:{children:React.ReactNode}) {
  return <><Header/>{children}<footer className="mx-auto max-w-6xl px-5 py-10 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Nestfix. Made for everyday care.</footer></>;
}
