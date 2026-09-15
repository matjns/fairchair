ALTER TABLE public.reading_article_images ADD COLUMN IF NOT EXISTS image_slot integer NOT NULL DEFAULT 0;

DELETE FROM public.reading_article_images a
USING public.reading_article_images b
WHERE a.source_url = b.source_url
  AND (a.created_at, a.id) > (b.created_at, b.id);

ALTER TABLE public.reading_article_images DROP CONSTRAINT IF EXISTS reading_article_images_article_id_paragraph_index_key;
ALTER TABLE public.reading_article_images ADD CONSTRAINT reading_article_images_article_paragraph_slot_key UNIQUE (article_id, paragraph_index, image_slot);
ALTER TABLE public.reading_article_images ADD CONSTRAINT reading_article_images_source_url_key UNIQUE (source_url);
ALTER TABLE public.reading_article_images ADD CONSTRAINT reading_article_images_image_slot_check CHECK (image_slot >= 0);