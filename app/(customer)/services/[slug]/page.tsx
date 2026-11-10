import { notFound } from 'next/navigation';
import { loadService } from '@/lib/catalog';
import { ServiceDetailView } from '@/components/customer/service-detail-view';

export const dynamic='force-dynamic';

export default async function ServiceDetail({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const service=await loadService(slug);
  if(!service)notFound();
  return <ServiceDetailView service={service}/>;
}
