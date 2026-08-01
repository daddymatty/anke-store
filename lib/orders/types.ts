import type { Money } from "@/lib/catalog/types";
import type { AppliedPromo } from "@/lib/promo";

export type DeliveryMethod = "np-warehouse" | "np-postomat" | "np-address";
export type PaymentMethod = "online" | "installments" | "cod";
export type PaymentStatus = "pending" | "paid" | "cod" | "failed";
export type OrderStatus = "new" | "processing" | "shipped" | "done" | "canceled";

export type OrderItem = {
  slug: string;
  sku: string;
  title: string;
  size: string;
  qty: number;
  price: Money;
  image: string;
};

export type Order = {
  number: string;
  createdAt: string; // ISO
  status: OrderStatus;
  items: OrderItem[];
  totals: {
    subtotal: Money;
    discount: Money;
    shipping: Money | null;
    total: Money;
  };
  promo: AppliedPromo | null;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  delivery: {
    method: DeliveryMethod;
    cityName: string;
    cityRef?: string;
    warehouseName?: string;
    warehouseRef?: string;
    addressLine?: string;
    ttn?: string;
  };
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    invoiceId?: string;
    receiptId?: string;
  };
  comment?: string;
  /** UTM/click-id атрибуція (Етап 9) */
  attribution?: Record<string, string>;
  /** id замовлення в Medusa, якщо створене там */
  medusaOrderId?: string;
};

export type PlaceOrderInput = {
  customer: Order["customer"];
  delivery: Omit<Order["delivery"], "ttn">;
  paymentMethod: PaymentMethod;
  comment?: string;
  promoCode?: string;
  attribution?: Record<string, string>;
};
