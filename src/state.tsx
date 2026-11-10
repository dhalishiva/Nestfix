import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import type { Address, Category, City, Profile, Quote, Service } from './lib/types';
import { Icon } from './components/Icon';

const store = {
  get<T>(k: string, d: T): T { try { const v = localStorage.getItem('nf_' + k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } },
  set(k: string, v: unknown) { try { localStorage.setItem('nf_' + k, JSON.stringify(v)); } catch { /* storage blocked */ } },
};

/* ---------------- toast ---------------- */
type ToastFn = (msg: string, kind?: 'ok' | 'err') => void;
const ToastCtx = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastCtx);
function ToastProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<{ msg: string; kind: 'ok' | 'err'; id: number } | null>(null);
  const timer = useRef<number>();
  const show = useCallback<ToastFn>((msg, kind = 'ok') => {
    setT({ msg, kind, id: Date.now() });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setT(null), kind === 'err' ? 4200 : 2400);
  }, []);
  const sheetOpen = typeof document !== 'undefined' && !!document.querySelector('.scrim');
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className={`toast ${t ? 'show' : ''} ${t?.kind === 'err' ? 'err' : ''} ${sheetOpen ? 'top' : ''}`} role="status" aria-live="polite">
        {t && <Icon name={t.kind === 'err' ? 'alert' : 'check'} />}{t?.msg}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------- theme ---------------- */
export type Theme = 'system' | 'light' | 'dark';
export function applyTheme(t: Theme) {
  if (t === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  store.set('theme', t);
}
export const savedTheme = () => store.get<Theme>('theme', 'system');

/* ---------------- auth ---------------- */
type AuthState = {
  ready: boolean; session: Session | null; profile: Profile | null; email: string;
  addresses: Address[]; reloadAddresses: () => Promise<void>; reloadProfile: () => Promise<void>; signOut: () => Promise<void>;
};
const AuthCtx = createContext<AuthState>(null as unknown as AuthState);
export const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const uid = session?.user.id;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  const reloadProfile = useCallback(async () => {
    if (!uid) { setProfile(null); return; }
    const { data } = await supabase.from('profiles').select('id,full_name,phone,role').eq('id', uid).maybeSingle();
    setProfile((data as Profile) || null);
  }, [uid]);
  const reloadAddresses = useCallback(async () => {
    if (!uid) { setAddresses([]); return; }
    const { data } = await supabase.from('addresses').select('*').order('created_at');
    setAddresses((data as Address[]) || []);
  }, [uid]);
  useEffect(() => { reloadProfile(); reloadAddresses(); }, [reloadProfile, reloadAddresses]);

  const signOut = useCallback(async () => { await supabase.auth.signOut(); setProfile(null); setAddresses([]); }, []);
  const value = useMemo(() => ({ ready, session, profile, email: session?.user.email || '', addresses, reloadAddresses, reloadProfile, signOut }),
    [ready, session, profile, addresses, reloadAddresses, reloadProfile, signOut]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/* ---------------- catalog ---------------- */
type CatalogState = {
  loading: boolean; error: string | null; cities: City[]; categories: Category[]; services: Service[];
  cat: (id: string) => Category | undefined; svc: (id: string) => Service | undefined; reload: () => void;
};
const CatalogCtx = createContext<CatalogState>(null as unknown as CatalogState);
export const useCatalog = () => useContext(CatalogCtx);

function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ loading: boolean; error: string | null; cities: City[]; categories: Category[]; services: Service[] }>(
    { loading: true, error: null, cities: [], categories: [], services: [] });
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const [c, k, s] = await Promise.all([
      supabase.from('cities').select('id,name').eq('is_active', true).order('sort'),
      supabase.from('categories').select('*').eq('is_active', true).order('sort'),
      supabase.from('services').select('*').eq('is_active', true).order('sort'),
    ]);
    const err = c.error || k.error || s.error;
    if (err) { setState((x) => ({ ...x, loading: false, error: 'We could not load services. Check your connection and try again.' })); return; }
    setState({ loading: false, error: null, cities: c.data as City[], categories: k.data as Category[], services: s.data as Service[] });
  }, []);
  useEffect(() => { load(); }, [load]);
  const value = useMemo(() => {
    const cm = new Map(state.categories.map((x) => [x.id, x]));
    const sm = new Map(state.services.map((x) => [x.id, x]));
    return { ...state, cat: (id: string) => cm.get(id), svc: (id: string) => sm.get(id), reload: load };
  }, [state, load]);
  return <CatalogCtx.Provider value={value}>{children}</CatalogCtx.Provider>;
}

/* ---------------- cart & checkout ---------------- */
type Slot = { date: string; time: string } | null;
type CartState = {
  items: Record<string, number>; count: number; setQty: (id: string, qty: number) => void; add: (id: string, delta: number) => void; clear: () => void;
  coupon: string | null; setCoupon: (c: string | null) => void;
  cityId: string; setCityId: (c: string) => void;
  addressId: string | null; setAddressId: (id: string | null) => void;
  slot: Slot; setSlot: (s: Slot) => void;
  payment: 'upi' | 'card' | 'cash'; setPayment: (p: 'upi' | 'card' | 'cash') => void;
  quote: Quote | null; quoting: boolean; refreshQuote: () => void;
  itemsJson: { id: string; qty: number }[];
};
const CartCtx = createContext<CartState>(null as unknown as CartState);
export const useCart = () => useContext(CartCtx);

function CartProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [items, setItems] = useState<Record<string, number>>(() => store.get('cart', {}));
  const [coupon, setCouponS] = useState<string | null>(() => store.get('coupon', null));
  const [cityId, setCityIdS] = useState<string>(() => store.get('city', 'noida'));
  const [addressId, setAddressIdS] = useState<string | null>(() => store.get('address', null));
  const [slot, setSlot] = useState<Slot>(null);
  const [payment, setPayment] = useState<'upi' | 'card' | 'cash'>('upi');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => store.set('cart', items), [items]);
  useEffect(() => store.set('coupon', coupon), [coupon]);
  useEffect(() => store.set('city', cityId), [cityId]);
  useEffect(() => store.set('address', addressId), [addressId]);

  const itemsJson = useMemo(() => Object.entries(items).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, qty })), [items]);
  const count = itemsJson.reduce((a, b) => a + b.qty, 0);

  // Prices always come from the server so the cart matches what the booking will charge.
  useEffect(() => {
    let live = true;
    setQuoting(true);
    const t = window.setTimeout(async () => {
      const { data, error } = await supabase.rpc('price_cart', { p_items: itemsJson, p_coupon: coupon });
      if (!live) return;
      setQuoting(false);
      if (error) return;
      const q = data as Quote;
      setQuote(q);
      // Drop item ids the server no longer sells (service removed or hidden).
      const valid = new Set(q.lines.map((l) => l.id));
      if (itemsJson.some((i) => !valid.has(i.id))) setItems((cur) => Object.fromEntries(Object.entries(cur).filter(([id]) => valid.has(id))));
    }, 180);
    return () => { live = false; window.clearTimeout(t); };
  }, [itemsJson, coupon, session?.user.id, tick]);

  // The chosen slot depends on the cart; any cart change means picking again.
  const cartKey = itemsJson.map((i) => i.id + i.qty).join();
  const prevKey = useRef(cartKey);
  useEffect(() => { if (prevKey.current !== cartKey) { setSlot(null); prevKey.current = cartKey; } }, [cartKey]);

  const value = useMemo<CartState>(() => ({
    items, count, itemsJson,
    setQty: (id, qty) => setItems((c) => { const n = { ...c }; if (qty <= 0) delete n[id]; else n[id] = Math.min(20, qty); return n; }),
    add: (id, d) => setItems((c) => { const n = { ...c }; const q = Math.min(20, (n[id] || 0) + d); if (q <= 0) delete n[id]; else n[id] = q; return n; }),
    clear: () => { setItems({}); setCouponS(null); setSlot(null); },
    coupon, setCoupon: setCouponS, cityId, setCityId: setCityIdS, addressId, setAddressId: setAddressIdS,
    slot, setSlot, payment, setPayment, quote, quoting, refreshQuote: () => setTick((x) => x + 1),
  }), [items, count, itemsJson, coupon, cityId, addressId, slot, payment, quote, quoting]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CatalogProvider>
          <CartProvider>{children}</CartProvider>
        </CatalogProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
