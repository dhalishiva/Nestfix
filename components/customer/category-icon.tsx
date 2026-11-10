import type { LucideIcon } from 'lucide-react';
import { Bug, Droplets, Hammer, Heart, House, Paintbrush, PlugZap, Scissors, Sparkles, Wind, Wrench } from 'lucide-react';

export function categoryIconFor(name: string): LucideIcon {
  if (/ac service|air condition/i.test(name)) return Wind;
  if (/clean/i.test(name)) return House;
  if (/salon|groom/i.test(name)) return Scissors;
  if (/massage|spa/i.test(name)) return Heart;
  if (/electric/i.test(name)) return PlugZap;
  if (/plumb/i.test(name)) return Droplets;
  if (/carpent/i.test(name)) return Hammer;
  if (/pest/i.test(name)) return Bug;
  if (/paint/i.test(name)) return Paintbrush;
  if (/appliance/i.test(name)) return Wrench;
  return Sparkles;
}
