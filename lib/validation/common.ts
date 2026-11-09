import { z } from 'zod';
export const indianMobile = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');
export const phoneE164 = indianMobile.transform((mobile) => `+91${mobile}`);
export const pincode = z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code');
export const coordinates = z.object({lat:z.number().min(-90).max(90),lng:z.number().min(-180).max(180)});
export const addressInput = z.object({
  label: z.enum(['Home', 'Work', 'Other']), house: z.string().min(2).max(140),
  area: z.string().min(2).max(140), landmark: z.string().max(140).optional(),
  pincode, cityId: z.string().uuid(), coords: coordinates.optional(),
});
