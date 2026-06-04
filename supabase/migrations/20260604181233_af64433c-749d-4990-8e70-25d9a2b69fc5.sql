
CREATE TABLE public.yeshivot (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  gender TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT,
  phone TEXT,
  website TEXT,
  ages TEXT,
  dorm BOOLEAN DEFAULT false,
  secular_studies BOOLEAN DEFAULT false,
  size TEXT,
  type TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  staff JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.yeshivot TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.yeshivot TO authenticated;
GRANT ALL ON public.yeshivot TO service_role;

ALTER TABLE public.yeshivot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view yeshivot" ON public.yeshivot FOR SELECT USING (true);
CREATE POLICY "Public can insert yeshivot" ON public.yeshivot FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update yeshivot" ON public.yeshivot FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete yeshivot" ON public.yeshivot FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_yeshivot_updated_at
BEFORE UPDATE ON public.yeshivot
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
