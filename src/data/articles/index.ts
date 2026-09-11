import { Article, ArticleLevel } from './types';
import { easyArticles } from './easy';
import { hardArticles } from './hard';
import { extraHardArticles } from './extraHard';
import { businessArticles } from './businesses';
import { businessArticles2 } from './businesses2';
import { mathArticles } from './math';
import { scienceArticles } from './science';
import { geographyArticles } from './geography';
import { sportsArticles } from './sports';
import { animalArticles } from './animals';
import { presidentArticles } from './presidents';
import { historyArticles } from './history';
import { otherArticles } from './other';

export * from './types';

export const allArticles: Article[] = [
  ...easyArticles,
  ...hardArticles,
  ...extraHardArticles,
  ...businessArticles,
  ...businessArticles2,
  ...mathArticles,
  ...scienceArticles,
  ...geographyArticles,
  ...sportsArticles,
  ...animalArticles,
  ...presidentArticles,
  ...historyArticles,
  ...otherArticles,
];


export const articleTopics = (): string[] =>
  [...new Set(allArticles.map((a) => a.topic))];

export const articleSubtopics = (topic: string): string[] =>
  [...new Set(allArticles.filter((a) => a.topic === topic).map((a) => a.subtopic))];

export const articleLevels = (topic: string, subtopic: string | null): ArticleLevel[] => {
  const pool = allArticles.filter((a) => a.topic === topic && (!subtopic || a.subtopic === subtopic));
  const order: ArticleLevel[] = ['easy', 'hard', 'extra-hard'];
  return order.filter((level) => pool.some((a) => a.level === level));
};

export const findArticles = (topic: string, subtopic: string | null, level: ArticleLevel | null): Article[] =>
  allArticles.filter(
    (a) => a.topic === topic && (!subtopic || a.subtopic === subtopic) && (!level || a.level === level),
  );

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^a-z0-9'.,\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export interface ReportScore {
  matched: number;
  total: number;
  accuracy: number;
  words: number;
  hits: string[];
  misses: string[];
}

/** Counts how many of the article's key facts a written report actually mentions. */
export const gradeReport = (article: Article, report: string): ReportScore => {
  const text = normalize(report);
  const hits: string[] = [];
  const misses: string[] = [];

  article.facts.forEach((fact) => {
    const found = fact.keywords.every((keyword) => text.includes(normalize(keyword)));
    if (found) hits.push(fact.text);
    else misses.push(fact.text);
  });

  const words = report.trim().split(/\s+/).filter(Boolean).length;
  const total = article.facts.length;
  const matched = hits.length;

  return {
    matched,
    total,
    accuracy: total ? Math.round((matched / total) * 1000) / 10 : 0,
    words,
    hits,
    misses,
  };
};
