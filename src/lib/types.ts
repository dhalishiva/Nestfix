export type City = { id: string; name: string };
export type Category = { id: string; name: string; icon: string; hue: string; tagline: string; sort: number };
export type Service = {
  id: string; category_id: string; sub: string; name: string; description: string;
  price: number; mrp: number; duration_min: number; rating: number; review_count: number;
  includes: string[]; excludes: string[]; is_bestseller: boolean; is_active: boolean; sort: number;
};
export type Coupon = { code: string; title: string; description: string; kind: 'flat' | 'pct'; value: number; max_discount: number | null; min_order: number; first_order_only: boolean; is_active: boolean };
export type Address = { id: string; label: 'Home' | 'Work' | 'Other'; house: string; area: string; landmark: string | null; city_id: string; pincode: string };
export type Profile = { id: string; full_name: string; phone: string | null; role: 'customer' | 'admin' };
export type QuoteCoupon = { code: string; title?: string; description?: string; ok: boolean; amount: number; reason: 'empty' | 'first_order' | 'min_order' | 'invalid' | null; need: number };
export type Quote = {
  lines: { id: string; name: string; category_id: string; qty: number; price: number; mrp: number; duration_min: number }[];
  count: number; item_total: number; mrp_total: number; discount: number; visit_fee: number; free_visit_at: number;
  total: number; duration_min: number; span_hours: number; categories: string[];
  coupon: QuoteCoupon | null; coupons: QuoteCoupon[]; first_order: boolean;
};
export type BookingStatus = 'confirmed' | 'pro_assigned' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';
export type Booking = {
  id: string; code: string; user_id: string; customer_name: string; customer_email: string; status: BookingStatus;
  scheduled_date: string; slot_time: string; span_hours: number; city_id: string;
  address: { label: string; house: string; area: string; landmark: string | null; pincode: string; city: string };
  item_total: number; mrp_total: number; discount: number; visit_fee: number; total: number; coupon_code: string | null;
  payment_method: 'upi' | 'card' | 'cash'; payment_status: 'pending' | 'paid' | 'refunded' | 'partially_refunded' | 'void';
  refund_amount: number; cancel_fee: number; cancel_reason: string | null; pro_id: string | null; start_pin: string;
  rating: number | null; review_tags: string[] | null; review_comment: string | null; created_at: string;
  booking_items: { service_id: string; name: string; unit_price: number; unit_mrp: number; qty: number; duration_min: number }[];
  pro: { name: string; rating: number; phone: string; jobs_done: number } | null;
  booking_events?: { id: number; status: string; note: string | null; created_at: string }[];
};
export const BOOKING_SELECT = '*, booking_items(service_id,name,unit_price,unit_mrp,qty,duration_min), pro:pros(name,rating,phone,jobs_done)';
