import { Skeleton } from '@/components/ui/skeleton';
export default function Loading(){
  return <main className="mx-auto max-w-6xl space-y-6 px-5 py-20" aria-label="Loading page">
    <Skeleton className="h-5 w-32"/><Skeleton className="h-20 w-full max-w-xl"/>
    <Skeleton className="h-6 w-full max-w-lg"/>
    <div className="grid gap-5 md:grid-cols-3"><Skeleton className="h-44"/><Skeleton className="h-44"/><Skeleton className="h-44"/></div>
  </main>;
}
