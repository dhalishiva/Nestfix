import { loadCatalog } from '@/lib/catalog';
import { CatalogBrowser } from '@/components/customer/catalog-browser';
export const dynamic = 'force-dynamic';
export default async function Home() {
 const catalog=await loadCatalog();
 return <CatalogBrowser {...catalog}/>;
}
