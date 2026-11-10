import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Spinner } from '../components/ui';
import { supabase, errMsg } from '../lib/supabase';
import { useAuth, useToast } from '../state';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const safeNext = (n: string | null) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/');

function Password({ id, value, onChange, auto, invalid }: { id: string; value: string; onChange: (v: string) => void; auto: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pwd">
      <input id={id} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={auto} aria-invalid={invalid} />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? 'Hide' : 'Show'}</button>
    </div>
  );
}

export function Login() {
  const [sp] = useSearchParams();
  const next = safeNext(sp.get('next'));
  const nav = useNavigate();
  const toast = useToast();
  const { session, ready } = useAuth();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);

  useEffect(() => { if (ready && session) nav(next, { replace: true }); }, [ready, session, nav, next]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setErr('Enter a valid email address.'); return; }
    if (!pw) { setErr('Enter your password.'); return; }
    setBusy(true); setErr(''); setUnconfirmed(false);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
    setBusy(false);
    if (error) { setErr(errMsg(error)); setUnconfirmed(/not confirmed/i.test(error.message)); return; }
    toast('Welcome back');
  }
  async function resend() {
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: `${location.origin}/login` } });
    toast(error ? errMsg(error) : 'Confirmation email sent. Check your inbox.', error ? 'err' : 'ok');
  }

  return (
    <div className="auth">
      <div><h1>Log in</h1><p className="muted">Book services, track professionals and manage your bookings.</p></div>
      {sp.get('confirmed') && <div className="banner good"><Icon name="check" /><div>Email confirmed. Log in to continue.</div></div>}
      <form onSubmit={submit} noValidate>
        <label className="field">Email<input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" /></label>
        <label className="field"><span className="row"><span className="sp">Password</span><Link className="link sm" to="/forgot-password">Forgot password?</Link></span>
          <Password id="password" value={pw} onChange={setPw} auto="current-password" /></label>
        {err && <span className="err" role="alert">{err}</span>}
        {unconfirmed && <button type="button" className="link sm" style={{ justifySelf: 'start' }} onClick={resend}>Resend confirmation email</button>}
        <button className="btn w" disabled={busy}>{busy && <Spinner />}Log in</button>
      </form>
      <p className="muted" style={{ textAlign: 'center' }}>New to Nestfix? <Link className="link" to={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></p>
    </div>
  );
}

export function Signup() {
  const [sp] = useSearchParams();
  const next = safeNext(sp.get('next'));
  const nav = useNavigate();
  const toast = useToast();
  const { session, ready } = useAuth();
  const [f, setF] = useState({ name: '', email: '', pw: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState('');

  useEffect(() => { if (ready && session) nav(next, { replace: true }); }, [ready, session, nav, next]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = 'Enter your name.';
    if (!EMAIL_RE.test(f.email.trim())) er.email = 'Enter a valid email address.';
    if (f.pw.length < 8) er.pw = 'Use at least 8 characters.';
    setErr(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: f.email.trim(), password: f.pw,
      options: { data: { full_name: f.name.trim() }, emailRedirectTo: `${location.origin}/login?confirmed=1` },
    });
    setBusy(false);
    if (error) { setErr({ form: errMsg(error) }); return; }
    if (data.session) { toast(`Welcome, ${f.name.trim().split(' ')[0]}`); return; }
    // Supabase returns a user with no identities when the email is already registered.
    if (data.user && data.user.identities && data.user.identities.length === 0) { setErr({ form: 'An account with this email already exists. Log in instead.' }); return; }
    setSent(f.email.trim());
  }

  if (sent) return (
    <div className="auth">
      <div className="empty" style={{ padding: '20px 0' }}><span className="ring"><Icon name="mail" /></span><h1>Check your inbox</h1>
        <p className="muted">We sent a confirmation link to <b>{sent}</b>. Open it to activate your account, then log in.</p></div>
      <Link className="btn w" to={`/login?next=${encodeURIComponent(next)}`}>Go to log in</Link>
    </div>
  );

  return (
    <div className="auth">
      <div><h1>Create your account</h1><p className="muted">It takes 30 seconds. You'll need it to book.</p></div>
      <form onSubmit={submit} noValidate>
        <label className="field">Full name<input id="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" placeholder="Shown to your professional" aria-invalid={!!err.name} />{err.name && <span className="err">{err.name}</span>}</label>
        <label className="field">Email<input id="email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" placeholder="you@example.com" aria-invalid={!!err.email} />{err.email && <span className="err">{err.email}</span>}</label>
        <label className="field">Password<Password id="password" value={f.pw} onChange={(v) => setF({ ...f, pw: v })} auto="new-password" invalid={!!err.pw} /><span className="help">At least 8 characters</span>{err.pw && <span className="err">{err.pw}</span>}</label>
        {err.form && <span className="err" role="alert">{err.form}</span>}
        <button className="btn w" disabled={busy}>{busy && <Spinner />}Create account</button>
      </form>
      <p className="muted" style={{ textAlign: 'center' }}>Already have an account? <Link className="link" to={`/login?next=${encodeURIComponent(next)}`}>Log in</Link></p>
    </div>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setErr('Enter a valid email address.'); return; }
    setBusy(true); setErr('');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/reset-password` });
    setBusy(false);
    if (error) { setErr(errMsg(error)); return; }
    setSent(true);
  }
  return (
    <div className="auth">
      <div><h1>Reset your password</h1><p className="muted">Enter your account email and we'll send you a reset link.</p></div>
      {sent ? <div className="banner good"><Icon name="mail" /><div>If an account exists for {email.trim()}, a reset link is on its way.</div></div> : (
        <form onSubmit={submit} noValidate>
          <label className="field">Email<input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          {err && <span className="err">{err}</span>}
          <button className="btn w" disabled={busy}>{busy && <Spinner />}Send reset link</button>
        </form>)}
      <p style={{ textAlign: 'center' }}><Link className="link" to="/login">Back to log in</Link></p>
    </div>
  );
}

export function ResetPassword() {
  const { session, ready } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) { setErr('Use at least 8 characters.'); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { setErr(errMsg(error)); return; }
    toast('Password updated'); nav('/');
  }
  if (ready && !session) return (
    <div className="auth"><h1>Link expired</h1><p className="muted">This reset link is no longer valid. Request a new one.</p><Link className="btn w" to="/forgot-password">Request new link</Link></div>
  );
  return (
    <div className="auth">
      <div><h1>Choose a new password</h1></div>
      <form onSubmit={submit} noValidate>
        <label className="field">New password<Password id="password" value={pw} onChange={setPw} auto="new-password" /><span className="help">At least 8 characters</span></label>
        {err && <span className="err">{err}</span>}
        <button className="btn w" disabled={busy}>{busy && <Spinner />}Save password</button>
      </form>
    </div>
  );
}
