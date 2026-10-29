-- =============================================================================
-- Tabla dinámica para Tipos de Producto / Categorías (product_categories)
-- Ejecuta este script en el SQL Editor de Supabase si deseas usar una tabla dedicada:
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT 'category',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Si la tabla ya existía sin la columna icon, la agrega:
ALTER TABLE public.product_categories ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT 'category';

-- Habilitar RLS y permitir acceso público de lectura/escritura igual que tcg_games y tcg_sets
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read product_categories" ON public.product_categories;
CREATE POLICY "Allow public read product_categories"
  ON public.product_categories
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert product_categories" ON public.product_categories;
CREATE POLICY "Allow public insert product_categories"
  ON public.product_categories
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update product_categories" ON public.product_categories;
CREATE POLICY "Allow public update product_categories"
  ON public.product_categories
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete product_categories" ON public.product_categories;
CREATE POLICY "Allow public delete product_categories"
  ON public.product_categories
  FOR DELETE
  USING (true);

-- Insertar categorías base iniciales con sus iconos
INSERT INTO public.product_categories (name, icon) VALUES
  ('Sleeve', 'layers'),
  ('TCG', 'playing_cards'),
  ('Producto Sellado', 'inventory_2'),
  ('Accesorios', 'extension'),
  ('Binder/Folders', 'menu_book')
ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon;
