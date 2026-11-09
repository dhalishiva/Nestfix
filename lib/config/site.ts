export const site = {
  name: 'Nestfix', currency: 'INR', locale: 'en-IN', timeZone: 'Asia/Kolkata',
  coverageCities: ['Noida', 'Delhi', 'Gurugram', 'Bengaluru', 'Mumbai'],
} as const;
export const rupees = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
