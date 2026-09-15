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

const factProse = (facts: ArticleFact[]): string =>
  facts.map((f) => `${f.text}.`.replace(/\.\.$/, '.')).join(' ');

const contextParas = (article: Article, facts: ArticleFact[]): string[] => {
  const { title, topic, subtopic } = article;
  const half = Math.ceil(facts.length / 2);
  return [
    `${title} belongs to the wider subject of ${subtopic.toLowerCase()}, which sits inside ${topic.toLowerCase()}. Reading about one clear example is the fastest way to understand the bigger subject, because the same kinds of details show up again and again: names, dates, places, numbers, and the reason something mattered to the people who were there.`,
    `Here are the details worth remembering. ${factProse(facts.slice(0, half))}`,
    `The rest of the story is just as important. ${factProse(facts.slice(half))}`,
    `A strong report does not simply repeat the first sentence of the article. It names the people involved, gives the dates and numbers exactly as they appear, and explains what changed because of them. Writers lose accuracy when they remember the story but forget the specific words that carry the facts.`,
    `One useful habit is to read the article once for the story and a second time for the details. On the second pass, pause at every number and every name and say it out loud. When you write, work through those details in the same order you met them, so nothing gets left behind.`,
    `Finally, think about how ${title.toLowerCase()} connects to other things you already know about ${topic.toLowerCase()}. Comparing one example with another is what turns a list of facts into real understanding, and it makes the facts much easier to recall later.`,
  ];
};

const trimToWords = (text: string, max: number): string => {
  const parts = text.split(/\s+/);
  if (parts.length <= max) return text;
  return parts.slice(0, max).join(' ');
};

const buildEasy = (article: Article): Article => {
  const sentences = sentencesOf(article.body);
  const kept: string[] = [];
  let words = 0;
  for (const s of sentences) {
    const w = wordCount(s);
    if (words + w > TARGET.easy.max - 10 && words >= TARGET.easy.min) break;
    kept.push(s);
    words += w;
  }
  let body = toParagraphs(kept.length ? kept : sentences.slice(0, 3));
  const facts = article.facts.filter((f) => covers(body, f));
  const usable = facts.length >= 4 ? facts : article.facts.slice(0, 6);
  if (usable !== facts) {
    // Make sure every listed fact really appears in the shortened body.
    body = paragraphs([body, `In short: ${factProse(usable)}`]);
  }
  if (wordCount(body) < TARGET.easy.min) {
    body = paragraphs([body, `In short: ${factProse(usable)}`]);
  }
  return {
    ...article,
    id: article.id + SUFFIX.easy,
    level: 'easy',
    body,
    facts: usable.slice(0, 8).filter((f) => covers(body, f)),
  };
};

const buildLong = (article: Article, level: Exclude<ArticleLevel, 'easy'>): Article => {
  const target = TARGET[level];
  const facts = level === 'hard' ? article.facts.slice(0, Math.max(6, Math.ceil(article.facts.length * 0.8))) : article.facts;
  const extras = contextParas(article, facts);
  let body = article.body.trim();
  for (const para of extras) {
    if (wordCount(body) >= target.min) break;
    body = paragraphs([body, para]);
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
export const expandLevels = (article: Article): Article[] => [
  buildEasy(article),
  buildLong(article, 'hard'),
  buildLong(article, 'extra-hard'),
];
