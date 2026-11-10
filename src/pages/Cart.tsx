import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Art, Empty, Qty, Sheet, Spinner } from '../components/ui';
import { AddressForm } from '../components/AddressForm';
import { SlotPicker } from '../components/SlotPicker';
import { ServiceCard } from './Home';
import { useAuth, useCart, useCatalog, useToast } from '../state';
import { supabase, errMsg } from '../lib/supabase';
import { fmtDate, fmtDuration, fmtTime, rs } from '../lib/format';
import type { QuoteCoupon } from '../lib/types';

function couponNote(c: QuoteCoupon) {
  if (c.ok) return `${c.description} · ${c.code}`;
  if (c.reason === 'first_order') return 'Valid on your first booking only';
  if (c.reason === 'min_order') return `Add ${rs(c.need)} more to unlock`;
  if (c.reason === 'empty') return c.description || '';
  return 'Not available';
}

type SheetKind = null | 'address' | 'addressNew' | 'slot' | 'pay';

export default function Cart() {
  const cart = useCart();
  const { quote, quoting, coupon, setCoupon, addressId, setAddressId, setCityId, slot, setSlot, payment, setPayment, itemsJson } = cart;
  const { session, addresses, ready } = useAuth();
  const { services, cities, cat } = useCatalog();
  const toast = useToast();
  const nav = useNavigate();
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [flow, setFlow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<{ date: string | null; time: string | null }>({ date: null, time: null });
  const [code, setCode] = useState('');

  const addr = addresses.find((a) => a.id === addressId) || null;
  useEffect(() => { if (ready && session && addressId && addresses.length && !addr) setAddressId(null); }, [ready, session, addressId, addresses, addr, setAddressId]);
  useEffect(() => {
    if (quote?.coupon && !quote.coupon.ok && coupon && quote.coupon.code === coupon) { toast(couponMsg(quote.coupon), 'err'); setCoupon(null); }
  }, [quote, coupon, setCoupon, toast]);
  // Moves the checkout to its next missing step after each sheet closes, using fresh state.
  const [advance, setAdvance] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (advance) next(); }, [advance]);

  if (!quote && quoting) return <div className="empty"><div className="spin-lg" /></div>;
  if (!quote || quote.count === 0) return (
    <>
      <div className="phead"><h1>Cart</h1></div>
      <Empty icon="bag" title="Your cart is empty"><p className="muted">Add a service and it will show up here.</p>
        <div className="pills" style={{ justifyContent: 'center', marginTop: 6 }}>{['clean', 'ac', 'salon', 'elec', 'plumb'].map((id) => <Link key={id} className="chip" to={`/c/${id}`}>{cat(id)?.name || id}</Link>)}</div>
      </Empty>
    </>
  );

  const save = quote.mrp_total - quote.item_total + quote.discount + (quote.item_total >= quote.free_visit_at ? 49 : 0);
  const cats = new Set(quote.lines.map((l) => l.category_id));
  const upsell = services.filter((s) => cats.has(s.category_id) && !quote.lines.some((l) => l.id === s.id)).slice(0, 8);
  const mixed = cats.size > 1;

  function next() {
    setFlow(true);
    if (!session) { nav('/login?next=/cart'); return; }
    if (!addr) { setSheet(addresses.length ? 'address' : 'addressNew'); return; }
    if (!slot) { setDraft({ date: null, time: null }); setSheet('slot'); return; }
    setFlow(false);
    setSheet('pay');
  }
  function afterStep() { if (flow) setAdvance((x) => x + 1); else setSheet(null); }

  async function pay() {
    if (!addr || !slot) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('create_booking', {
      p_items: itemsJson, p_address_id: addr.id, p_date: slot.date, p_time: slot.time, p_coupon: coupon, p_payment: payment,
    });
    if (error) {
      setBusy(false);
      const m = errMsg(error);
      toast(m, 'err');
      if (/slot|time|taken|professional/i.test(m)) { setSlot(null); setSheet('slot'); setDraft({ date: slot.date, time: null }); }
      else setSheet(null);
      cart.refreshQuote();
      return;
    }
    const res = data as { id: string; code: string };
    setTimeout(() => {
      cart.clear();
      setBusy(false);
      setSheet(null);
      nav(`/bookings/${res.code}?new=1`);
    }, 900);
  }

  const cta = !session ? 'Log in to continue' : !addr ? 'Add address' : !slot ? 'Select time slot' : 'Proceed to pay';

  return (
    <>
      <div className="phead"><button className="iconbtn" onClick={() => nav(-1)} aria-label="Back"><Icon name="back" /></button><h1>Cart</h1>{quoting && <Spinner />}</div>
      <div className="cartgrid">
        <div>
          {save > 0 && <div className="banner good"><Icon name="tag" /><div>You save {rs(save)} on this order</div></div>}
          {mixed && <div className="banner warn"><Icon name="info" /><div>Your cart has services from {cats.size} categories. If no single professional offers all of them, book them separately.</div></div>}
          <div className="panel">
            {quote.lines.map((l) => (
              <div key={l.id} className="citem"><Art catId={l.category_id} />
                <div><b>{l.name}</b><span className="price sm">{rs(l.price * l.qty)}</span>{l.mrp > l.price && <span className="mrp">{rs(l.mrp * l.qty)}</span>}<div className="muted xs">{fmtDuration(l.duration_min)} each</div></div>
                <Qty id={l.id} />
              </div>))}
            <Link className="link" to={`/c/${quote.lines[0].category_id}`} style={{ justifySelf: 'start' }}>+ Add more {cat(quote.lines[0].category_id)?.name.toLowerCase()} services</Link>
          </div>
          {upsell.length > 0 && <div><h3 style={{ fontSize: 17, marginBottom: 10 }}>Frequently added together</h3><div className="hscroll">{upsell.map((s) => <ServiceCard key={s.id} s={s} />)}</div></div>}
          <div className="panel"><h3>Offers</h3>
            {quote.coupons.map((c) => {
              const on = coupon === c.code && quote.coupon?.ok;
              return (
                <div key={c.code} className={`coupon ${on ? 'on' : ''}`}><Icon name="tag" />
                  <div><b className="sm">{c.title}</b><div className="muted xs">{on ? `Saving ${rs(quote.discount)} with ${c.code}` : couponNote(c)}</div></div>
                  {on ? <button className="link sm" onClick={() => setCoupon(null)}>Remove</button>
                    : <button className="btn out s" disabled={!c.ok} onClick={() => { setCoupon(c.code); toast(`${c.code} applied`); }}>Apply</button>}
                </div>);
            })}
            <form className="row" onSubmit={(e) => { e.preventDefault(); const c = code.trim().toUpperCase(); if (c) { setCoupon(c); setCode(''); } }}>
              <input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Have a code? Enter it here" aria-label="Coupon code" style={{ textTransform: 'uppercase' }} />
              <button className="btn out s" disabled={!code.trim()}>Apply</button>
            </form>
          </div>
        </div>
        <div>
          <div className="panel"><h3>Booking details</h3>
            <div className={`drow ${addr ? 'ok' : ''}`}><span className="ib"><Icon name="pin" /></span>
              <div><b>{addr ? addr.label : 'Address'}</b><span className="muted sm">{addr ? `${addr.house}, ${addr.area}, ${cities.find((c) => c.id === addr.city_id)?.name}` : 'Where should the professional come?'}</span></div>
              <button className="link sm" onClick={() => (session ? setSheet(addresses.length ? 'address' : 'addressNew') : nav('/login?next=/cart'))}>{addr ? 'Change' : 'Add'}</button></div>
            <div className={`drow ${slot ? 'ok' : ''}`}><span className="ib"><Icon name="clock" /></span>
              <div><b>{slot ? fmtDate(slot.date) : 'Time slot'}</b><span className="muted sm">{slot ? `${fmtTime(slot.time)} · about ${quote.span_hours} hr${quote.span_hours > 1 ? 's' : ''}` : 'Pick a date and time'}</span></div>
              <button className="link sm" disabled={!addr} onClick={() => { setDraft({ date: slot?.date || null, time: slot?.time || null }); setSheet('slot'); }} style={!addr ? { opacity: .4 } : undefined}>{slot ? 'Change' : 'Select'}</button></div>
          </div>
          <div className="panel"><h3>Payment summary</h3>
            <div className="line"><span>Item total</span><span>{quote.mrp_total > quote.item_total && <span className="mrp" style={{ marginRight: 6 }}>{rs(quote.mrp_total)}</span>}{rs(quote.item_total)}</span></div>
            {quote.discount > 0 && <div className="line" style={{ color: 'var(--good)' }}><span>Coupon ({coupon})</span><span>−{rs(quote.discount)}</span></div>}
            <div className="line"><span>Visit fee</span><span>{quote.visit_fee ? rs(quote.visit_fee) : <><span className="mrp" style={{ marginRight: 6 }}>₹49</span><b style={{ color: 'var(--good)' }}>Free</b></>}</span></div>
            {quote.visit_fee > 0 && <div className="hint">Add {rs(quote.free_visit_at - quote.item_total)} more to get a free visit.</div>}
            <div className="line tot"><span>Amount to pay</span><span>{rs(quote.total)}</span></div>
          </div>
          <div className="panel"><h4>Cancellation policy</h4><p className="muted sm">Free cancellation or reschedule up to 3 hours before the slot. After that, cancelling a prepaid booking costs ₹100.</p></div>
        </div>
      </div>

      <div className="ctabar"><div className="wrap">
        <div><div className="price" style={{ fontSize: 18 }}>{rs(quote.total)}</div><span className="muted xs">{quote.count} item{quote.count > 1 ? 's' : ''}{save > 0 ? ` · saving ${rs(save)}` : ''}</span></div>
        <span className="sp" />
        <button className="btn" style={{ minWidth: 180 }} onClick={next} disabled={quoting}>{cta}</button>
      </div></div>

      {sheet === 'address' && (
        <Sheet title="Choose address" onClose={() => { setSheet(null); setFlow(false); }} footer={<>
          <button className="btn out" style={{ flex: 1 }} onClick={() => setSheet('addressNew')}><Icon name="plus" />Add new</button>
          <button className="btn" style={{ flex: 1 }} disabled={!addr} onClick={afterStep}>Use this address</button></>}>
          {addresses.map((a) => (
            <button key={a.id} className={`opt ${a.id === addressId ? 'on' : ''}`} onClick={() => { setAddressId(a.id); setCityId(a.city_id); setSlot(null); }}>
              <span className="radio" /><div><b>{a.label}</b><span className="muted sm">{a.house}, {a.area}{a.landmark ? ` · near ${a.landmark}` : ''}, {cities.find((c) => c.id === a.city_id)?.name} {a.pincode}</span></div>
            </button>))}
        </Sheet>)}
      {sheet === 'addressNew' && (
        <Sheet title="Add address" onClose={() => { setSheet(null); setFlow(false); }}>
          <AddressForm onSaved={(a) => { setAddressId(a.id); setCityId(a.city_id); setSlot(null); toast('Address saved'); afterStep(); }}
            onCancel={addresses.length ? () => setSheet('address') : undefined} />
        </Sheet>)}
      {sheet === 'slot' && addr && (
        <Sheet title="When should the professional arrive?" onClose={() => { setSheet(null); setFlow(false); }} footer={
          <button className="btn w" disabled={!draft.date || !draft.time} onClick={() => { setSlot({ date: draft.date!, time: draft.time! }); afterStep(); }}>
            {draft.time && draft.date ? `Confirm ${fmtDate(draft.date)}, ${fmtTime(draft.time)}` : 'Pick a time'}</button>}>
          <p className="muted sm"><Icon name="clock" className="i" /> This booking takes about {quote.span_hours} hour{quote.span_hours > 1 ? 's' : ''}. The professional arrives within 15 minutes of the slot.</p>
          <SlotPicker city={addr.city_id} items={itemsJson} date={draft.date} time={draft.time}
            onDate={(d) => setDraft({ date: d, time: null })} onTime={(t) => setDraft((x) => ({ date: x.date || d0(), time: t }))} />
        </Sheet>)}
      {sheet === 'pay' && addr && slot && (
        <Sheet title={busy ? 'Confirming your booking' : 'Choose payment method'} onClose={() => { if (!busy) setSheet(null); }} footer={busy ? undefined :
          <button className="btn w" onClick={pay}>{payment === 'cash' ? 'Confirm booking' : `Pay ${rs(quote.total)}`}</button>}>
          {busy ? <div className="empty"><div className="spin-lg" /><h3>{payment === 'cash' ? 'Placing your booking' : 'Confirming payment'}</h3><p className="muted sm">Please keep this window open.</p></div> : <>
            <div className="line panel" style={{ display: 'flex' }}><span>Amount to pay</span><b>{rs(quote.total)}</b></div>
            {([['upi', 'phone', 'UPI', 'Google Pay, PhonePe, Paytm and more'], ['card', 'card', 'Credit or debit card', 'Visa, Mastercard, RuPay'], ['cash', 'cash', 'Pay after service', 'Cash or UPI to the professional']] as const).map(([k, ic, l, d]) => (
              <button key={k} className={`opt ${payment === k ? 'on' : ''}`} onClick={() => setPayment(k)}><span className="radio" /><div><b>{l}</b><span className="muted xs">{d}</span></div><Icon name={ic} /></button>))}
            <div className="demo">Online payments are simulated in this version. Nothing is charged. Your booking is real and shows up for our team.</div>
            <div className="line"><span className="muted">Arriving</span><span>{fmtDate(slot.date)}, {fmtTime(slot.time)}</span></div>
            <div className="line"><span className="muted">At</span><span>{addr.house}, {addr.area}</span></div>
          </>}
        </Sheet>)}
    </>
  );
}

const d0 = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
function couponMsg(c: QuoteCoupon) {
  if (c.reason === 'invalid') return `${c.code} is not a valid code.`;
  if (c.reason === 'first_order') return `${c.code} works on your first booking only.`;
  if (c.reason === 'min_order') return `Add ${rs(c.need)} more to use ${c.code}.`;
  return `${c.code} can't be applied right now.`;
}
