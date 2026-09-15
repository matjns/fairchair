CREATE TABLE public.reading_article_texts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id text NOT NULL UNIQUE,
  title text NOT NULL,
  topic text,
  subtopic text,
  level text NOT NULL,
  body text NOT NULL,
  facts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reading_article_texts TO authenticated;
GRANT SELECT ON public.reading_article_texts TO anon;
GRANT ALL ON public.reading_article_texts TO service_role;
ALTER TABLE public.reading_article_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read generated articles" ON public.reading_article_texts FOR SELECT USING (true);