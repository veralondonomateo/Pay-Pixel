export type PaymentMethod = "mercadopago" | "contraentrega";
export type PaymentStatus = "pending" | "approved" | "failure" | "in_process";

export interface Order {
  id: string;
  brand_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  cedula: string | null;
  address: string;
  complement: string | null;
  city: string;
  state: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  shipping: number;
  discount: number;
  coupon_code: string | null;
  total: number;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  shopify_order_id: number | null;
  shopify_error: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  brand_id: string;
  product_id: string;
  name: string;
  variant: string | null;
  price: number;
  quantity: number;
  image: string | null;
  shopify_variant_id: number | null;
}

export interface AbandonedCart {
  id: string;
  brand_id: string;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  items: CheckoutItem[];
  total: number | null;
  recovery_step: number;
  last_sent_at: string | null;
  converted_at: string | null;
  created_at: string;
}

export interface CheckoutItem {
  id: string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
  image: string;
  shopifyVariantId?: number;
}

export interface BillingRecord {
  id: string;
  brand_id: string;
  month: string;
  total_orders: number;
  billable_orders: number;
  amount_cop: number;
  status: "pending" | "paid" | "failed" | "waived";
  mp_payment_id: string | null;
  created_at: string;
}
