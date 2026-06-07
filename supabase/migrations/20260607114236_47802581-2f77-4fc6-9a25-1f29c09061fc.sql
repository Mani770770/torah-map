ALTER TABLE public.yeshivot
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS maps_url text;