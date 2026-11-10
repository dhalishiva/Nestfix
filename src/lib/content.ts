export const FAQS: [string, string][] = [
  ['What if I am not happy with the service?', 'Tell us within 30 days from My bookings and we send a professional to redo the work at no cost.'],
  ['Do I need to provide any equipment?', 'No. Professionals bring their own tools and consumables. Spare parts, if needed, are charged at MRP.'],
  ['Can I reschedule or cancel?', 'Yes, from My bookings. Changes made more than 3 hours before the slot are free. Cancelling a prepaid booking later than that costs ₹100.'],
  ['How do I pay?', 'Pay online with UPI or card when you book, or choose to pay the professional after the service.'],
];

export const BANNERS = [
  { title: 'Deep cleaning, done in a day', text: 'Trained 2-person teams with machines', code: 'FIRST20', cat: 'clean', bg: 'linear-gradient(135deg,#16594c,#0e3a32)' },
  { title: 'Salon at home, from ₹69', text: 'Sealed, single-use kits every visit', code: 'NEST100', cat: 'salon', bg: 'linear-gradient(135deg,#a6466c,#5e2440)' },
  { title: 'Beat the heat with a foam-jet service', text: 'Cooling check after every service', code: 'SAVE250', cat: 'ac', bg: 'linear-gradient(135deg,#3a78b5,#1d3f66)' },
];

export const CANCEL_REASONS = ['Booked by mistake', 'I need a different time', 'Found someone else', 'Service no longer needed'];
export const GOOD_TAGS = ['On time', 'Polite', 'Skilled', 'Clean work', 'Good value'];
export const BAD_TAGS = ['Late', 'Rushed', 'Messy', 'Overcharged', 'Rude'];
export const SLOT_GROUPS: [string, string[]][] = [
  ['Morning', ['08:00', '09:00', '10:00', '11:00']],
  ['Afternoon', ['12:00', '13:00', '14:00', '15:00']],
  ['Evening', ['16:00', '17:00', '18:00', '19:00']],
];
export const SLOT_REASON: Record<string, string> = {
  too_soon: 'Too soon. Slots open 90 minutes ahead.',
  too_late: 'This job would run past 9 PM.',
  full: 'All professionals are booked at this time.',
  no_pro: 'No single professional does all these services.',
  out_of_range: 'Pick a date in the next 7 days.',
};
