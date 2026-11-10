import { useEffect, useRef, type ReactNode } from 'react';
import { Icon, Glyph } from './Icon';
import { useCart, useCatalog, useToast } from '../state';
import type { Service } from '../lib/types';

export function Sheet({ title, onClose, children, footer, label }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const first = ref.current?.querySelector<HTMLElement>('input,select,textarea') || ref.current?.querySelector<HTMLElement>('[data-close]');
    first?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label || title} ref={ref}>
        <div className="grab" />
        <div className="shead"><h2>{title}</h2><button className="iconbtn" data-close onClick={onClose} aria-label="Close"><Icon name="x" /></button></div>
        <div className="sbody">{children}</div>
        {footer && <div className="sfoot">{footer}</div>}
      </div>
    </div>
  );
}

export function Art({ svc, catId, className = '' }: { svc?: Service; catId?: string; className?: string }) {
  const { cat } = useCatalog();
  const c = cat(svc?.category_id || catId || '');
  return <div className={`art ${className}`} style={{ ['--h' as string]: c?.hue || '#56606f' }}><Glyph name={c?.icon || 'spark'} /></div>;
}

export function Qty({ id }: { id: string }) {
  const { items, add } = useCart();
  const toast = useToast();
  const q = items[id] || 0;
  if (!q) return <button className="add" onClick={() => { add(id, 1); toast('Added to cart'); }}>Add</button>;
  return (
    <div className="stepper">
      <button onClick={() => add(id, -1)} aria-label="Remove one"><Icon name="minus" /></button>
      <span aria-live="polite">{q}</span>
      <button onClick={() => add(id, 1)} aria-label="Add one" disabled={q >= 20}><Icon name="plus" /></button>
    </div>
  );
}

export function Spinner() { return <span className="spinner" aria-hidden="true" />; }

export function Empty({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return <div className="empty"><span className="ring"><Icon name={icon} /></span><h2>{title}</h2>{children}</div>;
}

export function Skeleton({ h = 20, w = '100%', r = 12 }: { h?: number; w?: number | string; r?: number }) {
  return <div className="sk" style={{ height: h, width: w, borderRadius: r }} />;
}

export function Switch({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return <button role="switch" aria-checked={on} aria-label={label} className={`switch ${on ? 'on' : ''}`} onClick={() => onChange(!on)} disabled={disabled} />;
}
