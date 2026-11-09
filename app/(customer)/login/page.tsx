'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LoaderCircle, LockKeyhole, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

const phoneSchema=z.string().regex(/^[6-9][0-9]{9}$/,'Enter a valid 10-digit Indian mobile number');
export default function LoginPage() {
  const router=useRouter();
  const [phone,setPhone]=useState(''),[otp,setOtp]=useState(''),[name,setName]=useState('');
  const [step,setStep]=useState<'phone'|'otp'>('phone');
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[cooldown,setCooldown]=useState(0);
  async function send() {
    const parsed=phoneSchema.safeParse(phone.trim());
    if(!parsed.success) {setMessage(parsed.error.issues[0].message);return;}
    if(Date.now()<cooldown){setMessage('Please wait 30 seconds before requesting another code.');return;}
    setBusy(true);setMessage('');
    try {
      const {error}=await createClient().auth.signInWithOtp({phone:'+91'+parsed.data,options:{shouldCreateUser:true}});
      if(error)throw error;
      setStep('otp');setCooldown(Date.now()+30000);setMessage('Verification code sent to +91 '+parsed.data+'.');
    } catch(e) {setMessage(e instanceof Error?e.message:'Unable to send code.');}
    finally{setBusy(false);}
  }
  async function verify() {
    if(!/^[0-9]{6}$/.test(otp)){setMessage('Enter your six-digit verification code.');return;}
    setBusy(true);setMessage('');
    try {
      const client=createClient();
      const {data,error}=await client.auth.verifyOtp({phone:'+91'+phone.trim(),token:otp,type:'sms'});
      if(error)throw error;
      if(!data.user) throw new Error('Sign-in could not be verified.');
      if(name.trim()) {
        const {error:updateError}=await client.from('profiles').update({name:name.trim().slice(0,120)}).eq('id',data.user.id);
        if(updateError)throw updateError;
      }
      router.push('/addresses');router.refresh();
    } catch(e) {setMessage(e instanceof Error?e.message:'Unable to verify code.');}
    finally{setBusy(false);}
  }
  return <main className="mx-auto max-w-lg px-5 py-14"><Link href="/" className="inline-flex min-h-11 items-center gap-2 text-primary"><ArrowLeft size={18}/> Back to services</Link>
    <div className="mt-6 rounded-3xl border bg-card p-7 shadow-soft md:p-10"><div className="grid size-14 place-items-center rounded-2xl bg-accent text-primary">{step==='phone'?<Phone/>:<LockKeyhole/>}</div>
      <h1 className="mt-5 font-display text-3xl font-extrabold">{step==='phone'?'Sign in to Nestfix':'Verify your number'}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{step==='phone'?'Enter your Indian mobile number to sign in securely with a one-time code.':'Enter the 6-digit code sent to your phone.'}</p>
      {step==='phone'?<form onSubmit={e=>{e.preventDefault();void send()}} className="mt-6 space-y-4"><label className="block text-sm font-semibold" htmlFor="phone">Mobile number</label><div className="flex overflow-hidden rounded-xl border"><span className="grid min-h-12 place-items-center border-r bg-secondary px-4">+91</span><input id="phone" autoComplete="tel-national" inputMode="numeric" maxLength={10} required className="min-w-0 flex-1 bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,''))}/></div><button disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground">{busy&&<LoaderCircle className="animate-spin" size={18}/>} Send code</button></form>:
        <form className="mt-6 space-y-4" onSubmit={e=>{e.preventDefault();void verify()}}><label htmlFor="otp" className="block text-sm font-semibold">Verification code</label><input id="otp" inputMode="numeric" autoComplete="one-time-code" value={otp} maxLength={6} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} className="min-h-12 w-full rounded-xl border bg-background px-4 tracking-[.4em] outline-none focus-visible:ring-2 focus-visible:ring-primary" required/><label htmlFor="name" className="block text-sm font-semibold">Your name (optional)</label><input id="name" value={name} maxLength={120} onChange={e=>setName(e.target.value)} className="min-h-12 w-full rounded-xl border bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Your full name"/><button disabled={busy} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground">{busy?'Verifying...':'Verify and continue'}</button><button type="button" disabled={busy} onClick={()=>void send()} className="min-h-11 w-full text-sm text-primary underline">Resend code (after 30 seconds)</button></form>}
      {message&&<p role="status" className="mt-5 rounded-xl bg-secondary p-3 text-sm">{message}</p>}
      <p className="mt-6 text-xs text-muted-foreground">Standard SMS charges may apply. OTP delivery requires a configured Supabase SMS provider.</p>
    </div>
  </main>;
}
