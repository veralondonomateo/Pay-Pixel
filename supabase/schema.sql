-- ============================================================
-- PayPixel — Supabase Schema + RLS
-- Ejecutar en el SQL Editor de Supabase (en orden)
-- ============================================================

-- Habilitar extensiones necesarias
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLA: brands (tenants)
-- ============================================================
create table if not exists public.brands (
  id                      uuid primary key default gen_random_uuid(),
  slug                    text unique not null,
  name                    text not null,
  logo_url                text,
  primary_color           text default '#6366f1',
  shopify_domain          text,
  shopify_access_token    text,           -- almacenado encriptado via app layer
  mp_access_token         text,           -- almacenado encriptado
  meta_pixel_id           text,
  meta_conversions_token  text,           -- almacenado encriptado
  tiktok_pixel_id         text,
  tiktok_events_token     text,           -- almacenado encriptado
  whatsapp_enabled        boolean default false,
  whatsapp_phone_id       text,           -- Meta Cloud API phone_id
  whatsapp_token          text,           -- almacenado encriptado
  email_recovery_enabled  boolean default false,
  plan                    text default 'free' check (plan in ('free', 'paid')),
  billing_email           text,
  is_active               boolean default true,
  launch_promo            boolean default false, -- 3 meses gratis lanzamiento
  created_at              timestamptz default now()
);

-- RLS: la marca solo puede leer/editar sus propios datos
alter table public.brands enable row level security;

-- Los usuarios autenticados solo ven su propia marca
-- (brand_id se resuelve via user_id → brand_members)
create policy "brands: owner read"
  on public.brands for select
  using (
    id in (
      select brand_id from public.brand_members
      where user_id = auth.uid()
    )
  );

create policy "brands: owner update"
  on public.brands for update
  using (
    id in (
      select brand_id from public.brand_members
      where user_id = auth.uid()
    )
  );

-- Service role puede hacer todo (para APIs server-side)
create policy "brands: service role all"
  on public.brands for all
  using (auth.role() = 'service_role');

-- ============================================================
-- TABLA: brand_members (relación user ↔ brand)
-- ============================================================
create table if not exists public.brand_members (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  brand_id   uuid not null references public.brands(id) on delete cascade,
  role       text default 'owner' check (role in ('owner', 'admin', 'viewer')),
  created_at timestamptz default now(),
  unique(user_id, brand_id)
);

alter table public.brand_members enable row level security;

create policy "brand_members: own rows"
  on public.brand_members for select
  using (user_id = auth.uid());

create policy "brand_members: service role all"
  on public.brand_members for all
  using (auth.role() = 'service_role');

-- ============================================================
-- TABLA: orders
-- ============================================================
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  brand_id          uuid not null references public.brands(id),
  email             text not null,
  first_name        text not null,
  last_name         text not null,
  phone             text not null,
  cedula            text,
  address           text not null,
  complement        text,
  city              text not null,
  state             text not null,
  payment_method    text not null check (payment_method in ('mercadopago', 'contraentrega')),
  payment_status    text not null default 'pending'
                      check (payment_status in ('pending', 'approved', 'failure', 'in_process')),
  subtotal          numeric(12,2) not null,
  shipping          numeric(12,2) default 0,
  discount          numeric(12,2) default 0,
  coupon_code       text,
  total             numeric(12,2) not null,
  mp_preference_id  text,
  mp_payment_id     text,
  shopify_order_id  bigint,
  shopify_error     text,
  created_at        timestamptz default now()
);

create index on public.orders (brand_id);
create index on public.orders (brand_id, created_at desc);
create index on public.orders (brand_id, payment_status);

alter table public.orders enable row level security;

create policy "orders: brand owner read"
  on public.orders for select
  using (
    brand_id in (
      select brand_id from public.brand_members
      where user_id = auth.uid()
    )
  );

create policy "orders: service role all"
  on public.orders for all
  using (auth.role() = 'service_role');

-- ============================================================
-- TABLA: order_items
-- ============================================================
create table if not exists public.order_items (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders(id) on delete cascade,
  brand_id            uuid not null references public.brands(id),
  product_id          text not null,
  name                text not null,
  variant             text,
  price               numeric(12,2) not null,
  quantity            int not null default 1,
  image               text,
  shopify_variant_id  bigint
);

create index on public.order_items (order_id);
create index on public.order_items (brand_id);

alter table public.order_items enable row level security;

create policy "order_items: brand owner read"
  on public.order_items for select
  using (
    brand_id in (
      select brand_id from public.brand_members
      where user_id = auth.uid()
    )
  );

create policy "order_items: service role all"
  on public.order_items for all
  using (auth.role() = 'service_role');

-- ============================================================
-- TABLA: abandoned_carts
-- ============================================================
create table if not exists public.abandoned_carts (
  id              uuid primary key default gen_random_uuid(),
  brand_id        uuid not null references public.brands(id),
  email           text,
  phone           text,
  first_name      text,
  items           jsonb not null default '[]',
  total           numeric(12,2),
  recovery_step   int default 0,   -- 0=nuevo, 1=whatsapp30m, 2=email2h, 3=email24h, 4=whatsapp72h
  last_sent_at    timestamptz,
  converted_at    timestamptz,
  created_at      timestamptz default now()
);

create index on public.abandoned_carts (brand_id, converted_at)
  where converted_at is null;
create index on public.abandoned_carts (brand_id, created_at desc);

alter table public.abandoned_carts enable row level security;

create policy "abandoned_carts: brand owner read"
  on public.abandoned_carts for select
  using (
    brand_id in (
      select brand_id from public.brand_members
      where user_id = auth.uid()
    )
  );

create policy "abandoned_carts: service role all"
  on public.abandoned_carts for all
  using (auth.role() = 'service_role');

-- ============================================================
-- TABLA: recovery_events
-- ============================================================
create table if not exists public.recovery_events (
  id                uuid primary key default gen_random_uuid(),
  brand_id          uuid not null references public.brands(id),
  abandoned_cart_id uuid not null references public.abandoned_carts(id) on delete cascade,
  channel           text not null check (channel in ('whatsapp', 'email')),
  status            text not null check (status in ('sent', 'failed', 'delivered', 'read')),
  sent_at           timestamptz default now()
);

create index on public.recovery_events (brand_id);
create index on public.recovery_events (abandoned_cart_id);

alter table public.recovery_events enable row level security;

create policy "recovery_events: brand owner read"
  on public.recovery_events for select
  using (
    brand_id in (
      select brand_id from public.brand_members
      where user_id = auth.uid()
    )
  );

create policy "recovery_events: service role all"
  on public.recovery_events for all
  using (auth.role() = 'service_role');

-- ============================================================
-- TABLA: billing_records
-- ============================================================
create table if not exists public.billing_records (
  id              uuid primary key default gen_random_uuid(),
  brand_id        uuid not null references public.brands(id),
  month           text not null,    -- formato: '2025-01'
  total_orders    int default 0,
  billable_orders int default 0,    -- orders > 100 threshold
  amount_cop      int default 0,    -- billable_orders * 1500
  status          text default 'pending' check (status in ('pending', 'paid', 'failed', 'waived')),
  mp_payment_id   text,
  created_at      timestamptz default now(),
  unique(brand_id, month)
);

create index on public.billing_records (brand_id);

alter table public.billing_records enable row level security;

create policy "billing_records: brand owner read"
  on public.billing_records for select
  using (
    brand_id in (
      select brand_id from public.brand_members
      where user_id = auth.uid()
    )
  );

create policy "billing_records: service role all"
  on public.billing_records for all
  using (auth.role() = 'service_role');

-- ============================================================
-- TABLA: upsell_products (configuración de upsells por tenant)
-- ============================================================
create table if not exists public.upsell_products (
  id                  uuid primary key default gen_random_uuid(),
  brand_id            uuid not null references public.brands(id) on delete cascade,
  shopify_handle      text not null,
  name                text not null,
  variant             text,
  price               numeric(12,2) not null,
  compare_price       numeric(12,2),
  image               text,
  benefit             text,
  stock               int default 99,
  sold_today          int default 0,
  position            int default 0,   -- orden en el checkout
  is_active           boolean default true,
  show_in_checkout    boolean default true,   -- upsell pre-pago
  show_post_purchase  boolean default true,   -- upsell post-compra
  created_at          timestamptz default now()
);

create index on public.upsell_products (brand_id, position);

alter table public.upsell_products enable row level security;

create policy "upsell_products: brand owner all"
  on public.upsell_products for all
  using (
    brand_id in (
      select brand_id from public.brand_members
      where user_id = auth.uid()
    )
  );

create policy "upsell_products: service role all"
  on public.upsell_products for all
  using (auth.role() = 'service_role');

-- Public read para el checkout (no requiere auth)
create policy "upsell_products: public read"
  on public.upsell_products for select
  using (is_active = true);

-- ============================================================
-- TABLA: coupons (códigos de descuento por tenant)
-- ============================================================
create table if not exists public.coupons (
  id            uuid primary key default gen_random_uuid(),
  brand_id      uuid not null references public.brands(id) on delete cascade,
  code          text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10,2) not null,
  max_uses      int,
  uses          int default 0,
  expires_at    timestamptz,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  unique(brand_id, code)
);

alter table public.coupons enable row level security;

create policy "coupons: brand owner all"
  on public.coupons for all
  using (
    brand_id in (
      select brand_id from public.brand_members
      where user_id = auth.uid()
    )
  );

create policy "coupons: service role all"
  on public.coupons for all
  using (auth.role() = 'service_role');

-- ============================================================
-- FUNCIÓN: get_my_brand_id
-- Retorna el brand_id del usuario autenticado (primer brand como owner)
-- ============================================================
create or replace function public.get_my_brand_id()
returns uuid
language sql
security definer
stable
as $$
  select brand_id
  from public.brand_members
  where user_id = auth.uid()
    and role = 'owner'
  limit 1;
$$;

-- ============================================================
-- FUNCIÓN: create_brand_for_user
-- Crea la marca y el brand_member en una sola transacción
-- Se llama desde el servidor tras el registro
-- ============================================================
create or replace function public.create_brand_for_user(
  p_user_id  uuid,
  p_name     text,
  p_slug     text,
  p_email    text
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_brand_id uuid;
begin
  insert into public.brands (name, slug, billing_email, launch_promo)
  values (p_name, p_slug, p_email, true)
  returning id into v_brand_id;

  insert into public.brand_members (user_id, brand_id, role)
  values (p_user_id, v_brand_id, 'owner');

  return v_brand_id;
end;
$$;
