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
  imageSlot: number;
  storagePath: string;
  altText: string;
  caption: string;
  sourceUrl: string;
  creator: string | null;
  license: string | null;
}

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

interface PictureRequest {
  paragraphIndex: number;
  imageSlot: number;
  queries: string[];
}

const SEARCH_STOP_WORDS = new Set([
  "about", "after", "also", "among", "because", "before", "being", "between", "could", "during",
  "each", "from", "have", "into", "more", "most", "other", "over", "such", "than", "that", "their",
  "there", "these", "they", "this", "through", "under", "very", "were", "when", "where", "which", "while",
  "with", "would", "years", "first", "later", "many", "much", "only", "some", "then", "used", "using",
]);

const paragraphKeywords = (paragraph: string) => {
  const words = paragraph
    .replace(/[^\p{L}\p{N}'-]+/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 3 && !SEARCH_STOP_WORDS.has(word.toLowerCase()));
  return [...new Set(words)].slice(0, 14);
};

const generalQueries = (title: string, paragraph: string) => {
  const keywords = paragraphKeywords(paragraph);
  const properNames = paragraph.match(/\b(?:[A-Z][\p{L}'-]+(?:\s+[A-Z][\p{L}'-]+){0,3})\b/gu) ?? [];
  const subject = title
    .replace(/^(?:the\s+)?(?:story|history|science|geography)\s+of\s+/i, "")
    .replace(/^how\s+/i, "")
    .replace(/\s+(?:became|changed|works?|grew|began)\b.*$/i, "")
    .trim() || title;
  return [...new Set([
    ...keywords.slice(0, 6).map((keyword) => `${subject} ${keyword}`),
    ...properNames.slice(0, 4).map((name) => `${subject} ${name}`),
    subject,
    `${title} ${keywords.slice(0, 8).join(" ")}`,
    `${subject} ${keywords.slice(0, 5).join(" ")}`,
    `${title} ${properNames.slice(0, 3).join(" ")}`,
    `${subject} ${properNames.slice(0, 2).join(" ")}`,
    `${properNames.slice(0, 4).join(" ")} ${keywords.slice(0, 6).join(" ")}`,
    keywords.slice(0, 10).join(" "),
    `${title} ${keywords.slice(0, 4).join(" ")}`,
    ...properNames.slice(0, 4).map((name) => `${title} ${name}`),
    title,
  ].map((query) => query.replace(/\s+/g, " ").trim()).filter(Boolean))];
};

const pictureRequests = (title: string, paragraphs: string[]): PictureRequest[] => {
  const requests = paragraphs.map((paragraph, paragraphIndex) => ({
    paragraphIndex,
    imageSlot: 0,
    queries: generalQueries(title, paragraph),
  }));
  if (!title.toLowerCase().includes("boeing 747")) return requests;

  const special: Record<number, string[]> = {
    0: ["Boeing 747 first flight February 1969", "Boeing 747 prototype first flight"],
    1: [
      "SAS Boeing 747 Combi Magnus Viking Boeing manufacturing plant Everett 1977",
      "Boeing 747 assembly line Everett factory",
    ],
    2: ["Boeing 747 close up aircraft", "Boeing 747 close view"],
    3: ["Pan Am Boeing 747 January 1970 London Heathrow crowds", "Pan Am Boeing 747 first commercial flight 1970"],
    4: ["Boeing 747 cargo loading", "Boeing 747 freighter loading cargo"],
    5: ["Boeing 747-400 in flight", "Boeing 747-400 aircraft"],
  };
  for (const request of requests) {
    if (special[request.paragraphIndex]) request.queries = special[request.paragraphIndex];
  }
  if (paragraphs.length > 5) {
    requests.push({
      paragraphIndex: 5,
      imageSlot: 1,
      queries: ["NASA Shuttle Carrier Aircraft carrying Space Shuttle Boeing 747", "Space Shuttle on Boeing 747 NASA"],
    });
  }
  const last = requests.find((request) => request.paragraphIndex === paragraphs.length - 1 && request.imageSlot === 0);
  if (last && paragraphs.length >= 7) {
    last.queries = [
      "N863GT Boeing 747 Atlas Air",
      "Atlas Air Boeing 747-8F",
    ];
  }
  return requests;
};

const searchCommons = async (query: string): Promise<CommonsPage[]> => {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "50",
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "1400",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
    headers: { "User-Agent": "FairChairReadingMode/1.0 (educational article images)" },
  });
  if (!response.ok) return [];
  const json = await response.json();
  const pages = Object.values(json?.query?.pages ?? {}) as CommonsPage[];
  return pages.filter((page) => {
    const info = page.imageinfo?.[0];
    return info?.thumburl && ["image/jpeg", "image/png", "image/webp"].includes(info.mime ?? "");
  });
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
      .select("paragraph_index, image_slot, storage_path, alt_text, caption, source_url, creator, license")
      .eq("article_id", articleId)
      .order("paragraph_index")
      .order("image_slot");

    let stored: StoredImage[] = (cached ?? []).map((row) => ({
      paragraphIndex: row.paragraph_index,
      imageSlot: row.image_slot,
      storagePath: row.storage_path,
      altText: row.alt_text,
      caption: row.caption,
      sourceUrl: row.source_url,
      creator: row.creator,
      license: row.license,
    }));

    const requests = pictureRequests(title, paragraphs);
    if (stored.length < requests.length) {
      const claimedThisRequest = new Set(stored.map((image) => image.sourceUrl));
      const fillRequest = async (request: PictureRequest): Promise<StoredImage | null> => {
        const already = stored.find((image) =>
          image.paragraphIndex === request.paragraphIndex && image.imageSlot === request.imageSlot
        );
        if (already) return null;

        for (const query of request.queries) {
          const pages = await searchCommons(query);
          for (const page of pages) {
            const info = page.imageinfo?.[0];
            if (!info?.thumburl) continue;
            const sourceUrl = info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title ?? "")}`;
            if (claimedThisRequest.has(sourceUrl)) continue;
            // Reserve the source before the next await. Concurrent paragraph
            // searches can otherwise all choose the same first result.
            claimedThisRequest.add(sourceUrl);

            const imageResponse = await fetch(info.thumburl);
            if (!imageResponse.ok) {
              claimedThisRequest.delete(sourceUrl);
              continue;
            }
            const contentType = info.mime ?? imageResponse.headers.get("content-type") ?? "image/jpeg";
            const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
            const safeId = articleId.replace(/[^a-zA-Z0-9_-]/g, "-");
            const storagePath = `${safeId}/paragraph-${request.paragraphIndex}-${request.imageSlot}.${extension}`;
            const metadata = info.extmetadata ?? {};
            const caption = stripHtml(metadata.ImageDescription?.value) || stripHtml(page.title?.replace(/^File:/, "")) || title;
            const image: StoredImage = {
              paragraphIndex: request.paragraphIndex,
              imageSlot: request.imageSlot,
              storagePath,
              altText: `${caption} — picture for ${title}`,
              caption,
              sourceUrl,
              creator: stripHtml(metadata.Artist?.value) || null,
              license: stripHtml(metadata.LicenseShortName?.value) || null,
            };
            const { error: insertError } = await supabase.from("reading_article_images").insert({
              article_id: articleId,
              paragraph_index: image.paragraphIndex,
              image_slot: image.imageSlot,
              storage_path: image.storagePath,
              alt_text: image.altText,
              caption: image.caption,
              source_url: image.sourceUrl,
              creator: image.creator,
              license: image.license,
            });
            if (insertError) {
              console.error("article image metadata insert failed", {
                paragraphIndex: request.paragraphIndex,
                sourceUrl,
                message: insertError.message,
              });
              claimedThisRequest.delete(sourceUrl);
              continue;
            }

            const bytes = await imageResponse.arrayBuffer();
            const { error: uploadError } = await supabase.storage
              .from("article-images")
              .upload(storagePath, bytes, { contentType, upsert: true });
            if (uploadError) {
              await supabase.from("reading_article_images")
                .delete()
                .eq("article_id", articleId)
                .eq("paragraph_index", image.paragraphIndex)
                .eq("image_slot", image.imageSlot);
              claimedThisRequest.delete(sourceUrl);
              continue;
            }
            return image;
          }
        }
        return null;
      };

      // Work in small parallel batches. Fully sequential searches time out on
      // long articles, while sending every Wikimedia request simultaneously
      // can be throttled and leave later paragraphs empty.
      const missingRequests = requests.filter((request) => !stored.some((image) =>
        image.paragraphIndex === request.paragraphIndex && image.imageSlot === request.imageSlot
      ));
      for (let index = 0; index < missingRequests.length; index += 2) {
        const savedImages = await Promise.all(missingRequests.slice(index, index + 2).map(fillRequest));
        stored.push(...savedImages.filter((image): image is StoredImage => image !== null));
      }
    }

    stored.sort((a, b) => a.paragraphIndex - b.paragraphIndex || a.imageSlot - b.imageSlot);
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