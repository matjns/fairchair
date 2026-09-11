import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, BookOpen, Users, Trophy, Clock, ShieldAlert, Eye, EyeOff, PenLine,
  ChevronRight, CheckCircle2, Medal, ListChecks, Loader2,
} from 'lucide-react';
import { useFamilyMembers, FamilyMember } from '@/hooks/useFamilyMembers';
import { toast } from '@/hooks/use-toast';
import {
  Article, ArticleLevel, LEVEL_INFO, allArticles, articleTopics, articleSubtopics,
  articleLevels, findArticles, gradeReport, ReportScore, wordCount,
} from '@/data/articles';

type Step =
  | 'rules' | 'players' | 'topic' | 'subtopic' | 'level' | 'pick-article'
  | 'read' | 'handoff' | 'write' | 'grading' | 'results';

interface Entry {
  member: FamilyMember;
  report: string;
  score: ReportScore;
}

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 5;
const PLACE_LABELS = ['1st', '2nd', '3rd', '4th', '5th'];

// Defined at module level so typing in the report box never remounts the page.
const Shell: React.FC<{ children: React.ReactNode; onBack?: () => void }> = ({ children, onBack }) => (
  <div className="min-h-screen bg-transparent">
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        ) : (
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Home
            </Button>
          </Link>
        )}
        <div className="flex items-center gap-2 text-foreground font-bold">
          <BookOpen className="w-5 h-5 text-primary" /> Reading Mode
        </div>
      </div>
      {children}
    </div>
  </div>
);

const ReadingMode: React.FC = () => {
  const navigate = useNavigate();
  const { familyMembers, loading } = useFamilyMembers();

  const [step, setStep] = useState<Step>('rules');
  const [players, setPlayers] = useState<FamilyMember[]>([]);
  const [topic, setTopic] = useState<string>('');
  const [subtopic, setSubtopic] = useState<string>('');
  const [level, setLevel] = useState<ArticleLevel | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [turn, setTurn] = useState(0);
  const [draft, setDraft] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [gradingIndex, setGradingIndex] = useState(0);
  const [search, setSearch] = useState('');

  const topics = useMemo(() => articleTopics(), []);
  const subtopics = useMemo(() => (topic ? articleSubtopics(topic) : []), [topic]);
  const levels = useMemo(() => (topic ? articleLevels(topic, subtopic || null) : []), [topic, subtopic]);
  const candidates = useMemo(
    () => (topic ? findArticles(topic, subtopic || null, level) : []),
    [topic, subtopic, level],
  );
  const visibleCandidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return candidates;
    return candidates.filter((a) => a.title.toLowerCase().includes(term));
  }, [candidates, search]);


  // Walk through the reports one at a time so players see the checking happen.
  useEffect(() => {
    if (step !== 'grading') return;
    if (gradingIndex >= entries.length) {
      const timer = setTimeout(() => setStep('results'), 700);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setGradingIndex((i) => i + 1), 900);
    return () => clearTimeout(timer);
  }, [step, gradingIndex, entries.length]);

  const togglePlayer = (member: FamilyMember) => {
    setPlayers((current) => {
      if (current.some((p) => p.id === member.id)) return current.filter((p) => p.id !== member.id);
      if (current.length >= MAX_PLAYERS) {
        toast({ title: 'Five readers max', description: 'Reading Mode holds up to 5 players.' });
        return current;
      }
      return [...current, member];
    });
  };

  const startReading = (chosen: Article) => {
    setArticle(chosen);
    setEntries([]);
    setTurn(0);
    setDraft('');
    setGradingIndex(0);
    setStep('read');
  };

  const submitReport = () => {
    if (!article) return;
    if (wordCount(draft) < 10) {
      toast({ title: 'Write a bit more', description: 'A book report needs at least 10 words.' });
      return;
    }
    const member = players[turn];
    const score = gradeReport(article, draft);
    const nextEntries = [...entries, { member, report: draft, score }];
    setEntries(nextEntries);
    setDraft('');

    if (turn + 1 < players.length) {
      setTurn(turn + 1);
      setStep('handoff');
    } else {
      setGradingIndex(0);
      setStep('grading');
    }
  };

  // Best accuracy wins; ties broken by the longer report.
  const ranked = useMemo(
    () => [...entries].sort((a, b) => b.score.accuracy - a.score.accuracy || b.score.words - a.score.words),
    [entries],
  );

  const resetAll = () => {
    setStep('rules');
    setPlayers([]);
    setTopic('');
    setSubtopic('');
    setLevel(null);
    setArticle(null);
    setEntries([]);
    setTurn(0);
    setDraft('');
    setGradingIndex(0);
    setSearch('');
  };


  if (loading) {
    return (
      <Shell>
        <div className="card-interactive p-10 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </div>
      </Shell>
    );
  }

  if (step === 'rules') {
    return (
      <Shell>
        <div className="card-interactive p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Reading Mode Rules</h1>
            <p className="text-muted-foreground mt-2">Read one article, then prove you read it.</p>
          </div>

          <ol className="space-y-3 text-foreground">
            {[
              'Up to 5 players play. Everyone agrees on ONE article together.',
              'Everybody reads the same article. Easy is 100-200 words (2-5 minutes), Hard is 300-500 words (5-10 minutes), Extra Hard is 500-1000 words (10-15 minutes).',
              'Then players write their book report in order: player 1, then 2, then 3, then 4, then 5.',
              'No looking at another player\u2019s book report before the end of the game. Each report is hidden as soon as it is handed in.',
              'The app checks every report for facts from the article and gives each one an accuracy score.',
              'The most accurate report wins the round.',
              'If two or more players tie for the best accuracy, the one with the LONGEST book report wins.',
              'After the last report is checked, the leaderboard shows 1st through 5th place.',
            ].map((rule, index) => (
              <li key={rule} className="flex gap-3">
                <span className="w-7 h-7 shrink-0 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 text-sm">
            <ShieldAlert className="w-5 h-5 text-warning shrink-0" />
            <span className="text-foreground">
              No peeking at the article while writing, and no peeking at anyone else&apos;s report. Honour system.
            </span>
          </div>

          <Button variant="hero" size="lg" className="w-full" onClick={() => setStep('players')}>
            I understand the rules <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </Shell>
    );
  }

  if (step === 'players') {
    return (
      <Shell onBack={() => setStep('rules')}>
        <div className="card-interactive p-8 space-y-6">
          <div className="text-center">
            <Users className="w-10 h-10 text-primary mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-foreground">Who is reading?</h2>
            <p className="text-muted-foreground">Pick {MIN_PLAYERS} to {MAX_PLAYERS} players, in playing order.</p>
          </div>

          {familyMembers.length === 0 ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Add family members first.</p>
              <Button variant="hero" onClick={() => navigate('/family-profiles')}>Add Family Members</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {familyMembers.map((member) => {
                const index = players.findIndex((p) => p.id === member.id);
                const selected = index >= 0;
                return (
                  <button
                    key={member.id}
                    onClick={() => togglePlayer(member)}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      selected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="font-semibold text-foreground">{member.name}</span>
                    {selected && (
                      <span className="text-xs font-bold text-primary">Player {index + 1}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            disabled={players.length < MIN_PLAYERS}
            onClick={() => setStep('topic')}
          >
            Choose a topic <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </Shell>
    );
  }

  if (step === 'topic') {
    return (
      <Shell onBack={() => setStep('players')}>
        <div className="card-interactive p-8 space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">Pick a topic</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {topics.map((item) => (
              <button
                key={item}
                onClick={() => { setTopic(item); setSubtopic(''); setLevel(null); setStep('subtopic'); }}
                className="p-4 rounded-xl border-2 border-border hover:border-primary/60 text-left font-semibold text-foreground"
              >
                {item}
                <span className="block text-xs font-normal text-muted-foreground">
                  {allArticles.filter((a) => a.topic === item).length} articles
                </span>
              </button>
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  if (step === 'subtopic') {
    return (
      <Shell onBack={() => setStep('topic')}>
        <div className="card-interactive p-8 space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">What kind of {topic}?</h2>
          <div className="grid sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto">
            <button
              onClick={() => { setSubtopic(''); setLevel(null); setStep('level'); }}
              className="p-4 rounded-xl border-2 border-primary/40 bg-primary/5 text-left font-semibold text-foreground"
            >
              Any
              <span className="block text-xs font-normal text-muted-foreground">Anything in {topic}</span>
            </button>
            {subtopics.map((item) => (
              <button
                key={item}
                onClick={() => { setSubtopic(item); setLevel(null); setStep('level'); }}
                className="p-4 rounded-xl border-2 border-border hover:border-primary/60 text-left font-semibold text-foreground"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  if (step === 'level') {
    return (
      <Shell onBack={() => setStep('subtopic')}>
        <div className="card-interactive p-8 space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">How long a read?</h2>
          <div className="space-y-3">
            {(['easy', 'hard', 'extra-hard'] as ArticleLevel[]).map((item) => {
              const available = levels.includes(item);
              const info = LEVEL_INFO[item];
              return (
                <button
                  key={item}
                  disabled={!available}
                  onClick={() => { setLevel(item); setSearch(''); setStep('pick-article'); }}
                  className={`w-full p-5 rounded-xl border-2 text-left ${
                    available ? 'border-border hover:border-primary/60' : 'border-border opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">{info.label}</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" /> {info.time}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{info.words} &middot; {info.blurb}</span>
                  {!available && <span className="block text-xs text-muted-foreground mt-1">No article here yet</span>}
                </button>
              );
            })}
          </div>
        </div>
      </Shell>
    );
  }

  if (step === 'pick-article') {
    return (
      <Shell onBack={() => setStep('level')}>
        <div className="card-interactive p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Everyone agree on one article</h2>
            <p className="text-muted-foreground">All {players.length} players read the same one.</p>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={subtopic === 'Businesses' ? 'Search for a business, like Wawa or Costco...' : 'Search articles...'}
            className="w-full p-3 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
          />
          <div className="space-y-3 max-h-[520px] overflow-y-auto">
            {visibleCandidates.map((item) => (
              <button
                key={item.id}
                onClick={() => startReading(item)}
                className="w-full p-5 rounded-xl border-2 border-border hover:border-primary/60 text-left"
              >
                <span className="block text-lg font-bold text-foreground">{item.title}</span>
                <span className="block text-sm text-muted-foreground">
                  {item.topic} &middot; {item.subtopic} &middot; {wordCount(item.body)} words &middot; {item.facts.length} key facts
                </span>
              </button>
            ))}
            {visibleCandidates.length === 0 && (
              <p className="text-center text-muted-foreground">No article matches that choice yet.</p>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  if (step === 'read' && article) {
    return (
      <Shell onBack={() => setStep('pick-article')}>
        <div className="card-interactive p-8 space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">{article.topic} &middot; {article.subtopic} &middot; {LEVEL_INFO[article.level].label}</p>
            <h1 className="text-3xl font-extrabold text-foreground">{article.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {wordCount(article.body)} words &middot; about {LEVEL_INFO[article.level].time} to read
            </p>
          </div>
          <div className="space-y-4 text-foreground leading-relaxed">
            {article.body.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 text-sm text-foreground">
            <EyeOff className="w-5 h-5 text-primary shrink-0" />
            Once everyone has finished reading, tap below. The article disappears while you write.
          </div>
          <Button variant="hero" size="lg" className="w-full" onClick={() => setStep('write')}>
            Everyone has read it &mdash; start book reports
          </Button>
        </div>
      </Shell>
    );
  }

  if (step === 'handoff') {
    return (
      <Shell>
        <div className="card-interactive p-10 text-center space-y-6">
          <Eye className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Pass the device to {players[turn].name}</h2>
          <p className="text-muted-foreground">
            Player {turn + 1} of {players.length}. Reports already handed in stay hidden until the end.
          </p>
          <Button variant="hero" size="lg" onClick={() => setStep('write')}>
            I&apos;m {players[turn].name}, let me write
          </Button>
        </div>
      </Shell>
    );
  }

  if (step === 'write' && article) {
    const words = wordCount(draft);
    return (
      <Shell>
        <div className="card-interactive p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Player {turn + 1} of {players.length}</p>
              <h2 className="text-2xl font-bold text-foreground">{players[turn].name}&apos;s book report</h2>
            </div>
            <PenLine className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Write everything you remember about &ldquo;{article.title}&rdquo;. More correct facts means higher accuracy.
            If there is a tie, the longer report wins.
          </p>
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={12}
            placeholder="What was the article about? Name the people, places, dates and numbers you remember..."
            className="resize-none"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{words} words</span>
            <span className="flex items-center gap-1"><EyeOff className="w-4 h-4" /> Others cannot see this</span>
          </div>
          <Button variant="hero" size="lg" className="w-full" onClick={submitReport}>
            Hand in report <CheckCircle2 className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </Shell>
    );
  }

  if (step === 'grading') {
    return (
      <Shell>
        <div className="card-interactive p-10 space-y-6 text-center">
          <ListChecks className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Checking the book reports</h2>
          <Progress value={(gradingIndex / Math.max(entries.length, 1)) * 100} />
          <div className="space-y-2 text-left">
            {entries.map((entry, index) => (
              <div
                key={entry.member.id}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  index < gradingIndex ? 'bg-success/10' : 'bg-muted/40'
                }`}
              >
                <span className="font-semibold text-foreground">{entry.member.name}</span>
                {index < gradingIndex ? (
                  <span className="text-sm font-bold text-success">checked</span>
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  if (step === 'results' && article) {
    const best = ranked[0];
    return (
      <Shell>
        <div className="space-y-6">
          <div className="card-interactive p-8 text-center space-y-3">
            <Trophy className="w-12 h-12 text-warning mx-auto" />
            <h2 className="text-3xl font-extrabold text-foreground">{best.member.name} wins!</h2>
            <p className="text-muted-foreground">
              {best.score.accuracy}% accuracy &middot; {best.score.matched} of {best.score.total} key facts &middot; {best.score.words} words
            </p>
          </div>

          <div className="card-interactive p-8 space-y-4">
            <h3 className="text-xl font-bold text-foreground">Leaderboard</h3>
            {ranked.map((entry, index) => (
              <div key={entry.member.id} className="p-4 rounded-xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-sm">
                      {PLACE_LABELS[index] ?? `${index + 1}th`}
                    </span>
                    <span className="font-semibold text-foreground">{entry.member.name}</span>
                    {index === 0 && <Medal className="w-4 h-4 text-warning" />}
                  </div>
                  <span className="text-sm font-bold text-foreground">{entry.score.accuracy}%</span>
                </div>
                <Progress value={entry.score.accuracy} />
                <p className="text-xs text-muted-foreground">
                  {entry.score.matched}/{entry.score.total} facts &middot; {entry.score.words} words
                </p>
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">See their report and facts</summary>
                  <p className="mt-2 whitespace-pre-wrap text-foreground">{entry.report}</p>
                  {entry.score.hits.length > 0 && (
                    <p className="mt-2"><span className="font-semibold text-success">Got:</span> {entry.score.hits.join('; ')}</p>
                  )}
                  {entry.score.misses.length > 0 && (
                    <p className="mt-1"><span className="font-semibold text-destructive">Missed:</span> {entry.score.misses.join('; ')}</p>
                  )}
                </details>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Button variant="hero" size="lg" className="w-full" onClick={() => startReading(article)}>
              Play again with this same article
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={resetAll}>Pick a new article</Button>
              <Button variant="outline" size="lg" className="flex-1" onClick={() => navigate('/assignments')}>
                See seat assignments
              </Button>
            </div>
          </div>

        </div>
      </Shell>
    );
  }

  return (
    <Shell onBack={resetAll}>
      <div className="card-interactive p-10 text-center">
        <Button variant="hero" onClick={resetAll}>Start over</Button>
      </div>
    </Shell>
  );
};

export default ReadingMode;
