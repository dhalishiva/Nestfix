import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type Category = { id: string; slug: string; name: string; icon: string; colour: string };
export type Service = { id: string; slug: string; name: string; description: string; price: number; mrp: number; duration_minutes: number; includes: string[]; excludes: string[]; tags: string[]; rating_avg: number; rating_count: number; image_url: string | null; category_slug: string; category_name: string; category_id: string; subcategory_name: string };

function adaptService(row: Record<string, unknown>): Service {
  const sub = row.subcategories as { name: string; categories: Category };
  return {
    id: String(row.id), slug: String(row.slug), name: String(row.name), description: String(row.description ?? ''),
    price: Number(row.price), mrp: Number(row.mrp), duration_minutes: Number(row.duration_minutes),
    includes: (row.includes as string[] | null) ?? [], excludes: (row.excludes as string[] | null) ?? [],
    tags: (row.tags as string[] | null) ?? [], rating_avg: Number(row.rating_avg ?? 0),
    rating_count: Number(row.rating_count ?? 0), image_url: (row.image_url as string | null) ?? null,
    category_slug: sub.categories.slug, category_name: sub.categories.name,
    category_id: sub.categories.id, subcategory_name: sub.name,
  };
}
const serviceSelect = 'id,slug,name,description,price,mrp,duration_minutes,includes,excludes,tags,rating_avg,rating_count,image_url,subcategories!inner(name,categories!inner(id,slug,name,icon,colour))';
export async function loadCatalog(): Promise<{categories: Category[]; services: Service[]}> {
  const client = await createClient();
  const [cat, svc] = await Promise.all([
    client.from('categories').select('id,slug,name,icon,colour').eq('is_active',true).order('sort_order'),
    client.from('services').select(serviceSelect).eq('is_active',true).order('rating_count', { ascending: false }).limit(100),
  ]);
  if (cat.error) throw new Error('Unable to load categories: ' + cat.error.message);
  if (svc.error) throw new Error('Unable to load services: ' + svc.error.message);
  return { categories: (cat.data ?? []) as Category[], services: (svc.data ?? []).map(row => adaptService(row as unknown as Record<string, unknown>)) };
}
export async function loadService(slug: string): Promise<Service | null> {
  const client = await createClient();
  const {data,error} = await client.from('services').select(serviceSelect).eq('slug',slug).eq('is_active',true).maybeSingle();
  if (error) throw new Error('Unable to load service');
  return data ? adaptService(data as unknown as Record<string, unknown>) : null;
}
