import { Article, ArticleFact, ArticleLevel, wordCount } from './types';

/** Word targets for each difficulty (minimums we try to reach). */
const TARGET: Record<ArticleLevel, { min: number; max: number }> = {
  easy: { min: 100, max: 200 },
  hard: { min: 320, max: 500 },
  'extra-hard': { min: 540, max: 1000 },
};

const SUFFIX: Record<ArticleLevel, string> = {
  easy: '-lv-easy',
  hard: '-lv-hard',
  'extra-hard': '-lv-xh',
};

const normalize = (text: string) => text.toLowerCase();

/**
 * Sentences and paragraphs that are advice about winning the game rather than
 * part of the story. These are stripped so readers only see the article itself.
 */
const ADVICE = [
  'facts are what win',
  'when you write your report',
  'a strong report',
  'your report will show',
  'book report',
  'accuracy score',
  'write in full sentences',
  'as many of them as you can remember',
  'detail to remember',
  'in short:',
];

const isAdvice = (text: string) => {
  const t = normalize(text);
  return ADVICE.some((phrase) => t.includes(phrase));
};

/** Removes any game advice from a source body, keeping the real story text. */
const storyBody = (body: string): string =>
  body
    .split(/\n+/)
    .map((para) =>
      para
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s && !isAdvice(s))
        .join(' '),
    )
    .map((p) => p.trim())
    .filter(Boolean)
    .join('\n\n');

const sentencesOf = (body: string): string[] =>
  body
    .split(/\n+/)
    .flatMap((para) => para.split(/(?<=[.!?])\s+/))
    .map((s) => s.trim())
    .filter(Boolean);

const covers = (text: string, fact: ArticleFact) =>
  fact.keywords.every((k) => normalize(text).includes(normalize(k)));

const paragraphs = (chunks: string[]): string => chunks.filter(Boolean).join('\n\n');

/** Groups sentences back into readable paragraphs of a few sentences each. */
const toParagraphs = (sentences: string[], perPara = 4): string => {
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += perPara) {
    out.push(sentences.slice(i, i + perPara).join(' '));
  }
  return paragraphs(out);
};

const keyPhrase = (fact: ArticleFact) => fact.keywords.join(', ');

const isYear = (phrase: string) => /^(1[0-9]{3}|20[0-9]{2})$/.test(phrase.trim());

/** Story sentences that carry each key detail, with no game advice. */
const storySentences = (article: Article, facts: ArticleFact[]): string[] => {
  const { title, subtopic, topic } = article;
  return facts.map((f, i) => {
    const phrase = keyPhrase(f);
    if (isYear(phrase)) {
      const yearFrames = [
        `By ${phrase} the story of ${title} had reached a turning point, and the events of that year shaped everything that followed.`,
        `${phrase} is the year most tellings of ${title} pause on, because what happened then decided what came next.`,
        `Then came ${phrase}. The people caught up in ${title} could see the change happening around them.`,
        `In ${phrase} the picture changed again, and ${title} moved into a new stage of its story.`,
      ];
      return yearFrames[i % yearFrames.length];
    }
    const frames = [
      `${phrase} sits near the heart of ${title}, and the story keeps coming back to it.`,
      `The account of ${title} also runs through ${phrase}, which is where a lot of the action happens.`,
      `Anyone following ${title} meets ${phrase} along the way, and it helps explain how the rest unfolded.`,
      `${phrase} belongs to the same chapter of ${subtopic.toLowerCase()}, and it connects this story to the ones around it.`,
      `Within ${topic.toLowerCase()}, ${phrase} is one of the pieces this story is built on.`,
    ];
    return frames[i % frames.length];
  });
};

/** A short scene-setting opening and a closing paragraph, both about the subject. */
const frameParas = (article: Article): string[] => {
  const { title, subtopic, topic } = article;
  return [
    `${title} is one of the best-known stories in ${subtopic.toLowerCase()}, a corner of ${topic.toLowerCase()} full of names, places and moments that people still talk about today. The account below follows it from the beginning, keeping to what actually happened and to the details that made it matter.`,
    `Put together, the moments above are what make ${title} worth reading about. Each name, place and date belongs to the same thread, and following that thread from start to finish is what turns a handful of details into a story you can retell in your own words.`,
  ];
};


const trimToWords = (text: string, max: number): string => {
  const parts = text.split(/\s+/);
  if (parts.length <= max) return text;
  return parts.slice(0, max).join(' ');
};

const buildEasy = (article: Article, body0: string): Article => {
  const sentences = sentencesOf(body0);
  const kept: string[] = [];
  let words = 0;
  for (const s of sentences) {
    const w = wordCount(s);
    if (words + w > TARGET.easy.max - 10 && words >= TARGET.easy.min) break;
    kept.push(s);
    words += w;
  }
  let body = toParagraphs(kept.length ? kept : sentences.slice(0, 3));
  let facts = article.facts.filter((f) => covers(body, f));
  if (facts.length < 4) {
    const missing = article.facts.filter((f) => !covers(body, f)).slice(0, 6);
    if (missing.length) {
      body = paragraphs([body, toParagraphs(storySentences(article, missing), 3)]);
      facts = article.facts.filter((f) => covers(body, f));
    }
  }
  return {
    ...article,
    id: article.id + SUFFIX.easy,
    level: 'easy',
    body,
    facts: facts.slice(0, 8),
  };
};

const buildLong = (article: Article, body0: string, level: Exclude<ArticleLevel, 'easy'>): Article => {
  const target = TARGET[level];
  const facts =
    level === 'hard'
      ? article.facts.slice(0, Math.max(6, Math.ceil(article.facts.length * 0.8)))
      : article.facts;
  let body = body0.trim();
  const missing = facts.filter((f) => !covers(body, f));
  if (missing.length) {
    body = paragraphs([body, toParagraphs(storySentences(article, missing), 3)]);
  }
  // Pad towards the target length only with story sentences about the facts.
  const extra = storySentences(article, facts);
  let i = 0;
  while (wordCount(body) < target.min && i < extra.length) {
    body = paragraphs([body, toParagraphs(extra.slice(i, i + 3), 3)]);
    i += 3;
  }

  body = trimToWords(body, target.max);
  return {
    ...article,
    id: article.id + SUFFIX[level],
    level,
    body,
    facts: facts.filter((f) => covers(body, f)),
  };
};

/** Turns one source article into an easy, hard and extra-hard version. */
export const expandLevels = (article: Article): Article[] => {
  const clean = storyBody(article.body) || article.body;
  const facts = article.facts.map((f) => ({
    ...f,
    text: isAdvice(f.text) ? f.keywords.join(', ') : f.text,
  }));
  const base = { ...article, body: clean, facts };
  return [buildEasy(base, clean), buildLong(base, clean, 'hard'), buildLong(base, clean, 'extra-hard')];
};
