import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WORDS: Record<string, string> = {
  easy: "100 to 200 words, 3 short paragraphs",
  hard: "320 to 500 words, 4 to 5 paragraphs",
  "extra-hard": "550 to 900 words, 6 to 8 paragraphs",
};

interface Fact { text: string; keywords: string[] }

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["body", "facts"],
  properties: {
    body: { type: "string" },
    facts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text", "keywords"],
        properties: {
          text: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
} as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { articleId, title, topic, subtopic, level, seedFacts } = await req.json();
    if (!articleId || !title || !level) {
      return new Response(JSON.stringify({ error: "Missing article details" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: cached } = await supabase
      .from("reading_article_texts")
      .select("body, facts")
      .eq("article_id", articleId)
      .maybeSingle();

    if (cached?.body) {
      return new Response(JSON.stringify({ body: cached.body, facts: cached.facts ?? [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hints = Array.isArray(seedFacts) && seedFacts.length
      ? `Known details you should weave in where they are correct: ${seedFacts.join("; ")}.`
      : "";

    const prompt = `Write a true, family-friendly informational article for kids and teens.

Title: ${title}
Topic: ${topic} / ${subtopic}
Length: ${WORDS[level] ?? WORDS.hard}
${hints}

Rules:
- Write ONLY the article itself: real information, told like a story, in plain paragraphs separated by blank lines.
- Never mention reading games, book reports, scoring, accuracy, players, or advice about how to remember or write things down.
- Never use filler sentences such as "this detail matters" or "readers should remember". Every sentence must state a real fact about the subject.
- Everything must be factually accurate. If you are unsure of a number or date, leave it out.
- Also return 6 to 10 key facts. Each fact has a short sentence and 1 to 2 keywords that appear word-for-word in the article body (a name, place, number or date).
- Return json matching the schema.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: prompt,
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
        text: { format: { type: "json_schema", name: "article", strict: true, schema: SCHEMA } },
      }),
    });

    if (!res.ok || !res.body) {
      const detail = await res.text();
      console.error("gateway error", res.status, detail);
      return new Response(JSON.stringify({ error: "Could not write the article", status: res.status }), {
        status: res.status === 429 ? 429 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read the SSE stream and collect the output text.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let out = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") out += evt.delta;
          if (evt.type === "response.completed" && !out && evt.response?.output_text) out = evt.response.output_text;
        } catch {
          // ignore keep-alive noise
        }
      }
    }

    let parsed: { body: string; facts: Fact[] };
    try {
      parsed = JSON.parse(out);
    } catch {
      console.error("unparseable output", out.slice(0, 400));
      return new Response(JSON.stringify({ error: "Could not write the article" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (parsed.body ?? "").trim();
    const facts = (parsed.facts ?? []).filter(
      (f) => f?.text && Array.isArray(f.keywords) && f.keywords.length &&
        f.keywords.every((k) => body.toLowerCase().includes(String(k).toLowerCase())),
    );

    await supabase.from("reading_article_texts").upsert(
      { article_id: articleId, title, topic, subtopic, level, body, facts },
      { onConflict: "article_id" },
    );

    return new Response(JSON.stringify({ body, facts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-article failed", error);
    return new Response(JSON.stringify({ error: "Could not write the article" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
