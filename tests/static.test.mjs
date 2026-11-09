// Dependency-free checks: run `node --test tests/static.test.mjs` even offline.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const schema = read('supabase/migrations/20261109000000_initial_schema.sql');
const rls = read('supabase/migrations/20261109000001_rls_storage.sql');
const seed = read('supabase/seed.sql');
const pkg = JSON.parse(read('package.json'));

test('Next 15 and exactly pinned dependencies', () => {
  assert.match(pkg.dependencies.next, /^15\./);
  assert.equal(pkg.dependencies.next, pkg.devDependencies['eslint-config-next']);
  for (const version of Object.values({...pkg.dependencies,...pkg.devDependencies})) {
    assert.match(version, /^\d+\.\d+\.\d+$/);
  }
});

test('schema contains every application table, with RLS generation coverage', () => {
  const tables = [...schema.matchAll(/create table public\.(\w+)/g)].map((m) => m[1]);
  assert.equal(tables.length, 29);
  assert.equal(new Set(tables).size, 29);
  for (const table of tables) {
    assert.match(rls, new RegExp(`'${table}'`), `RLS list must include ${table}`);
  }
  assert.match(rls, /alter table public\.%I enable row level security/i);
  assert.match(rls, /revoke all on table public\.%I/i);
  assert.match(rls, /admin_all/);
});

test('server-only booking/payment mutations and protected profile columns', () => {
  assert.doesNotMatch(rls,/grant (?:insert|update|delete)[^;]*on public\.(?:bookings|payments|slot_holds) to authenticated/);
  assert.match(rls,/grant update\(name,avatar_url,city_id\) on public\.profiles/);
  assert.match(rls,/pro_id=\(select auth\.uid\(\)\) and status in \('pro_assigned','en_route','in_progress'\)/);
  assert.match(rls,/bucket_id='pro-documents'/);
});

test('seed includes five cities, eleven categories, 46 unique services, 3 coupons', () => {
  assert.equal([...seed.matchAll(/insert into public\.cities\(name,slug\)/g)].length,5);
  assert.equal([...seed.matchAll(/insert into public\.categories\(slug,name,icon,colour,sort_order\)/g)].length,11);
  const services = [...seed.matchAll(/select s\.id,'([\w-]+)'/g)].map((m)=>m[1]);
  assert.equal(services.length,46);
  assert.equal(new Set(services).size,46);
  assert.equal([...seed.matchAll(/insert into public\.coupons\(code,type,value/g)].length,3);
});

test('README and .env.example document setup without hardcoded secrets',()=>{
  assert.ok(existsSync(new URL('../.env.example',import.meta.url)));
  assert.match(read('.env.example'),/SUPABASE_SERVICE_ROLE_KEY=/);
  assert.match(read('README.md'),/supabase db reset/);
  assert.match(read('middleware.ts'),/profile\?\.role !== expectedRole/);
});
