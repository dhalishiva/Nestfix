import Link from 'next/link';
import { House } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
export default function NotFound(){
  return <main className="flex min-h-[70vh] items-center justify-center px-5">
    <EmptyState icon={<House size={36}/>} title="This corner is still empty" description="We couldn't find that page. Head back to Nestfix home to find your way."
      action={<Button asChild><Link href="/">Back to home</Link></Button>}/>
  </main>;
}
