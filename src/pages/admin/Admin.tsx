import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { Empty, Sheet, Skeleton, Spinner, Switch } from '../../components/ui';
import { useAuth, useCatalog, useToast } from '../../state';
import { supabase, errMsg } from '../../lib/supabase';
import { BOOKING_SELECT, type Booking, type Coupon, type Service } from '../../lib/types';
import { PAY_LABEL, STATUS_LABEL, fmtDate, fmtStamp, fmtTime, istToday, rs } from '../../lib/format';

export function AdminLayout() {
  const { ready, session, profile } = useAuth();
  if (!ready || (session && !profile)) return <div className="empty"><div className="spin-lg" /></div>;
  if (!session || profile?.role !== 'admin') return (
    <Empty icon="lock" title="Admins only"><p className="muted">This area is for the Nestfix operations team.</p><Link className="btn" to="/">Go home</Link></Empty>
  );
  return (
    <>
      <div className="phead"><h1>Admin</h1></div>
      <nav className="atabs" aria-label="Admin sections">
        <NavLink to="/admin" end>Overview</NavLink><NavLink to="/admin/bookings">Bookings</NavLink>
        <NavLink to="/admin/pros">Professionals</NavLink><NavLink to="/admin/services">Services</NavLink><NavLink to="/admin/offers">Offers</NavLink>
      </nav>
      <Outlet />
    </>
  );
}

function useAllBookings() {
  const [list, setList] = useState<Booking[] | null>(null);
  const load = useCallback(async () => {
    const { data } = await supabase.from('bookings').select(BOOKING_SELECT).order('scheduled_date', { ascending: false }).order('slot_time', { ascending: false }).limit(500);
    setList((data as unknown as Booking[]) || []);
  }, []);
  useEffect(() => {
    load();
    const ch = supabase.channel('admin-bookings').on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);
  return { list, load };
}

export function AdminOverview() {
  const { list } = useAllBookings();
  const today = istToday();
  const stats = useMemo(() => {
    const l = list || [];
    const live = l.filter((b) => b.status !== 'cancelled');
    return {
      today: l.filter((b) => b.scheduled_date === today && b.status !== 'cancelled').length,
      upcoming: l.filter((b) => ['confirmed', 'pro_assigned', 'en_route', 'in_progress'].includes(b.status)).length,
      completed: l.filter((b) => b.status === 'completed').length,
      cancelled: l.filter((b) => b.status === 'cancelled').length,
      gmv: live.reduce((a, b) => a + b.total, 0),
      rating: (() => { const r = l.filter((b) => b.rating); return r.length ? (r.reduce((a, b) => a + (b.rating || 0), 0) / r.length).toFixed(1) : '–'; })(),
    };
  }, [list, today]);
  if (!list) return <div className="kpis">{[1, 2, 3, 4].map((i) => <Skeleton key={i} h={80} />)}</div>;
  const next = list.filter((b) => ['confirmed', 'pro_assigned', 'en_route', 'in_progress'].includes(b.status)).sort((a, b) => (a.scheduled_date + a.slot_time).localeCompare(b.scheduled_date + b.slot_time)).slice(0, 6);
  return (
    <div className="stack">
      <div className="kpis">
        <div className="kpi"><span className="muted sm">Jobs today</span><b>{stats.today}</b></div>
        <div className="kpi"><span className="muted sm">Open bookings</span><b>{stats.upcoming}</b></div>
        <div className="kpi"><span className="muted sm">Completed</span><b>{stats.completed}</b></div>
        <div className="kpi"><span className="muted sm">Cancelled</span><b>{stats.cancelled}</b></div>
        <div className="kpi"><span className="muted sm">Booked value</span><b>{rs(stats.gmv)}</b></div>
        <div className="kpi"><span className="muted sm">Avg rating</span><b>{stats.rating}</b></div>
      </div>
      <div className="panel"><div className="row"><h3 style={{ flex: 1 }}>Next jobs</h3><Link className="link sm" to="/admin/bookings">All bookings</Link></div>
        {next.length === 0 ? <p className="muted sm">No open bookings right now.</p> : next.map((b) => (
          <div key={b.id} className="line"><span><b>{fmtDate(b.scheduled_date)} {fmtTime(b.slot_time)}</b> · {b.booking_items.map((i) => i.name).join(', ')}</span><span className="muted sm">{STATUS_LABEL[b.status]}</span></div>))}
      </div>
    </div>
  );
}

const STATUS_FILTERS = [['open', 'Open'], ['all', 'All'], ['completed', 'Completed'], ['cancelled', 'Cancelled']] as const;

export function AdminBookings() {
  const { list, load } = useAllBookings();
  const { cities } = useCatalog();
  const [filter, setFilter] = useState<string>('open');
  const [city, setCity] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Booking | null>(null);
  const shown = (list || []).filter((b) =>
    (filter === 'all' || (filter === 'open' ? ['confirmed', 'pro_assigned', 'en_route', 'in_progress'].includes(b.status) : b.status === filter)) &&
    (city === 'all' || b.city_id === city) &&
    (!q.trim() || `${b.code} ${b.customer_name} ${b.customer_email}`.toLowerCase().includes(q.trim().toLowerCase())));
  useEffect(() => { if (open && list) setOpen(list.find((b) => b.id === open.id) || null); }, [list]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="filters">
        <div className="seg">{STATUS_FILTERS.map(([k, l]) => <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>)}</div>
        <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City"><option value="all">All cities</option>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search code, name or email" aria-label="Search bookings" style={{ minWidth: 220 }} />
      </div>
      {!list ? <Skeleton h={200} /> : shown.length === 0 ? <Empty icon="cal" title="No bookings match"><p className="muted">Change the filters to see more.</p></Empty> : (
        <div className="tablewrap"><table>
          <thead><tr><th>When</th><th>Code</th><th>Customer</th><th>Services</th><th>Professional</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>{shown.map((b) => (
            <tr key={b.id} className="click" onClick={() => setOpen(b)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(b)}>
              <td className="num" style={{ whiteSpace: 'nowrap' }}>{fmtDate(b.scheduled_date)}<div className="muted xs">{fmtTime(b.slot_time)}</div></td>
              <td className="num">{b.code}</td>
              <td>{b.customer_name}<div className="muted xs">{b.address.city}</div></td>
              <td style={{ minWidth: 180 }}>{b.booking_items.map((i) => i.name + (i.qty > 1 ? ` ×${i.qty}` : '')).join(', ')}</td>
              <td>{b.pro?.name || <span className="muted">Unassigned</span>}</td>
              <td className="num">{rs(b.total)}<div className="muted xs">{PAY_LABEL[b.payment_method]}</div></td>
              <td><span className={`pill ${b.status === 'completed' ? 'done' : b.status === 'cancelled' ? 'can' : ['en_route', 'in_progress'].includes(b.status) ? 'go' : 'up'}`}>{STATUS_LABEL[b.status]}</span></td>
            </tr>))}</tbody>
        </table></div>)}
      {open && <AdminBookingSheet b={open} onClose={() => setOpen(null)} onChange={load} />}
    </>
  );
}

function AdminBookingSheet({ b, onClose, onChange }: { b: Booking; onClose: () => void; onChange: () => void }) {
  const toast = useToast();
  const [pros, setPros] = useState<{ id: string; name: string; rating: number; jobs_done: number; is_free: boolean }[] | null>(null);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [events, setEvents] = useState<{ id: number; status: string; note: string | null; created_at: string }[]>([]);
  const canAssign = ['confirmed', 'pro_assigned'].includes(b.status);

  useEffect(() => {
    if (canAssign) supabase.rpc('admin_eligible_pros', { p_id: b.id }).then(({ data }) => setPros((data as typeof pros) || []));
    supabase.from('booking_events').select('id,status,note,created_at').eq('booking_id', b.id).order('id').then(({ data }) => setEvents(data || []));
  }, [b.id, b.status, b.pro_id, canAssign]);

  async function act(name: string, fn: () => PromiseLike<{ error: unknown }>, ok: string) {
    setBusy(name);
    const { error } = await fn();
    setBusy('');
    if (error) { toast(errMsg(error), 'err'); return; }
    toast(ok); setPin(''); setConfirmCancel(false); onChange();
  }
  const status = (s: string, ok: string, p?: string) => act(s, () => supabase.rpc('admin_update_status', { p_id: b.id, p_status: s, p_pin: p ?? null }), ok);

  return (
    <Sheet title={`Booking ${b.code}`} onClose={onClose}>
      <div className="when"><Icon name="cal" />{fmtDate(b.scheduled_date)} · {fmtTime(b.slot_time)} · {b.span_hours} hr{b.span_hours > 1 ? 's' : ''}<span className="sp" /><span className={`pill ${b.status === 'completed' ? 'done' : b.status === 'cancelled' ? 'can' : 'up'}`}>{STATUS_LABEL[b.status]}</span></div>
      <div className="panel">
        <div className="line"><span className="muted">Customer</span><span>{b.customer_name}<div className="muted xs">{b.customer_email}</div></span></div>
        <div className="line"><span className="muted">Address</span><span>{b.address.house}, {b.address.area}{b.address.landmark ? `, near ${b.address.landmark}` : ''}, {b.address.city} {b.address.pincode}</span></div>
        {b.booking_items.map((i) => <div key={i.service_id} className="line"><span>{i.name} × {i.qty}</span><span>{rs(i.unit_price * i.qty)}</span></div>)}
        {b.discount > 0 && <div className="line"><span>Coupon {b.coupon_code}</span><span>−{rs(b.discount)}</span></div>}
        <div className="line tot"><span>Total · {PAY_LABEL[b.payment_method]}</span><span>{rs(b.total)}</span></div>
        <span className="muted xs">Payment: {b.payment_status.replace('_', ' ')}{b.refund_amount ? ` · refund ${rs(b.refund_amount)}` : ''}</span>
      </div>

      {canAssign && (
        <div className="field">Professional
          {!pros ? <Spinner /> : pros.length === 0 ? <span className="err">No active professional in this city offers all these services.</span> : (
            <select value={b.pro_id || ''} onChange={(e) => e.target.value && act('assign', () => supabase.rpc('admin_assign_pro', { p_id: b.id, p_pro: e.target.value }), 'Professional assigned')} disabled={!!busy}>
              {!b.pro_id && <option value="">Choose a professional</option>}
              {pros.map((p) => <option key={p.id} value={p.id} disabled={!p.is_free && p.id !== b.pro_id}>{p.name} · ★ {p.rating}{p.is_free || p.id === b.pro_id ? '' : ' · busy'}</option>)}
            </select>)}
        </div>)}
      {!canAssign && b.pro && <div className="line"><span className="muted">Professional</span><span>{b.pro.name} · ★ {b.pro.rating}</span></div>}

      {b.status === 'pro_assigned' && <button className="btn w" disabled={!!busy} onClick={() => status('en_route', 'Marked on the way')}>{busy === 'en_route' && <Spinner />}Professional is on the way</button>}
      {['pro_assigned', 'en_route'].includes(b.status) && (
        <form className="row" onSubmit={(e) => { e.preventDefault(); status('in_progress', 'Work started', pin); }}>
          <input id="pin" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="Customer's start PIN" aria-label="Start PIN" />
          <button className="btn" disabled={pin.length !== 4 || !!busy} style={{ whiteSpace: 'nowrap' }}>{busy === 'in_progress' && <Spinner />}Start work</button>
        </form>)}
      {b.status === 'in_progress' && <button className="btn w" disabled={!!busy} onClick={() => status('completed', 'Marked completed')}>{busy === 'completed' && <Spinner />}Mark completed{b.payment_status === 'pending' ? ` (collect ${rs(b.total)})` : ''}</button>}
      {['confirmed', 'pro_assigned', 'en_route'].includes(b.status) && (confirmCancel ? (
        <div className="banner bad" style={{ flexWrap: 'wrap' }}><div>Cancel for the customer{b.payment_status === 'paid' ? ` and refund ${rs(b.total)} in full` : ''}?</div>
          <button className="btn out s" onClick={() => setConfirmCancel(false)}>No</button><button className="btn danger s" disabled={!!busy} onClick={() => status('cancelled', 'Booking cancelled')}>Yes, cancel</button></div>
      ) : <button className="btn out danger w" onClick={() => setConfirmCancel(true)}>Cancel booking</button>)}

      {b.rating && <div className="panel"><b>Customer rating: {'★'.repeat(b.rating)}</b>{b.review_tags?.length ? <span className="muted sm">{b.review_tags.join(', ')}</span> : null}{b.review_comment && <p>“{b.review_comment}”</p>}</div>}
      {events.length > 0 && <div className="panel"><h4>Activity</h4><div className="timeline">{events.map((e) => <div key={e.id} className="tl"><i /><div><b>{STATUS_LABEL[e.status] || e.status}</b><div className="muted sm">{e.note}</div><div className="muted xs">{fmtStamp(e.created_at)}</div></div></div>)}</div></div>}
    </Sheet>
  );
}

type Pro = { id: string; name: string; phone: string; city_id: string; skills: string[]; rating: number; jobs_done: number; is_active: boolean };

export function AdminPros() {
  const { cities, categories, cat } = useCatalog();
  const toast = useToast();
  const [list, setList] = useState<Pro[] | null>(null);
  const [city, setCity] = useState('noida');
  const [adding, setAdding] = useState(false);
  const load = useCallback(async () => { const { data } = await supabase.from('pros').select('*').order('name'); setList((data as Pro[]) || []); }, []);
  useEffect(() => { load(); }, [load]);
  async function toggle(p: Pro, v: boolean) {
    const { error } = await supabase.from('pros').update({ is_active: v }).eq('id', p.id);
    if (error) { toast(errMsg(error), 'err'); return; }
    toast(`${p.name} is now ${v ? 'active' : 'inactive'}`); load();
  }
  const shown = (list || []).filter((p) => p.city_id === city);
  return (
    <>
      <div className="filters">
        <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <span className="muted sm">{shown.filter((p) => p.is_active).length} active of {shown.length}</span><span className="sp" />
        <button className="btn s" onClick={() => setAdding(true)}><Icon name="plus" />Add professional</button>
      </div>
      {!list ? <Skeleton h={200} /> : (
        <div className="tablewrap"><table>
          <thead><tr><th>Name</th><th>Skills</th><th>Phone</th><th>Rating</th><th>Jobs</th><th>Active</th></tr></thead>
          <tbody>{shown.map((p) => (
            <tr key={p.id}><td><b>{p.name}</b></td><td>{p.skills.map((s) => cat(s)?.name || s).join(', ')}</td><td className="num">+91 {p.phone}</td>
              <td className="num">★ {p.rating}</td><td className="num">{p.jobs_done}</td><td><Switch on={p.is_active} onChange={(v) => toggle(p, v)} label={`${p.name} active`} /></td></tr>))}</tbody>
        </table></div>)}
      {adding && <AddPro cityId={city} categories={categories} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); load(); toast('Professional added'); }} />}
    </>
  );
}

function AddPro({ cityId, categories, onClose, onSaved }: { cityId: string; categories: { id: string; name: string }[]; onClose: () => void; onSaved: () => void }) {
  const { cities } = useCatalog();
  const [f, setF] = useState({ name: '', phone: '', city_id: cityId, skills: [] as string[] });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function save() {
    if (f.name.trim().length < 2) { setErr('Enter the professional\'s name.'); return; }
    if (!/^[6-9][0-9]{9}$/.test(f.phone)) { setErr('Enter a 10-digit mobile number.'); return; }
    if (!f.skills.length) { setErr('Pick at least one service category.'); return; }
    setBusy(true);
    const { error } = await supabase.from('pros').insert({ name: f.name.trim(), phone: f.phone, city_id: f.city_id, skills: f.skills, rating: 5, ratings_count: 0, jobs_done: 0 });
    setBusy(false);
    if (error) { setErr(errMsg(error)); return; }
    onSaved();
  }
  return (
    <Sheet title="Add professional" onClose={onClose} footer={<button className="btn w" onClick={save} disabled={busy}>{busy && <Spinner />}Add professional</button>}>
      <label className="field">Full name<input id="pro_name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
      <div className="row2">
        <label className="field">Mobile<input id="pro_phone" inputMode="numeric" maxLength={10} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '') })} /></label>
        <label className="field">City<select value={f.city_id} onChange={(e) => setF({ ...f, city_id: e.target.value })}>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      </div>
      <div className="field">Services they do<div className="pills">{categories.map((c) => (
        <button key={c.id} type="button" className={`chip ${f.skills.includes(c.id) ? 'on' : ''}`} onClick={() => setF({ ...f, skills: f.skills.includes(c.id) ? f.skills.filter((x) => x !== c.id) : [...f.skills, c.id] })}>{c.name}</button>))}</div></div>
      {err && <span className="err">{err}</span>}
    </Sheet>
  );
}

export function AdminServices() {
  const { categories, reload } = useCatalog();
  const toast = useToast();
  const [list, setList] = useState<Service[] | null>(null);
  const [cat, setCat] = useState('clean');
  const [draft, setDraft] = useState<Record<string, { price: string; mrp: string }>>({});
  const load = useCallback(async () => { const { data } = await supabase.from('services').select('*').order('sort'); setList((data as Service[]) || []); }, []);
  useEffect(() => { load(); }, [load]);
  async function update(s: Service, patch: Partial<Service>, msg: string) {
    const { error } = await supabase.from('services').update(patch).eq('id', s.id);
    if (error) { toast(errMsg(error), 'err'); return; }
    toast(msg); setDraft((d) => { const n = { ...d }; delete n[s.id]; return n; }); load(); reload();
  }
  return (
    <>
      <div className="filters"><select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <span className="muted sm">Price changes apply to new bookings only.</span></div>
      {!list ? <Skeleton h={200} /> : (
        <div className="tablewrap"><table>
          <thead><tr><th>Service</th><th>Price (₹)</th><th>MRP (₹)</th><th></th><th>Live</th></tr></thead>
          <tbody>{list.filter((s) => s.category_id === cat).map((s) => {
            const d = draft[s.id] || { price: String(s.price), mrp: String(s.mrp) };
            const dirty = d.price !== String(s.price) || d.mrp !== String(s.mrp);
            const valid = /^\d+$/.test(d.price) && /^\d+$/.test(d.mrp);
            return (
              <tr key={s.id}><td style={{ minWidth: 200 }}><b>{s.name}</b><div className="muted xs">{s.sub}</div></td>
                <td><input inputMode="numeric" value={d.price} onChange={(e) => setDraft({ ...draft, [s.id]: { ...d, price: e.target.value.replace(/\D/g, '') } })} aria-label={`${s.name} price`} /></td>
                <td><input inputMode="numeric" value={d.mrp} onChange={(e) => setDraft({ ...draft, [s.id]: { ...d, mrp: e.target.value.replace(/\D/g, '') } })} aria-label={`${s.name} MRP`} /></td>
                <td>{dirty && <button className="btn s" disabled={!valid} onClick={() => update(s, { price: +d.price, mrp: +d.mrp }, 'Price saved')}>Save</button>}</td>
                <td><Switch on={s.is_active} onChange={(v) => update(s, { is_active: v }, v ? 'Service is live' : 'Service hidden')} label={`${s.name} live`} /></td></tr>);
          })}</tbody>
        </table></div>)}
    </>
  );
}

export function AdminOffers() {
  const toast = useToast();
  const [list, setList] = useState<Coupon[] | null>(null);
  const load = useCallback(async () => { const { data } = await supabase.from('coupons').select('*').order('sort'); setList((data as Coupon[]) || []); }, []);
  useEffect(() => { load(); }, [load]);
  async function toggle(c: Coupon, v: boolean) {
    const { error } = await supabase.from('coupons').update({ is_active: v }).eq('code', c.code);
    if (error) { toast(errMsg(error), 'err'); return; }
    toast(`${c.code} ${v ? 'turned on' : 'turned off'}`); load();
  }
  return !list ? <Skeleton h={200} /> : (
    <div className="tablewrap"><table>
      <thead><tr><th>Code</th><th>Offer</th><th>Rules</th><th>On</th></tr></thead>
      <tbody>{list.map((c) => (
        <tr key={c.code}><td className="num"><b>{c.code}</b></td><td>{c.title}</td>
          <td className="muted sm">Min order {rs(c.min_order)}{c.max_discount ? ` · up to ${rs(c.max_discount)}` : ''}{c.first_order_only ? ' · first booking only' : ''}</td>
          <td><Switch on={c.is_active} onChange={(v) => toggle(c, v)} label={`${c.code} active`} /></td></tr>))}</tbody>
    </table></div>
  );
}
