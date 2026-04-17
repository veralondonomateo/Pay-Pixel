-- Agrega la columna default_product_handle a la tabla brands
-- Permite que cada marca elija su producto principal para el enlace de checkout

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS default_product_handle TEXT DEFAULT NULL;

COMMENT ON COLUMN brands.default_product_handle IS 'Handle del producto de Shopify que se usa por defecto en el enlace de checkout';
