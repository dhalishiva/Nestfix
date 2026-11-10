import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon, Glyph } from '../components/Icon';
import { Art, Qty, Skeleton } from '../components/ui';
import { useUi } from '../components/Layout';
import { useCart, useCatalog } from '../state';
import { fmtCount, fmtDuration, rs } from '../lib/format';

export default function Category() {
  const { id = '' } = useParams();
  const { loading, cat, services, cities } = useCatalog();
  const { cityId, quote } = useCart();
  const { openService } = useUi();
  const c = cat(id);
  const list = useMemo(() => services.filter((s) => s.category_id === id), [services, id]);
  const subs = useMemo(() => [...new Set(list.map((s) => s.sub))], [list]);
  const [active, setActive] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);
  useEffect(() => {
    const onScroll = () => {
      const secs = Array.from(document.querySelectorAll<HTMLElement>('.subsec'));
      let cur = 0;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top < 170) cur = i; });
      setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [subs.length]);
  useEffect(() => { barRef.current?.children[active]?.scrollIntoView({ inline: 'center', block: 'nearest' }); }, [active]);

  if (loading) return <div className="stack"><Skeleton h={110} r={20} /><Skeleton h={40} w="60%" /><Skeleton h={140} /><Skeleton h={140} /></div>;
  if (!c) return <div className="empty"><span className="ring"><Icon name="search" /></span><h2>Category not found</h2><Link className="btn" to="/">Browse all services</Link></div>;

  const inCart = quote?.lines.filter((l) => l.category_id === id) || [];
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <>
      <Link to="/" className="back"><Icon name="back" />Home</Link>
      <div className="band" style={{ ['--h' as string]: c.hue }}>
        <span className="box"><Glyph name={c.icon} /></span>
        <div><h1>{c.name}</h1>
          <span className="muted sm">{c.tagline} · {list.length} services in {cities.find((x) => x.id === cityId)?.name}</span>
          <div className="feats"><span><Icon name="check" />Verified pros</span><span><Icon name="check" />30-day cover</span><span><Icon name="check" />Pay after service available</span></div>
        </div>
      </div>
      <div className="chipbar" ref={barRef}>{subs.map((s, i) => (
        <button key={s} className={`chip ${i === active ? 'on' : ''}`} onClick={() => {
          const t = document.getElementById(`sub-${i}`);
          if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 130, behavior: reduce ? 'auto' : 'smooth' });
        }}>{s}</button>))}
      </div>
      <div className="clayout">
        <div>{subs.map((sub, i) => (
          <section key={sub} className="subsec" id={`sub-${i}`}><h2>{sub}</h2>
            {list.filter((s) => s.sub === sub).map((s) => (
              <article key={s.id} className="srow">
                <div>
                  {s.is_bestseller && <span className="tag"><Icon name="spark" />Bestseller</span>}
                  <h3><button onClick={() => openService(s.id)}>{s.name}</button></h3>
                  <span className="rate"><span className="st">★ {s.rating}</span><span className="muted">({fmtCount(s.review_count)} ratings)</span></span>
                  <div style={{ marginTop: 3 }}><span className="price">{s.price ? rs(s.price) : 'Free'}</span>{s.mrp > s.price && <span className="mrp">{rs(s.mrp)}</span>}<span className="muted sm"> · {fmtDuration(s.duration_min)}</span></div>
                  <ul>{s.includes.slice(0, 2).map((p) => <li key={p}>{p}</li>)}</ul>
                  <button className="link sm" onClick={() => openService(s.id)}>View details</button>
                </div>
                <div className="thumbcol"><Art svc={s} /><div className="ctl"><Qty id={s.id} /></div></div>
              </article>))}
          </section>))}
        </div>
        <aside className="cside">
          <div className="panel"><h3>Your cart</h3>
            {quote && quote.count > 0 ? (<>
              {inCart.length === 0 && <p className="muted sm">Items from other categories are in your cart.</p>}
              {inCart.map((l) => (
                <div key={l.id} className="citem"><Art catId={l.category_id} /><div><b>{l.name}</b><span className="price sm">{rs(l.price * l.qty)}</span></div><Qty id={l.id} /></div>))}
              <Link className="btn w" to="/cart">View cart · {rs(quote.item_total)}</Link>
            </>) : <p className="muted sm">No services added yet. Tap Add on any service.</p>}
          </div>
          <div className="panel"><Icon name="shield" /><b>Nestfix Promise</b><p className="muted sm">Verified professionals, upfront prices and a free redo within 30 days.</p></div>
        </aside>
      </div>
    </>
  );
}
