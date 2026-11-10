import { useState } from 'react';
import { supabase, errMsg } from '../lib/supabase';
import { useAuth, useCart, useCatalog } from '../state';
import type { Address } from '../lib/types';
import { Spinner } from './ui';

export function AddressForm({ initial, onSaved, onCancel }: { initial?: Address; onSaved: (a: Address) => void; onCancel?: () => void }) {
  const { cities } = useCatalog();
  const { cityId } = useCart();
  const { reloadAddresses } = useAuth();
  const [f, setF] = useState({
    label: initial?.label || 'Home', house: initial?.house || '', area: initial?.area || '',
    landmark: initial?.landmark || '', city_id: initial?.city_id || cityId, pincode: initial?.pincode || '',
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState('');
  const set = (k: keyof typeof f, v: string) => { setF((x) => ({ ...x, [k]: v })); setErr((e) => ({ ...e, [k]: '' })); };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.house.trim().length < 3) er.house = 'Add your house or flat number and building.';
    if (f.area.trim().length < 2) er.area = 'Add your area or sector.';
    if (!/^[1-9][0-9]{5}$/.test(f.pincode)) er.pincode = 'Enter a 6-digit pincode.';
    setErr(er);
    if (Object.keys(er).length) return;
    setBusy(true); setFormErr('');
    const row = { label: f.label, house: f.house.trim(), area: f.area.trim(), landmark: f.landmark.trim() || null, city_id: f.city_id, pincode: f.pincode };
    const q = initial ? supabase.from('addresses').update(row).eq('id', initial.id).select().single() : supabase.from('addresses').insert(row).select().single();
    const { data, error } = await q;
    setBusy(false);
    if (error) { setFormErr(errMsg(error)); return; }
    await reloadAddresses();
    onSaved(data as Address);
  }

  return (
    <form onSubmit={save} className="stack" noValidate>
      <label className="field">House / flat no. and building
        <input id="a_house" value={f.house} onChange={(e) => set('house', e.target.value)} placeholder="Flat 304, Tower B, Supertech Capetown" autoComplete="address-line1" aria-invalid={!!err.house} />
        {err.house && <span className="err">{err.house}</span>}
      </label>
      <label className="field">Area or sector
        <input id="a_area" value={f.area} onChange={(e) => set('area', e.target.value)} placeholder="Sector 74" autoComplete="address-line2" aria-invalid={!!err.area} />
        {err.area && <span className="err">{err.area}</span>}
      </label>
      <label className="field">Landmark <span className="help">Optional</span>
        <input id="a_land" value={f.landmark} onChange={(e) => set('landmark', e.target.value)} placeholder="Near the main gate" />
      </label>
      <div className="row2">
        <label className="field">City
          <select id="a_city" value={f.city_id} onChange={(e) => set('city_id', e.target.value)}>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </label>
        <label className="field">Pincode
          <input id="a_pin" inputMode="numeric" maxLength={6} value={f.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, ''))} placeholder="201301" autoComplete="postal-code" aria-invalid={!!err.pincode} />
          {err.pincode && <span className="err">{err.pincode}</span>}
        </label>
      </div>
      <div className="field">Save as<div className="pills">{(['Home', 'Work', 'Other'] as const).map((l) => (
        <button type="button" key={l} className={`chip ${f.label === l ? 'on' : ''}`} onClick={() => set('label', l)}>{l}</button>))}</div></div>
      {formErr && <span className="err">{formErr}</span>}
      <div className="acts">
        {onCancel && <button type="button" className="btn out" onClick={onCancel}>Cancel</button>}
        <button className="btn" disabled={busy}>{busy ? <Spinner /> : null}{initial ? 'Save changes' : 'Save address'}</button>
      </div>
    </form>
  );
}
