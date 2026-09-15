import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  articleId: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  paragraphs: z.array(z.string().min(1).max(5000)).min(1).max(10),
});

interface CommonsPage {
  title?: string;
  imageinfo?: Array<{
    thumburl?: string;
    mime?: string;
    extmetadata?: Record<string, { value?: string }>;
    descriptionurl?: string;
  }>;
}

interface StoredImage {
  paragraphIndex: number;
  storagePath: string;
  altText: string;
  caption: string;
  sourceUrl: string;
  creator: string | null;
  license: string | null;
}

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const specialQueries = (title: string): string[] | null => {
  if (!title.toLowerCase().includes("boeing 747")) return null;
  return [
    "Boeing 747 first flight 1969",
    "Boeing Everett Factory 747 assembly",
    "Boeing 747 close up aircraft",
    "Pan Am Boeing 747",
  ];
};

const searchCommons = async (query: string): Promise<CommonsPage | null> => {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "1400",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
    headers: { "User-Agent": "FairChairReadingMode/1.0 (educational article images)" },
  });
  if (!response.ok) return null;
  const json = await response.json();
  const pages = Object.values(json?.query?.pages ?? {}) as CommonsPage[];
  return pages.find((page) => {
    const info = page.imageinfo?.[0];
    return info?.thumburl && ["image/jpeg", "image/png", "image/webp"].includes(info.mime ?? "");
  }) ?? null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { articleId, title, paragraphs } = parsed.data;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: cached } = await supabase
      .from("reading_article_images")
      .select("paragraph_index, storage_path, alt_text, caption, source_url, creator, license")
      .eq("article_id", articleId)
      .order("paragraph_index");

    let stored: StoredImage[] = (cached ?? []).map((row) => ({
      paragraphIndex: row.paragraph_index,
      storagePath: row.storage_path,
      altText: row.alt_text,
      caption: row.caption,
      sourceUrl: row.source_url,
      creator: row.creator,
      license: row.license,
    }));

    if (stored.length < paragraphs.length) {
      const featured = specialQueries(title);
      const created = await Promise.all(paragraphs.map(async (paragraph, index): Promise<StoredImage | null> => {
        const already = stored.find((image) => image.paragraphIndex === index);
        if (already) return already;
        const paragraphTerms = paragraph.split(/\s+/).slice(0, 20).join(" ");
        const query = featured?.[index] ?? `${title} ${paragraphTerms}`;
        const page = await searchCommons(query) ?? await searchCommons(title);
        const info = page?.imageinfo?.[0];
        if (!page || !info?.thumburl) return null;

        const imageResponse = await fetch(info.thumburl);
        if (!imageResponse.ok) return null;
        const contentType = info.mime ?? imageResponse.headers.get("content-type") ?? "image/jpeg";
        const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
        const safeId = articleId.replace(/[^a-zA-Z0-9_-]/g, "-");
        const storagePath = `${safeId}/paragraph-${index}.${extension}`;
        const bytes = await imageResponse.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from("article-images")
          .upload(storagePath, bytes, { contentType, upsert: true });
        if (uploadError) {
          console.error("article image upload failed", uploadError.message);
          return null;
        }

        const metadata = info.extmetadata ?? {};
        const caption = stripHtml(metadata.ImageDescription?.value) || stripHtml(page.title?.replace(/^File:/, "")) || title;
        const sourceUrl = info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title ?? "")}`;
        const image: StoredImage = {
          paragraphIndex: index,
          storagePath,
          altText: `${caption} — picture for ${title}`,
          caption,
          sourceUrl,
          creator: stripHtml(metadata.Artist?.value) || null,
          license: stripHtml(metadata.LicenseShortName?.value) || null,
        };
        await supabase.from("reading_article_images").upsert({
          article_id: articleId,
          paragraph_index: index,
          storage_path: image.storagePath,
          alt_text: image.altText,
          caption: image.caption,
          source_url: image.sourceUrl,
          creator: image.creator,
          license: image.license,
        }, { onConflict: "article_id,paragraph_index" });
        return image;
      }));
      stored = created.filter((image): image is StoredImage => image !== null);
    }

    const images = await Promise.all(stored.map(async (image) => {
      const { data } = await supabase.storage.from("article-images").createSignedUrl(image.storagePath, 60 * 60 * 6);
      return data?.signedUrl ? { ...image, url: data.signedUrl } : null;
    }));

    return new Response(JSON.stringify({ images: images.filter(Boolean) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("article-images failed", error);
    return new Response(JSON.stringify({ error: "Could not load article pictures" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});