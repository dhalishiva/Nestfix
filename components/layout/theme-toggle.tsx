'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect,useState } from 'react';
import { Button } from '@/components/ui/button';
export function ThemeToggle() {
  const {resolvedTheme,setTheme}=useTheme();
  const [mounted,setMounted]=useState(false);
  useEffect(()=>setMounted(true),[]);
  return <Button variant="outline" aria-label={mounted && resolvedTheme==='dark'?'Use light theme':'Use dark theme'} onClick={()=>setTheme(resolvedTheme==='dark'?'light':'dark')}>
    {mounted && resolvedTheme==='dark'?<Sun size={19} aria-hidden/>:<Moon size={19} aria-hidden/>}
    <span className="hidden sm:inline">{mounted && resolvedTheme==='dark'?'Light mode':'Dark mode'}</span>
  </Button>;
}
