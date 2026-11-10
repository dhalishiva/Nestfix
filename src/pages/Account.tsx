import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Empty, Sheet, Spinner } from '../components/ui';
import { AddressForm } from '../components/AddressForm';
import { applyTheme, savedTheme, useAuth, useCart, useCatalog, useToast, type Theme } from '../state';
import { supabase, errMsg } from '../lib/supabase';
import { FAQS } from '../lib/content';
import { initials } from '../lib/format';
import type { Address } from '../lib/types';

export default function Account() {
  const { session, profile, email, addresses, signOut, reloadProfile } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [theme, setTheme] = useState<Theme>(savedTheme());
  const [sheet, setSheet] = useState<null | 'name' | 'help' | 'logout'>(null);

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
      <div className="phead"><h1>Account</h1></div>
      {session && profile ? (
        <div className="panel" style={{ gridTemplateColumns: 'auto 1fr auto', alignItems: 'center' }}>
          <span className="av" style={{ width: 56, height: 56, fontSize: 20 }}>{initials(profile.full_name || email)}</span>
          <div style={{ minWidth: 0 }}><h3 style={{ fontSize: 20 }}>{profile.full_name || 'Add your name'}</h3><span className="muted sm" style={{ wordBreak: 'break-all' }}>{email}{profile.phone ? ` · +91 ${profile.phone}` : ''}</span></div>
          <button className="iconbtn" onClick={() => setSheet('name')} aria-label="Edit profile"><Icon name="edit" /></button>
        </div>
      ) : (
        <div className="panel"><h3>Log in for faster booking</h3><p className="muted sm">Save addresses, track professionals and manage bookings.</p>
          <div className="acts"><Link className="btn" to="/login?next=/account">Log in</Link><Link className="btn out" to="/signup?next=/account">Create account</Link></div></div>
      )}
      <div className="menu">
        {profile?.role === 'admin' && <Link className="mrow" to="/admin"><Icon name="grid" /><div><b>Admin dashboard</b><div className="muted xs">Bookings, professionals, services and offers</div></div><Icon name="right" /></Link>}
        <Link className="mrow" to="/bookings"><Icon name="cal" /><div><b>My bookings</b></div><Icon name="right" /></Link>
        <Link className="mrow" to={session ? '/account/addresses' : '/login?next=/account/addresses'}><Icon name="pin" /><div><b>Saved addresses</b><div className="muted xs">{addresses.length} saved</div></div><Icon name="right" /></Link>
        <button className="mrow" onClick={() => setSheet('help')}><Icon name="help" /><div><b>Help & support</b></div><Icon name="right" /></button>
        <div className="mrow" style={{ flexWrap: 'wrap' }}><Icon name="moon" /><div><b>Appearance</b></div>
          <div className="seg" style={{ flex: '0 0 230px' }}>{(['system', 'light', 'dark'] as Theme[]).map((m) => (
            <button key={m} className={theme === m ? 'on' : ''} onClick={() => { setTheme(m); applyTheme(m); }}>{m[0].toUpperCase() + m.slice(1)}</button>))}</div></div>
      </div>
      {session && <div className="menu"><button className="mrow" style={{ color: 'var(--bad)' }} onClick={() => setSheet('logout')}><Icon name="out" /><div><b>Log out</b></div></button></div>}

      {sheet === 'name' && profile && <ProfileSheet onClose={() => setSheet(null)} onSaved={async () => { await reloadProfile(); setSheet(null); toast('Profile updated'); }} name={profile.full_name} phone={profile.phone || ''} id={profile.id} />}
      {sheet === 'help' && (
        <Sheet title="Help & support" onClose={() => setSheet(null)} footer={<button className="btn out w" onClick={() => setSheet(null)}>Done</button>}>
          {FAQS.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
          <div className="panel"><b>Still need help?</b><p className="muted sm">Open the booking from My bookings to see your professional's number and the full activity log. Cancelling or rescheduling is done there too.</p>
            <Link className="btn out s" to="/bookings" onClick={() => setSheet(null)}>Go to my bookings</Link></div>
        </Sheet>)}
      {sheet === 'logout' && (
        <Sheet title="Log out?" onClose={() => setSheet(null)} footer={<>
          <button className="btn out" style={{ flex: 1 }} onClick={() => setSheet(null)}>Stay logged in</button>
          <button className="btn danger" style={{ flex: 1 }} onClick={async () => { await signOut(); setSheet(null); toast('Logged out'); nav('/'); }}>Log out</button></>}>
          <p className="muted">Your cart stays on this device. Bookings stay in your account.</p>
        </Sheet>)}
    </div>
  );
}

function ProfileSheet({ id, name, phone, onClose, onSaved }: { id: string; name: string; phone: string; onClose: () => void; onSaved: () => void }) {
  const [n, setN] = useState(name);
  const [p, setP] = useState(phone);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function save() {
    if (n.trim().length < 2) { setErr('Enter at least 2 letters for your name.'); return; }
    if (p && !/^[6-9][0-9]{9}$/.test(p)) { setErr('Enter a 10-digit mobile number starting with 6, 7, 8 or 9, or leave it empty.'); return; }
    setBusy(true);
    const { error } = await supabase.from('profiles').update({ full_name: n.trim(), phone: p || null }).eq('id', id);
    setBusy(false);
    if (error) { setErr(errMsg(error)); return; }
    onSaved();
  }
  return (
    <Sheet title="Edit profile" onClose={onClose} footer={<button className="btn w" onClick={save} disabled={busy}>{busy && <Spinner />}Save</button>}>
      <label className="field">Full name<input id="pname" value={n} onChange={(e) => setN(e.target.value)} autoComplete="name" /></label>
      <label className="field">Mobile number <span className="help">So your professional can reach you</span>
        <div className="row"><span className="chip" style={{ padding: '11px 14px' }}>+91</span><input id="pphone" inputMode="numeric" maxLength={10} value={p} onChange={(e) => setP(e.target.value.replace(/\D/g, ''))} autoComplete="tel-national" placeholder="98765 43210" /></div></label>
      {err && <span className="err">{err}</span>}
    </Sheet>
  );
}

export function Addresses() {
  const { addresses, reloadAddresses } = useAuth();
  const { cities } = useCatalog();
  const { addressId, setAddressId, setCityId } = useCart();
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const [edit, setEdit] = useState<Address | 'new' | null>(sp.get('new') ? 'new' : null);
  const [del, setDel] = useState<Address | null>(null);
  const [busy, setBusy] = useState(false);

  async function remove(a: Address) {
    setBusy(true);
    const { error } = await supabase.from('addresses').delete().eq('id', a.id);
    setBusy(false);
    if (error) { toast(errMsg(error), 'err'); return; }
    if (addressId === a.id) setAddressId(null);
    await reloadAddresses(); setDel(null); toast('Address deleted');
  }

  return (
    <div style={{ display: 'grid', gap: 14, maxWidth: 560 }}>
      <div className="phead"><Link className="iconbtn" to="/account" aria-label="Back"><Icon name="back" /></Link><h1 style={{ flex: 1 }}>Saved addresses</h1>
        <button className="btn s" onClick={() => setEdit('new')}><Icon name="plus" />Add</button></div>
      {addresses.length === 0 && <Empty icon="pin" title="No saved addresses"><p className="muted">Add one so professionals know where to come.</p><button className="btn" onClick={() => setEdit('new')}>Add address</button></Empty>}
      {addresses.map((a) => (
        <div key={a.id} className={`opt ${a.id === addressId ? 'on' : ''}`} style={{ padding: 0 }}>
          <button style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, padding: '13px 14px', textAlign: 'left' }} onClick={() => { setAddressId(a.id); setCityId(a.city_id); toast(`${a.label} is now your default address`); }}>
            <span className="radio" /><div><b>{a.label}</b><span className="muted sm">{a.house}, {a.area}{a.landmark ? ` · near ${a.landmark}` : ''}, {cities.find((c) => c.id === a.city_id)?.name} {a.pincode}</span></div></button>
          <button className="iconbtn" onClick={() => setEdit(a)} aria-label={`Edit ${a.label} address`}><Icon name="edit" /></button>
          <button className="iconbtn" onClick={() => setDel(a)} aria-label={`Delete ${a.label} address`} style={{ marginRight: 6 }}><Icon name="trash" /></button>
        </div>))}
      {edit && (
        <Sheet title={edit === 'new' ? 'Add address' : 'Edit address'} onClose={() => { setEdit(null); setSp({}); }}>
          <AddressForm initial={edit === 'new' ? undefined : edit} onCancel={() => { setEdit(null); setSp({}); }}
            onSaved={(a) => { if (edit === 'new') { setAddressId(a.id); setCityId(a.city_id); } setEdit(null); setSp({}); toast('Address saved'); }} />
        </Sheet>)}
      {del && (
        <Sheet title="Delete address?" onClose={() => setDel(null)} footer={<>
          <button className="btn out" style={{ flex: 1 }} onClick={() => setDel(null)}>Keep</button>
          <button className="btn danger" style={{ flex: 1 }} disabled={busy} onClick={() => remove(del)}>{busy && <Spinner />}Delete</button></>}>
          <p className="muted">{del.house}, {del.area}. Past bookings keep their address.</p>
        </Sheet>)}
    </div>
  );
}
