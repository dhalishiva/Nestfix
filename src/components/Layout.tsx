import { createContext, useContext, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { Art, Qty, Sheet } from './ui';
import { useAuth, useCart, useCatalog, useToast } from '../state';
import { fmtCount, fmtDuration, rs } from '../lib/format';
import { FAQS } from '../lib/content';

type Ui = { openService: (id: string) => void; openLocation: () => void };
const UiCtx = createContext<Ui>({ openService: () => {}, openLocation: () => {} });
export const useUi = () => useContext(UiCtx);

export function Layout() {
  const [svcId, setSvcId] = useState<string | null>(null);
  const [locOpen, setLocOpen] = useState(false);
  const loc = useLocation();
  const { count, quote } = useCart();
  const showBar = count > 0 && (loc.pathname === '/' || loc.pathname.startsWith('/c/'));

  return (
    <UiCtx.Provider value={{ openService: setSvcId, openLocation: () => setLocOpen(true) }}>
      <Header />
      <main className="wrap"><Outlet /></main>
      <footer className="site wrap">Nestfix · Payments are simulated in this version. No real money is charged.</footer>
      {showBar && quote && (
        <div className="cbar"><div className="cbar-in">
          <div><b className="num">{rs(quote.item_total)}</b> · {quote.count} item{quote.count > 1 ? 's' : ''}
            <div className="sv">{quote.mrp_total - quote.item_total > 0 ? `Saving ${rs(quote.mrp_total - quote.item_total)}` : `Free visit on orders over ${rs(quote.free_visit_at)}`}</div></div>
          <Link to="/cart">View cart<Icon name="right" /></Link>
        </div></div>
      )}
      <BottomNav />
      {svcId && <ServiceSheet id={svcId} onClose={() => setSvcId(null)} />}
      {locOpen && <LocationSheet onClose={() => setLocOpen(false)} />}
    </UiCtx.Provider>
  );
}

function Header() {
  const { addresses, profile } = useAuth();
  const { cityId, addressId, count } = useCart();
  const { cities } = useCatalog();
  const { openLocation } = useUi();
  const addr = addresses.find((a) => a.id === addressId);
  const city = cities.find((c) => c.id === cityId)?.name || 'Select city';
  return (
    <header className="top"><div className="wrap hbar">
      <Link to="/" className="logo" aria-label="Nestfix home"><i>N</i><span className="logo-t">Nestfix</span></Link>
      <button className="loc" onClick={openLocation}>
        <Icon name="pin" />
        <div><b>{addr ? addr.label : city}<Icon name="down" /></b><span>{addr ? `${addr.house}, ${addr.area}` : 'Change city or address'}</span></div>
      </button>
      <span className="sp" />
      <nav className="dnav" aria-label="Main">
        {profile?.role === 'admin' && <NavLink to="/admin"><Icon name="grid" />Admin</NavLink>}
        <NavLink to="/bookings"><Icon name="cal" />Bookings</NavLink>
        <NavLink to="/cart"><Icon name="bag" />Cart{count > 0 && <span className="badge">{count}</span>}</NavLink>
        <NavLink to="/account"><Icon name="user" />{profile ? profile.full_name.split(' ')[0] || 'Account' : 'Log in'}</NavLink>
      </nav>
    </div></header>
  );
}

function BottomNav() {
  const { count } = useCart();
  const loc = useLocation();
  const homeActive = loc.pathname === '/' || loc.pathname.startsWith('/c/');
  return (
    <nav className="bnav" aria-label="Main">
      <NavLink to="/" className={homeActive ? 'active' : ''} end><Icon name="home" />Home</NavLink>
      <NavLink to="/bookings"><Icon name="cal" />Bookings</NavLink>
      <NavLink to="/cart"><Icon name="bag" />Cart{count > 0 && <span className="badge">{count}</span>}</NavLink>
      <NavLink to="/account"><Icon name="user" />Account</NavLink>
    </nav>
  );
}

function ServiceSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const { svc, cat } = useCatalog();
  const { items } = useCart();
  const nav = useNavigate();
  const s = svc(id);
  if (!s) return null;
  const c = cat(s.category_id);
  const off = s.mrp > s.price ? Math.round((1 - s.price / s.mrp) * 100) : 0;
  return (
    <Sheet title={c?.name || 'Service'} label={s.name} onClose={onClose} footer={<>
      <div style={{ flex: 1 }}><span className="price">{s.price ? rs(s.price) : 'Free'}</span>{items[s.id] ? <div className="muted xs">{items[s.id]} in cart</div> : null}</div>
      <Qty id={s.id} />
      {items[s.id] ? <button className="btn" onClick={() => { onClose(); nav('/cart'); }}>Go to cart</button> : null}
    </>}>
      <Art svc={s} className="hero-art" />
      <div style={{ display: 'grid', gap: 4 }}>
        <h2 style={{ fontSize: 22 }}>{s.name}</h2>
        <span className="rate"><span className="st">★ {s.rating}</span><span className="muted">({fmtCount(s.review_count)} ratings) · {fmtDuration(s.duration_min)}</span></span>
        <div><span className="price" style={{ fontSize: 18 }}>{s.price ? rs(s.price) : 'Free'}</span>{s.mrp > s.price && <span className="mrp">{rs(s.mrp)}</span>}{off > 0 && <span className="tag" style={{ marginLeft: 8 }}>{off}% off</span>}</div>
        {s.description && <p className="muted" style={{ marginTop: 4 }}>{s.description}</p>}
      </div>
      <div className="panel"><h4>What's included</h4>
        <ul className="ilist yes">{s.includes.map((p) => <li key={p}><Icon name="check" />{p}</li>)}<li><Icon name="check" />30-day redo cover</li></ul>
        {s.excludes.length > 0 && <><h4>Not included</h4><ul className="ilist no">{s.excludes.map((p) => <li key={p}><Icon name="x" />{p}</li>)}</ul></>}
      </div>
      <div className="panel"><h4>How it works</h4><div className="how">
        <div>The professional checks the job and confirms the scope with you.</div>
        <div>Work starts only after you share your 4-digit start PIN.</div>
        <div>You check the result. Pay only for what's in the booking.</div>
      </div></div>
      <div>{FAQS.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
    </Sheet>
  );
}

function LocationSheet({ onClose }: { onClose: () => void }) {
  const { cities } = useCatalog();
  const { session, addresses } = useAuth();
  const { cityId, setCityId, addressId, setAddressId } = useCart();
  const toast = useToast();
  const nav = useNavigate();
  return (
    <Sheet title="Your location" onClose={onClose} footer={
      <button className="btn out w" onClick={() => { onClose(); nav(session ? '/account/addresses?new=1' : '/login?next=/account/addresses'); }}><Icon name="plus" />Add a new address</button>}>
      {addresses.length > 0 && <>
        <span className="slab">Saved addresses</span>
        {addresses.map((a) => (
          <button key={a.id} className={`opt ${a.id === addressId ? 'on' : ''}`} onClick={() => { setAddressId(a.id); setCityId(a.city_id); onClose(); toast(`Showing services for ${a.label}`); }}>
            <span className="radio" /><div><b>{a.label}</b><span className="muted sm">{a.house}, {a.area}, {cities.find((c) => c.id === a.city_id)?.name}</span></div>
          </button>))}
      </>}
      <span className="slab">City</span>
      <div className="pills">{cities.map((c) => (
        <button key={c.id} className={`chip ${c.id === cityId ? 'on' : ''}`} onClick={() => {
          setCityId(c.id);
          const a = addresses.find((x) => x.id === addressId);
          if (a && a.city_id !== c.id) setAddressId(null);
          onClose(); toast(`Showing services in ${c.name}`);
        }}>{c.name}</button>))}</div>
    </Sheet>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, session } = useAuth();
  const loc = useLocation();
  if (!ready) return null;
  if (!session) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return (
      <div className="empty"><span className="ring"><Icon name="lock" /></span><h2>Log in to continue</h2>
        <p className="muted">Track bookings, save addresses and check out faster.</p>
        <div className="acts" style={{ width: '100%', maxWidth: 360 }}>
          <Link className="btn" to={`/login?next=${next}`}>Log in</Link><Link className="btn out" to={`/signup?next=${next}`}>Create account</Link>
        </div></div>
    );
  }
  return <>{children}</>;
}
