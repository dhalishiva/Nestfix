import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { dayName, dayNum, fmtTime, istToday } from '../lib/format';
import { SLOT_GROUPS, SLOT_REASON } from '../lib/content';
import { Skeleton } from './ui';
import { Icon } from './Icon';

type SlotRow = { slot_time: string; available: boolean; reason: string | null };

/** Date strip + time grid backed by live availability from the server. */
export function SlotPicker({ city, items, date, time, onDate, onTime, keepTime }: {
  city: string; items: { id: string; qty: number }[]; date: string | null; time: string | null;
  onDate: (d: string) => void; onTime: (t: string | null) => void; keepTime?: string | null;
}) {
  const days = Array.from({ length: 7 }, (_, i) => istToday(i));
  const [rows, setRows] = useState<SlotRow[] | null>(null);
  const [err, setErr] = useState('');
  const d = date || days[0];

  useEffect(() => {
    let live = true;
    setRows(null); setErr('');
    supabase.rpc('available_slots', { p_city: city, p_date: d, p_items: items }).then(({ data, error }) => {
      if (!live) return;
      if (error) { setErr('Could not load time slots. Check your connection and try again.'); return; }
      const r = (data as SlotRow[]).map((x) => ({ ...x, slot_time: x.slot_time.slice(0, 5) }));
      setRows(r);
      // If today has nothing left, jump to the next day automatically.
      if (!date && !r.some((x) => x.available) && d === days[0]) onDate(days[1]);
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, d, JSON.stringify(items)]);

  const map = new Map((rows || []).map((r) => [r.slot_time, r]));
  const noPro = rows?.every((r) => r.reason === 'no_pro');
  const openCount = rows?.filter((r) => r.available || r.slot_time === keepTime).length ?? 0;

  return (
    <>
      <div className="dates" role="listbox" aria-label="Date">{days.map((x, i) => (
        <button key={x} role="option" aria-selected={d === x} className={`date ${d === x ? 'on' : ''}`} onClick={() => { onDate(x); onTime(null); }}>
          {i === 0 ? 'Today' : i === 1 ? 'Tmrw' : dayName(x)}<b>{dayNum(x)}</b>
        </button>))}
      </div>
      {err && <div className="banner bad"><Icon name="alert" /><div>{err}</div></div>}
      {noPro && <div className="banner warn"><Icon name="info" /><div>{SLOT_REASON.no_pro} Remove items from other categories, then book them separately.</div></div>}
      {!rows && !err && <div className="stack"><Skeleton h={14} w={90} /><Skeleton h={44} /><Skeleton h={44} /></div>}
      {rows && !noPro && openCount === 0 && <p className="muted sm">No open slots on this day. Try the next date.</p>}
      {rows && !noPro && SLOT_GROUPS.map(([g, ts]) => (
        <div key={g} style={{ display: 'grid', gap: 8 }}>
          <span className="slab">{g}</span>
          <div className="slots">{ts.map((t) => {
            const r = map.get(t);
            const ok = !!r?.available || t === keepTime;
            return (
              <button key={t} className={`slot ${time === t ? 'on' : ''}`} disabled={!ok} title={!ok && r?.reason ? SLOT_REASON[r.reason] : undefined}
                onClick={() => onTime(t)}>{fmtTime(t).replace(':00', '')}</button>
            );
          })}</div>
        </div>))}
    </>
  );
}
