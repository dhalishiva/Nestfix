import {describe,it,expect} from 'vitest';
import {indianMobile,phoneE164,pincode} from '../lib/validation/common';
import {rupees,site} from '../lib/config/site';
describe('Nestfix India settings',()=>{
  it('formats INR with en-IN grouping',()=>expect(rupees(124999)).toMatch(/1,24,999/));
  it('uses Asia/Kolkata',()=>expect(site.timeZone).toBe('Asia/Kolkata'));
});
describe('validation',()=>{
  it('requires Indian 10 digit mobile',()=>{expect(indianMobile.safeParse('9876543210').success).toBe(true);expect(indianMobile.safeParse('1234567890').success).toBe(false);});
  it('normalizes +91',()=>expect(phoneE164.parse('9876543210')).toBe('+919876543210'));
  it('validates pincodes',()=>{expect(pincode.safeParse('201301').success).toBe(true);expect(pincode.safeParse('12345').success).toBe(false);});
});
