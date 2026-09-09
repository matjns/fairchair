export type ArticleLevel = 'easy' | 'hard' | 'extra-hard';

export interface ArticleFact {
  /** Plain-language fact a good report should mention. */
  text: string;
  /** All of these must appear in a report for the fact to count. */
  keywords: string[];
}

export interface Article {
  id: string;
  topic: string;
  subtopic: string;
  level: ArticleLevel;
  title: string;
  body: string;
  facts: ArticleFact[];
}

export const LEVEL_INFO: Record<ArticleLevel, { label: string; words: string; time: string; blurb: string }> = {
  easy: { label: 'Easy', words: '100-200 words', time: '2-5 minutes', blurb: 'short and friendly' },
  hard: { label: 'Hard', words: '300-500 words', time: '5-10 minutes', blurb: 'a real read' },
  'extra-hard': { label: 'Extra Hard', words: '500-1000 words', time: '10-15 minutes', blurb: 'the long haul' },
};

export const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
