CREATE TABLE public.reading_article_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id text NOT NULL,
  paragraph_index integer NOT NULL CHECK (paragraph_index >= 0),
  storage_path text NOT NULL,
  alt_text text NOT NULL,
  caption text NOT NULL,
  source_url text NOT NULL,
  creator text,
  license text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_id, paragraph_index)
);

GRANT SELECT ON public.reading_article_images TO anon, authenticated;
GRANT ALL ON public.reading_article_images TO service_role;

ALTER TABLE public.reading_article_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read article image details"
ON public.reading_article_images
FOR SELECT
TO anon, authenticated
USING (true);

CREATE INDEX reading_article_images_article_id_idx
ON public.reading_article_images (article_id, paragraph_index);

CREATE POLICY "Service manages article image files"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'article-images')
WITH CHECK (bucket_id = 'article-images');