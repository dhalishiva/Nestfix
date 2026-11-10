import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Art, Empty, Sheet, Skeleton, Spinner } from '../components/ui';
import { SlotPicker } from '../components/SlotPicker';
import { useAuth, useCart, useCatalog, useToast } from '../state';
import { supabase, errMsg } from '../lib/supabase';
import { BOOKING_SELECT, type Booking } from '../lib/types';
import { BAD_TAGS, CANCEL_REASONS, GOOD_TAGS } from '../lib/content';
import { PAY_LABEL, STATUS_LABEL, fmtDate, fmtStamp, fmtTime, initials, minutesUntil, rs } from '../lib/format';

const UPCOMING = ['confirmed', 'pro_assigned', 'en_route', 'in_progress'];

function statusPill(b: Booking) {
  const cls = b.status === 'completed' ? 'done' : b.status === 'cancelled' ? 'can' : b.status === 'en_route' || b.status === 'in_progress' ? 'go' : 'up';
  return <span className={`pill ${cls}`}>{STATUS_LABEL[b.status]}</span>;
}
function title(b: Booking) { return b.booking_items.map((i) => i.name + (i.qty > 1 ? ` ×${i.qty}` : '')).join(', '); }

function Tracker({ b }: { b: Booking }) {
  const step = { confirmed: 1, pro_assigned: 2, en_route: 3, in_progress: 4, completed: 5, cancelled: 0 }[b.status];
  return (
    <div className="track" aria-label={`Status: ${STATUS_LABEL[b.status]}`}>
      <div className={step >= 2 ? 'd' : ''}>Pro assigned</div>
      <div className={step >= 3 ? 'd' : ''}>On the way</div>
      <div className={step >= 4 ? 'd' : ''}>Work started</div>
      <div className={step >= 5 ? 'd' : ''}>Completed</div>
    </div>
  );
}

function useLiveBookings(userId: string | undefined, onChange: () => void) {
  useEffect(() => {
    if (!userId) return;
    const ch = supabase.channel(`bookings-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${userId}` }, () => onChange())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, onChange]);
}

export default function Bookings() {
  const { session } = useAuth();
  const { svc } = useCatalog();
  const [list, setList] = useState<Booking[] | null>(null);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState<'up' | 'past'>('up');
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('bookings').select(BOOKING_SELECT).order('scheduled_date', { ascending: true }).order('slot_time');
    if (error) { setErr(errMsg(error)); return; }
    setList(data as unknown as Booking[]);
  }, []);
  useEffect(() => { load(); }, [load]);
  useLiveBookings(session?.user.id, load);

  if (err) return <Empty icon="alert" title="Bookings didn't load"><p className="muted">{err}</p><button className="btn" onClick={load}>Try again</button></Empty>;
  const up = (list || []).filter((b) => UPCOMING.includes(b.status));
  const past = (list || []).filter((b) => !UPCOMING.includes(b.status)).reverse();
  const shown = tab === 'up' ? up : past;

  return (
    <>
      <div className="phead"><h1>My bookings</h1></div>
      <div className="seg" style={{ maxWidth: 360, marginBottom: 16 }}>
        <button className={tab === 'up' ? 'on' : ''} onClick={() => setTab('up')}>Upcoming ({up.length})</button>
        <button className={tab === 'past' ? 'on' : ''} onClick={() => setTab('past')}>Past ({past.length})</button>
      </div>
      <div className="stack" style={{ maxWidth: 640 }}>
        {!list && [1, 2].map((i) => <Skeleton key={i} h={180} r={16} />)}
        {list && shown.length === 0 && (
          <Empty icon="cal" title={tab === 'up' ? 'No upcoming bookings' : 'Nothing here yet'}>
            <p className="muted">{tab === 'up' ? 'Book a service and track it here.' : 'Completed and cancelled bookings show up here.'}</p>
            <Link className="btn" to="/">Explore services</Link>
          </Empty>)}
        {shown.map((b) => (
          <Link key={b.id} to={`/bookings/${b.code}`} className="bk">
            <div className="top"><Art catId={svc(b.booking_items[0]?.service_id || '')?.category_id} />
              <div><b>{title(b)}</b><span className="muted xs">{b.code}</span></div>{statusPill(b)}</div>
            <div className="when"><Icon name="cal" />{fmtDate(b.scheduled_date)} · {fmtTime(b.slot_time)}<span className="sp" /><span className="price">{rs(b.total)}</span></div>
            {UPCOMING.includes(b.status) && <Tracker b={b} />}
            {b.pro && b.status !== 'cancelled' && <span className="muted sm">With {b.pro.name} · ★ {b.pro.rating}</span>}
            {b.status === 'completed' && !b.rating && <span className="link sm">Rate this service <Icon name="right" className="i" /></span>}
          </Link>))}
      </div>
    </>
  );
}

export function BookingDetail() {
  const { code = '' } = useParams();
  const [sp] = useSearchParams();
  const isNew = sp.get('new') === '1';
  const { session } = useAuth();
  const { add } = useCart();
  const toast = useToast();
  const nav = useNavigate();
  const [b, setB] = useState<Booking | null | undefined>(undefined);
  const [sheet, setSheet] = useState<null | 'cancel' | 'resch' | 'rate'>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('bookings').select(BOOKING_SELECT + ', booking_events(id,status,note,created_at)').eq('code', code).maybeSingle();
    if (error) { toast(errMsg(error), 'err'); setB(null); return; }
    const row = data as unknown as Booking | null;
    if (row?.booking_events) row.booking_events.sort((x, y) => x.id - y.id);
    setB(row);
  }, [code, toast]);
  useEffect(() => { load(); }, [load]);
  useLiveBookings(session?.user.id, load);

  if (b === undefined) return <div className="stack" style={{ maxWidth: 560, margin: '0 auto' }}><Skeleton h={90} /><Skeleton h={220} /><Skeleton h={160} /></div>;
  if (b === null) return <Empty icon="search" title="Booking not found"><p className="muted">Check the link, or find it in your bookings.</p><Link className="btn" to="/bookings">My bookings</Link></Empty>;

  const upcoming = UPCOMING.includes(b.status);
  const mins = minutesUntil(b.scheduled_date, b.slot_time);
  const canChange = ['confirmed', 'pro_assigned'].includes(b.status) && mins >= 180;
  const canCancel = ['confirmed', 'pro_assigned', 'en_route'].includes(b.status);

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', display: 'grid', gap: 14 }}>
      {isNew ? (
        <div className="done"><div className="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
          <h1 style={{ fontSize: 28 }}>Booking confirmed</h1>
          <p className="muted">{b.pro ? `${b.pro.name} will arrive on ${fmtDate(b.scheduled_date)} at ${fmtTime(b.slot_time)}.` : 'We are assigning a professional.'}</p></div>
      ) : (
        <div className="phead"><button className="iconbtn" onClick={() => nav('/bookings')} aria-label="Back to bookings"><Icon name="back" /></button><h1 style={{ flex: 1 }}>Booking {b.code}</h1>{statusPill(b)}</div>
      )}

      <article className="bk">
        <div className="top"><div><b>{title(b)}</b><span className="muted xs">{b.code} · booked {fmtStamp(b.created_at)}</span></div></div>
        <div className="when"><Icon name="cal" />{fmtDate(b.scheduled_date)} · {fmtTime(b.slot_time)}<span className="sp" /><span className="muted sm">about {b.span_hours} hr{b.span_hours > 1 ? 's' : ''}</span></div>
        {upcoming && <Tracker b={b} />}
        {b.pro && b.status !== 'cancelled' && (
          <div className="pro"><span className="av">{initials(b.pro.name)}</span>
            <div><b>{b.pro.name}</b><div className="muted sm">★ {b.pro.rating} · {b.pro.jobs_done} jobs{upcoming ? ` · +91 ${b.pro.phone}` : ''}</div></div>
            {upcoming && b.status !== 'in_progress' && <div className="pin"><span className="muted xs">Start PIN</span><b>{b.start_pin}</b></div>}
          </div>)}
        {upcoming && b.status !== 'in_progress' && <p className="muted xs">Share the PIN only when the work is about to start. Never share it on a call.</p>}
        <div className="drow ok"><span className="ib"><Icon name="pin" /></span><div><b>{b.address.label}</b><span className="muted sm">{b.address.house}, {b.address.area}{b.address.landmark ? ` · near ${b.address.landmark}` : ''}, {b.address.city} {b.address.pincode}</span></div></div>
        {b.status === 'cancelled' && <div className="banner bad"><Icon name="info" /><div>{b.cancel_reason || 'Cancelled'}{b.refund_amount > 0 ? ` · ${rs(b.refund_amount)} refund started` : ''}{b.cancel_fee > 0 ? ` (₹${b.cancel_fee} late cancellation fee)` : ''}</div></div>}
        {b.status === 'completed' && b.rating && <span className="rate"><span className="st">{'★'.repeat(b.rating)}</span><span className="muted">You rated {b.rating}/5{b.review_tags?.length ? ` · ${b.review_tags.join(', ')}` : ''}</span></span>}
        <div className="acts">
          {canChange && <button className="btn out s" onClick={() => setSheet('resch')}>Reschedule</button>}
          {canCancel && <button className="btn out s danger" onClick={() => setSheet('cancel')}>Cancel booking</button>}
          {b.status === 'completed' && !b.rating && <button className="btn s" onClick={() => setSheet('rate')}>Rate service</button>}
          {!upcoming && <button className="btn out s" onClick={() => { b.booking_items.forEach((i) => add(i.service_id, i.qty)); toast('Added to cart'); nav('/cart'); }}>Book again</button>}
        </div>
        {upcoming && !canChange && ['confirmed', 'pro_assigned'].includes(b.status) && <p className="muted xs">Rescheduling closes 3 hours before the slot.</p>}
      </article>

      <div className="panel"><h3>Payment</h3>
        {b.booking_items.map((i) => <div key={i.service_id} className="line"><span>{i.name} × {i.qty}</span><span>{rs(i.unit_price * i.qty)}</span></div>)}
        {b.discount > 0 && <div className="line" style={{ color: 'var(--good)' }}><span>Coupon {b.coupon_code}</span><span>−{rs(b.discount)}</span></div>}
        <div className="line"><span>Visit fee</span><span>{b.visit_fee ? rs(b.visit_fee) : 'Free'}</span></div>
        <div className="line tot"><span>Total</span><span>{rs(b.total)}</span></div>
        <span className="muted sm">{PAY_LABEL[b.payment_method]} · {{ pending: 'To be paid after service', paid: 'Paid', refunded: 'Refunded', partially_refunded: 'Partly refunded', void: 'Not charged' }[b.payment_status]}</span>
      </div>

      {b.booking_events && b.booking_events.length > 0 && (
        <div className="panel"><h3>Activity</h3><div className="timeline">
          {b.booking_events.map((e) => <div key={e.id} className="tl"><i /><div><b>{STATUS_LABEL[e.status] || e.status}</b><div className="muted sm">{e.note}</div><div className="muted xs">{fmtStamp(e.created_at)}</div></div></div>)}
        </div></div>)}

      {isNew && <div className="acts"><Link className="btn out" to="/bookings">All bookings</Link><Link className="btn" to="/">Book another service</Link></div>}

      {sheet === 'cancel' && <CancelSheet b={b} mins={mins} onClose={() => setSheet(null)} onDone={() => { setSheet(null); load(); }} onResch={canChange ? () => setSheet('resch') : undefined} />}
      {sheet === 'resch' && <ReschSheet b={b} onClose={() => setSheet(null)} onDone={() => { setSheet(null); load(); }} />}
      {sheet === 'rate' && <RateSheet b={b} onClose={() => setSheet(null)} onDone={() => { setSheet(null); load(); }} />}
    </div>
  );
}

function CancelSheet({ b, mins, onClose, onDone, onResch }: { b: Booking; mins: number; onClose: () => void; onDone: () => void; onResch?: () => void }) {
  const [r, setR] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const late = mins < 180;
  const fee = b.payment_status === 'paid' && late ? Math.min(100, b.total) : 0;
  async function go() {
    setBusy(true);
    const { error } = await supabase.rpc('cancel_booking', { p_id: b.id, p_reason: r });
    setBusy(false);
    if (error) { toast(errMsg(error), 'err'); return; }
    toast('Booking cancelled'); onDone();
  }
  return (
    <Sheet title="Cancel booking?" onClose={onClose} footer={<>
      <button className="btn out" style={{ flex: 1 }} onClick={onClose}>Keep booking</button>
      <button className="btn danger" style={{ flex: 1 }} disabled={!r || busy} onClick={go}>{busy && <Spinner />}Cancel booking</button></>}>
      <p className="muted">{title(b)} on {fmtDate(b.scheduled_date)}, {fmtTime(b.slot_time)}</p>
      <span className="slab">Tell us why</span>
      {CANCEL_REASONS.map((x) => <button key={x} className={`opt ${r === x ? 'on' : ''}`} onClick={() => setR(x)}><span className="radio" /><div><b className="sm">{x}</b></div></button>)}
      {r === 'I need a different time' && onResch && <div className="hint">You can move this booking for free instead. <button className="link sm" onClick={onResch}>Reschedule</button></div>}
      <p className="muted sm">{b.payment_status === 'paid' ? (fee ? `It's less than 3 hours to the slot, so ₹${fee} is kept as a late fee. ${rs(b.total - fee)} goes back to your ${PAY_LABEL[b.payment_method]} in 3–5 working days.` : `${rs(b.total)} goes back to your ${PAY_LABEL[b.payment_method]} in 3–5 working days.`) : 'Nothing was charged for this booking.'}</p>
    </Sheet>
  );
}

function ReschSheet({ b, onClose, onDone }: { b: Booking; onClose: () => void; onDone: () => void }) {
  const [d, setD] = useState<string | null>(b.scheduled_date);
  const [t, setT] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const items = b.booking_items.map((i) => ({ id: i.service_id, qty: i.qty }));
  async function go() {
    setBusy(true);
    const { data, error } = await supabase.rpc('reschedule_booking', { p_id: b.id, p_date: d, p_time: t });
    setBusy(false);
    if (error) { toast(errMsg(error), 'err'); return; }
    toast(`Moved to ${fmtDate(d)}, ${fmtTime(t)}${(data as { pro_changed: boolean }).pro_changed ? ' with a new professional' : ''}`);
    onDone();
  }
  const same = d === b.scheduled_date && t === b.slot_time.slice(0, 5);
  return (
    <Sheet title="Reschedule" onClose={onClose} footer={
      <button className="btn w" disabled={!d || !t || same || busy} onClick={go}>{busy && <Spinner />}{t && d && !same ? `Move to ${fmtDate(d)}, ${fmtTime(t)}` : 'Pick a new time'}</button>}>
      <p className="muted sm">Currently {fmtDate(b.scheduled_date)}, {fmtTime(b.slot_time)}{b.pro ? ` with ${b.pro.name}` : ''}. We keep the same professional when they're free.</p>
      <SlotPicker city={b.city_id} items={items} date={d} time={t} onDate={(x) => { setD(x); setT(null); }} onTime={setT} />
    </Sheet>
  );
}

function RateSheet({ b, onClose, onDone }: { b: Booking; onClose: () => void; onDone: () => void }) {
  const [v, setV] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [txt, setTxt] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const L = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
  async function go() {
    setBusy(true);
    const { error } = await supabase.rpc('rate_booking', { p_id: b.id, p_rating: v, p_tags: tags, p_comment: txt });
    setBusy(false);
    if (error) { toast(errMsg(error), 'err'); return; }
    toast('Thanks for the feedback'); onDone();
  }
  return (
    <Sheet title="Rate your service" onClose={onClose} footer={<button className="btn w" disabled={!v || busy} onClick={go}>{busy && <Spinner />}Submit rating</button>}>
      <p className="muted" style={{ textAlign: 'center' }}>How was {b.pro?.name.split(' ')[0] || 'your professional'}?</p>
      <div className="stars">{[1, 2, 3, 4, 5].map((i) => <button key={i} className={i <= v ? 'on' : ''} onClick={() => { setV(i); setTags([]); }} aria-label={`${i} star${i > 1 ? 's' : ''}`}>★</button>)}</div>
      <p className="b" style={{ textAlign: 'center' }}>{v ? L[v] : 'Tap a star'}</p>
      {v > 0 && <>
        <div className="pills" style={{ justifyContent: 'center' }}>{(v >= 4 ? GOOD_TAGS : BAD_TAGS).map((g) => (
          <button key={g} className={`chip ${tags.includes(g) ? 'on' : ''}`} onClick={() => setTags((x) => (x.includes(g) ? x.filter((y) => y !== g) : [...x, g]))}>{g}</button>))}</div>
        <textarea id="rtxt" rows={3} maxLength={500} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Anything else? (optional)" />
      </>}
    </Sheet>
  );
}
