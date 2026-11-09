'use client';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
export default function ErrorPage({reset}:{error:Error & {digest?:string};reset:()=>void}){
  return <main className="flex min-h-[70vh] items-center justify-center px-5">
    <EmptyState icon={<RefreshCw size={36}/>} title="Something didn't load" description="The page couldn't be displayed right now. Please try again."
      action={<Button onClick={reset}>Try again</Button>}/>
  </main>;
}
