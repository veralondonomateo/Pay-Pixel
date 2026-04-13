export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  cedula?: string;
  address: string;
  complement?: string;
  state: string;
  city: string;
  phone: string;
  paymentMethod: "mercadopago" | "contraentrega";
  saveInfo?: boolean;
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

export interface StateData {
  id: number;
  id_country: number;
  name: string;
  cities: string[];
}
