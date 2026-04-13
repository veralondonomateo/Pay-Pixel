// ── Shopify client — recibe credenciales por parámetro (multi-tenant) ─────────
const API_VERSION = "2024-10";

interface ShopifyClientOptions {
  domain: string;        // mitienda.myshopify.com
  accessToken: string;   // ya desencriptado
}

async function shopifyFetch<T>(
  opts: ShopifyClientOptions,
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `https://${opts.domain}/admin/api/${API_VERSION}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "X-Shopify-Access-Token": opts.accessToken,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify API ${res.status}: ${text}`);
  }
  return res.json();
}

async function shopifyGraphQL<T>(
  opts: ShopifyClientOptions,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const url = `https://${opts.domain}/admin/api/${API_VERSION}/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": opts.accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify GraphQL ${res.status}: ${text}`);
  }
  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };
  if (json.errors?.length) {
    throw new Error(
      `Shopify GraphQL errors: ${json.errors.map((e) => e.message).join(", ")}`
    );
  }
  return json.data as T;
}

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  inventory_quantity: number;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  status: string;
  variants: ShopifyVariant[];
  images: { id: number; src: string }[];
}

// ── In-memory product cache por tenant (5 min TTL) ────────────────────────────
const productCache = new Map<
  string,
  { products: ShopifyProduct[]; fetchedAt: number }
>();
const CACHE_TTL = 5 * 60 * 1000;

export async function getProducts(
  opts: ShopifyClientOptions
): Promise<ShopifyProduct[]> {
  const cacheKey = opts.domain;
  const now = Date.now();
  const cached = productCache.get(cacheKey);
  if (cached && now - cached.fetchedAt < CACHE_TTL) {
    return cached.products;
  }
  const data = await shopifyFetch<{ products: ShopifyProduct[] }>(
    opts,
    "/products.json?limit=250&status=active"
  );
  productCache.set(cacheKey, { products: data.products, fetchedAt: now });
  return data.products;
}

export async function getProductByHandle(
  opts: ShopifyClientOptions,
  handle: string
): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ products: ShopifyProduct[] }>(
    opts,
    `/products.json?handle=${encodeURIComponent(handle)}&limit=1`
  );
  if (data.products[0]) return data.products[0];

  // Fallback: buscar en cache de productos
  const all = await getProducts(opts);
  return all.find((p) => p.handle === handle) ?? null;
}

// ── Order creation ─────────────────────────────────────────────────────────────
export interface ShopifyOrderInput {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  complement?: string | null;
  city: string;
  state: string;
  items: Array<{
    name: string;
    variant?: string | null;
    price: number;
    quantity: number;
    shopifyVariantId?: number | null;
  }>;
  shipping: number;
  total: number;
  paymentMethod: "mercadopago" | "contraentrega";
  mpPaymentId?: string | null;
  paypixelOrderId: string;
  brandSlug: string;
}

export async function createShopifyOrder(
  opts: ShopifyClientOptions,
  input: ShopifyOrderInput
): Promise<number> {
  const isPaid = input.paymentMethod === "mercadopago";

  const orderBody: Record<string, unknown> = {
    email: input.email,
    financial_status: isPaid ? "paid" : "pending",
    currency: "COP",
    suppress_notifications: true,
    line_items: input.items.map((item) => {
      const base: Record<string, unknown> = {
        price: item.price.toFixed(2),
        quantity: item.quantity,
        requires_shipping: true,
      };
      if (item.shopifyVariantId) {
        base.variant_id = item.shopifyVariantId;
      } else {
        base.title = item.variant ? `${item.name} – ${item.variant}` : item.name;
      }
      return base;
    }),
    shipping_address: {
      first_name: input.firstName,
      last_name: input.lastName,
      address1: input.address,
      address2: input.complement ?? "",
      city: input.city,
      province: input.state,
      country_code: "CO",
      phone: `+57${input.phone.replace(/\D/g, "")}`,
    },
    note_attributes: [
      { name: "paypixel_order_id", value: input.paypixelOrderId },
      { name: "payment_method", value: input.paymentMethod },
      { name: "brand_slug", value: input.brandSlug },
      ...(input.mpPaymentId
        ? [{ name: "mp_payment_id", value: input.mpPaymentId }]
        : []),
    ],
    tags: `paypixel,${input.paymentMethod},brand:${input.brandSlug}`,
  };

  if (input.shipping > 0) {
    orderBody.shipping_lines = [
      {
        title: "Envío estándar",
        price: input.shipping.toFixed(2),
        code: "standard",
      },
    ];
  }

  if (isPaid) {
    orderBody.transactions = [
      {
        kind: "sale",
        status: "success",
        amount: input.total.toFixed(2),
        gateway: "mercadopago",
      },
    ];
  } else {
    orderBody.transactions = [
      {
        kind: "sale",
        status: "pending",
        amount: input.total.toFixed(2),
        gateway: "contraentrega",
      },
    ];
  }

  const result = await shopifyFetch<{
    order: { id: number; order_number: number };
  }>(opts, "/orders.json", {
    method: "POST",
    body: JSON.stringify({ order: orderBody }),
  });

  console.log(
    `[Shopify] Orden #${result.order.order_number} creada (ID: ${result.order.id}) para brand ${input.brandSlug}`
  );
  return result.order.id;
}

// ── Add line item via Order Editing API ───────────────────────────────────────
export async function addLineItemToShopifyOrder(
  opts: ShopifyClientOptions,
  shopifyOrderId: number,
  item: {
    name: string;
    variant?: string | null;
    price: number;
    quantity: number;
    shopifyVariantId?: number | null;
    shopifyVariantPrice?: number | null;
  }
): Promise<void> {
  const orderId = `gid://shopify/Order/${shopifyOrderId}`;
  const title = item.variant ? `${item.name} – ${item.variant}` : item.name;

  const beginData = await shopifyGraphQL<{
    orderEditBegin: {
      calculatedOrder: { id: string } | null;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>(
    opts,
    `mutation Begin($id: ID!) {
      orderEditBegin(id: $id) {
        calculatedOrder { id }
        userErrors { field message }
      }
    }`,
    { id: orderId }
  );

  const beginErrors = beginData.orderEditBegin.userErrors;
  if (beginErrors.length > 0) {
    throw new Error(`orderEditBegin: ${beginErrors.map((e) => e.message).join(", ")}`);
  }
  const calcId = beginData.orderEditBegin.calculatedOrder?.id;
  if (!calcId) throw new Error("orderEditBegin returned no calculatedOrder");

  let lineItemId: string | null = null;

  if (item.shopifyVariantId) {
    const addData = await shopifyGraphQL<{
      orderEditAddVariant: {
        calculatedLineItem: { id: string } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(
      opts,
      `mutation AddVariant($id: ID!, $variantId: ID!, $qty: Int!) {
        orderEditAddVariant(id: $id, variantId: $variantId, quantity: $qty, allowDuplicates: true) {
          calculatedLineItem { id }
          userErrors { field message }
        }
      }`,
      {
        id: calcId,
        variantId: `gid://shopify/ProductVariant/${item.shopifyVariantId}`,
        qty: item.quantity,
      }
    );

    const addErrors = addData.orderEditAddVariant.userErrors;
    if (addErrors.length > 0) {
      throw new Error(`orderEditAddVariant: ${addErrors.map((e) => e.message).join(", ")}`);
    }
    lineItemId = addData.orderEditAddVariant.calculatedLineItem?.id ?? null;

    const shopifyPrice = item.shopifyVariantPrice ?? null;
    const discountAmount = shopifyPrice !== null ? shopifyPrice - item.price : 0;
    if (lineItemId && discountAmount > 0) {
      await shopifyGraphQL(
        opts,
        `mutation SetDiscount($id: ID!, $lineItemId: ID!, $discount: OrderEditAppliedDiscountInput!) {
          orderEditSetLineItemDiscount(id: $id, lineItemId: $lineItemId, discount: $discount) {
            calculatedLineItem { id }
            userErrors { field message }
          }
        }`,
        {
          id: calcId,
          lineItemId,
          discount: {
            description: "Precio upsell post-compra",
            fixedValue: { amount: discountAmount.toFixed(2), currencyCode: "COP" },
          },
        }
      );
    }
  } else {
    const addData = await shopifyGraphQL<{
      orderEditAddCustomItem: {
        calculatedLineItem: { id: string } | null;
        userErrors: Array<{ field: string[]; message: string }>;
      };
    }>(
      opts,
      `mutation AddCustom($id: ID!, $title: String!, $price: MoneyInput!, $qty: Int!) {
        orderEditAddCustomItem(id: $id, title: $title, price: $price, quantity: $qty, requiresShipping: true) {
          calculatedLineItem { id }
          userErrors { field message }
        }
      }`,
      {
        id: calcId,
        title,
        price: { amount: item.price.toFixed(2), currencyCode: "COP" },
        qty: item.quantity,
      }
    );

    const addErrors = addData.orderEditAddCustomItem.userErrors;
    if (addErrors.length > 0) {
      throw new Error(`orderEditAddCustomItem: ${addErrors.map((e) => e.message).join(", ")}`);
    }
  }

  await shopifyGraphQL(
    opts,
    `mutation Commit($id: ID!, $staffNote: String!) {
      orderEditCommit(id: $id, notifyCustomer: false, staffNote: $staffNote) {
        order { id }
        userErrors { field message }
      }
    }`,
    { id: calcId, staffNote: `Upsell post-compra añadido via PayPixel` }
  );

  console.log(`[Shopify] Line item "${title}" añadido a orden ${shopifyOrderId}`);
}
