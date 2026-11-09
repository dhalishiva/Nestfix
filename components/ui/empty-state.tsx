import type { ReactNode } from 'react';
import { Card } from './card';
export function EmptyState({title,description,action,icon}:{title:string;description:string;action?:ReactNode;icon?:ReactNode}) {
  return <Card className="mx-auto max-w-md p-9 text-center">{icon&&<div className="mb-5 flex justify-center text-primary">{icon}</div>}
    <h2 className="font-display text-2xl font-bold">{title}</h2>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
    {action&&<div className="mt-6">{action}</div>}
  </Card>;
}
