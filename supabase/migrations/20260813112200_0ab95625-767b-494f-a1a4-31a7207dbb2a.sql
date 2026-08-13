ALTER TABLE public.yeshivot
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS price_period text,
  ADD COLUMN IF NOT EXISTS price_note text;