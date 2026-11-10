import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Glyph } from '../components/Icon';
import { Art, Qty, Skeleton } from '../components/ui';
import { useUi } from '../components/Layout';
import { useAuth, useCart, useCatalog } from '../state';
import { BANNERS } from '../lib/content';
import { fmtCount, fmtDuration, rs } from '../lib/format';
import type { Service } from '../lib/types';

export function ServiceCard({ s }: { s: Service }) {
  const { openService } = useUi();
  return (
    <article className="scard">
      <div className="aw">
        <button style={{ display: 'block', width: '100%' }} onClick={() => openService(s.id)} aria-label={s.name}><Art svc={s} /></button>
        <div className="addpos"><Qty id={s.id} /></div>
      </div>
      <button className="meta" onClick={() => openService(s.id)}>
        <b>{s.name}</b>
        <span className="rate"><span className="st">★ {s.rating}</span><span className="muted">({fmtCount(s.review_count)})</span></span>
        <span><span className="price">{s.price ? rs(s.price) : 'Free'}</span>{s.mrp > s.price && <span className="mrp">{rs(s.mrp)}</span>}</span>
      </button>
    </article>
  );
}

export default function Home() {
  const { loading, error, categories, services, cities, cat, reload } = useCatalog();
  const { profile } = useAuth();
  const { cityId } = useCart();
  const { openService } = useUi();
  const [q, setQ] = useState('');
  const city = cities.find((c) => c.id === cityId)?.name || 'your city';
  const hr = Number(new Intl.DateTimeFormat('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()));
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return null;
    const words = t.split(/\s+/);
    const hit = (s: string) => words.every((w) => s.toLowerCase().includes(w));
    return {
      cats: categories.filter((c) => hit(c.name)),
      svcs: services.filter((s) => hit(`${s.name} ${s.sub} ${cat(s.category_id)?.name}`)).slice(0, 8),
    };
  }, [q, categories, services, cat]);

  const bestsellers = services.filter((s) => s.is_bestseller).slice(0, 10);
  const cleaning = services.filter((s) => s.category_id === 'clean');
  const salon = services.filter((s) => s.category_id === 'salon' || s.category_id === 'mens');

  if (error) return (
    <div className="empty"><span className="ring"><Icon name="alert" /></span><h2>Services didn't load</h2><p className="muted">{error}</p><button className="btn" onClick={reload}>Try again</button></div>
  );

  return (
    <>
      <section className="greet">
        <p className="muted b sm">{greet}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</p>
        <h1>Home services in {city}, at your door</h1>
      </section>
      <div className="search">
        <Icon name="search" />
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search “AC service”, “facial”, “plumber”" autoComplete="off" aria-label="Search services" />
        {results && (
          <div className="sres">
            {results.cats.length > 0 && <><div className="hd">Categories</div><div className="pills">{results.cats.map((c) => <Link key={c.id} className="chip" to={`/c/${c.id}`}>{c.name}</Link>)}</div></>}
            {results.svcs.length > 0 && <><div className="hd">Services</div>{results.svcs.map((s) => (
              <button key={s.id} className="sitem" onClick={() => { openService(s.id); setQ(''); }}>
                <Art svc={s} /><div><b>{s.name}</b><span className="muted sm">{cat(s.category_id)?.name} · {fmtDuration(s.duration_min)}</span></div>
                <span className="price sm">{s.price ? rs(s.price) : 'Free'}</span>
              </button>))}</>}
            {!results.cats.length && !results.svcs.length && <>
              <div className="hd">No match for “{q}”</div>
              <div className="pills">{['AC', 'Cleaning', 'Facial', 'Plumber', 'Pest'].map((t) => <button key={t} className="chip" onClick={() => setQ(t)}>{t}</button>)}</div>
            </>}
          </div>
        )}
      </div>

      <div className="hscroll">{BANNERS.map((b) => (
        <Link key={b.code} className="promo" style={{ background: b.bg }} to={`/c/${b.cat}`}>
          <h3>{b.title}</h3><p>{b.text}</p><span className="code">USE {b.code}</span>
          <svg className="big" viewBox="0 0 24 24" aria-hidden="true"><Glyph name={b.cat} /></svg>
        </Link>))}
      </div>

      <section className="sec"><div className="sech"><h2>All services</h2></div>
        <div className="cgrid">{loading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ display: 'grid', gap: 8, justifyItems: 'center' }}><Skeleton h={80} w="100%" r={16} /><Skeleton h={12} w="70%" /></div>)
          : categories.map((c) => (
            <Link key={c.id} to={`/c/${c.id}`} className="ctile" style={{ ['--h' as string]: c.hue }}><span className="box"><Glyph name={c.icon} /></span><b>{c.name}</b></Link>))}
        </div>
      </section>

      {loading ? (
        <section className="sec"><Skeleton h={22} w={200} /><div className="hscroll">{[1, 2, 3, 4].map((i) => <div key={i} className="scard"><Skeleton h={130} r={14} /></div>)}</div></section>
      ) : (<>
        <section className="sec"><div className="sech"><h2>Most booked</h2></div><div className="hscroll">{bestsellers.map((s) => <ServiceCard key={s.id} s={s} />)}</div></section>
        <section className="sec"><div className="sech"><h2>Cleaning essentials</h2><Link className="link" to="/c/clean">See all</Link></div><div className="hscroll">{cleaning.map((s) => <ServiceCard key={s.id} s={s} />)}</div></section>
        <section className="sec"><div className="sech"><h2>Why {city} books with Nestfix</h2></div><div className="trust">
          <div className="tcard"><span className="ib"><Icon name="shield" /></span><div><b>Verified professionals</b><span className="muted sm">Background-checked and trained before their first job.</span></div></div>
          <div className="tcard"><span className="ib"><Icon name="tag" /></span><div><b>Fixed, upfront prices</b><span className="muted sm">See the price before you book. No haggling at the door.</span></div></div>
          <div className="tcard"><span className="ib"><Icon name="reset" /></span><div><b>30-day redo cover</b><span className="muted sm">Problem comes back? We fix it again for free.</span></div></div>
        </div></section>
        <section className="sec"><div className="sech"><h2>Salon & grooming at home</h2><Link className="link" to="/c/salon">See all</Link></div><div className="hscroll">{salon.map((s) => <ServiceCard key={s.id} s={s} />)}</div></section>
      </>)}
    </>
  );
}
