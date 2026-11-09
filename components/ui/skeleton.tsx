import type * as React from 'react';
import { cn } from '@/lib/utils/cn';
export function Skeleton({className,...props}:React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-xl bg-muted motion-reduce:animate-none',className)} {...props}/>;
}
