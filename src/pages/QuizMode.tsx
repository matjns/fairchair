import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChairIcon } from '@/components/icons/ChairIcon';
import { 
  Sparkles, ArrowLeft, Brain, Timer, Users, Trophy, Zap, Check, ChevronRight, Swords
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFamilyMembers, FamilyMember } from '@/hooks/useFamilyMembers';
import { useSeatingHistory } from '@/hooks/useSeatingHistory';
import { FamilyMemberCard } from '@/components/modes/FamilyMemberCard';
import { AddFamilyMemberForm } from '@/components/modes/AddFamilyMemberForm';
import { SeatWinnerDisplay } from '@/components/modes/SeatWinnerDisplay';
import { Progress } from '@/components/ui/progress';

interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: string;
}

interface QuestionHistory {
  ids: string[];
  texts: string[];
  userId: string | null;
}

type QuizStep = 'setup' | 'select-players' | 'select-difficulty' | 'select-length' | 'select-topic' | 'countdown' | 'question-p1' | 'pass-device' | 'question-p2' | 'round-result' | 'final-result';
type Difficulty = 'easy' | 'medium' | 'hard';

const TOPICS = ['Science', 'Math', 'Geography', 'History', 'Animals', 'Sports', 'Presidents', 'Other'];
const COUNTDOWN_SECONDS = 3;
const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'bg-success' },
  medium: { label: 'Medium', color: 'bg-warning' },
  hard: { label: 'Hard', color: 'bg-destructive' },
};
// Soft cap so a player can't stall forever. Stopwatch counts up to this then auto-times out.
const MAX_STOPWATCH_MS = 60_000;

const formatStopwatch = (ms: number) => {
  const clamped = Math.max(0, Math.min(ms, MAX_STOPWATCH_MS));
  const totalSeconds = clamped / 1000;
  const seconds = Math.floor(totalSeconds);
  const millis = Math.floor(clamped - seconds * 1000);
  return `${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
};

const QUIZ_LENGTH_OPTIONS = [
  { rounds: 1, label: '1 Question', description: 'Quick battle' },
  { rounds: 3, label: '3 Questions', description: 'Best of 3' },
  { rounds: 5, label: '5 Questions', description: 'Best of 5' },
  { rounds: 10, label: '10 Questions', description: 'Marathon' },
];

const normalizeQuestionText = (question: string) =>
  question
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const questionTextStorageKeys = (userId: string | null) => [
  'fairchair.quiz.seenQuestionTexts',
  userId ? `fairchair.quiz.seenQuestionTexts.${userId}` : null,
].filter(Boolean) as string[];

const readStoredQuestionTexts = (userId: string | null) => {
  if (typeof window === 'undefined') return [];

  return questionTextStorageKeys(userId).flatMap((key) => {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) as string[] : [];
    } catch {
      return [];
    }
  });
};

const saveStoredQuestionText = (userId: string | null, normalizedQuestion: string) => {
  if (typeof window === 'undefined' || !normalizedQuestion) return;

  questionTextStorageKeys(userId).forEach((key) => {
    const existing = readStoredQuestionTexts(userId).filter(Boolean);
    const next = [...new Set([...existing, normalizedQuestion])].slice(-1000);
    window.localStorage.setItem(key, JSON.stringify(next));
  });
};

const QuizMode: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [step, setStep] = useState<QuizStep>('setup');
  const [player1, setPlayer1] = useState<FamilyMember | null>(null);
  const [player2, setPlayer2] = useState<FamilyMember | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('hard');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [quizLength, setQuizLength] = useState<number>(3);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [player1Answer, setPlayer1Answer] = useState<string | null>(null);
  const [player2Answer, setPlayer2Answer] = useState<string | null>(null);
  const [player1Time, setPlayer1Time] = useState<number | null>(null);
  const [player2Time, setPlayer2Time] = useState<number | null>(null);
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [winner, setWinner] = useState<FamilyMember | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [isTiebreaker, setIsTiebreaker] = useState<boolean>(false);
  const [tiebreakerRound, setTiebreakerRound] = useState<number>(0);
  const [roundWinnerId, setRoundWinnerId] = useState<string | null>(null);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [userHistoryIds, setUserHistoryIds] = useState<string[]>([]);
  const [player1Streak, setPlayer1Streak] = useState<number>(0);
  const [player2Streak, setPlayer2Streak] = useState<number>(0);
  const [player1BestStreak, setPlayer1BestStreak] = useState<number>(0);
  const [player2BestStreak, setPlayer2BestStreak] = useState<number>(0);
  
  // Use ref for immediate tracking (state updates are async and cause race conditions)
  const usedQuestionIdsRef = useRef<Set<string>>(new Set());
  const usedQuestionTextsRef = useRef<Set<string>>(new Set());

  const { familyMembers, loading, addFamilyMember } = useFamilyMembers();
  const { recordSeating } = useSeatingHistory();

  // Fetch all question history for the signed-in account so Quiz Mode never repeats
  // a question for any family profile on that account.
  const fetchPlayerHistory = async (): Promise<QuestionHistory> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { ids: [], texts: [], userId: null };
    
    const { data, error } = await supabase
      .from('user_question_history')
      .select('question_id, quiz_questions(question)')
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Could not load question history:', error);
      return { ids: [], texts: readStoredQuestionTexts(session.user.id), userId: session.user.id };
    }

    const historyRows = (data ?? []) as Array<{
      question_id: string;
      quiz_questions: { question: string } | { question: string }[] | null;
    }>;

    const dbTexts = historyRows.flatMap((history) => {
      const question = Array.isArray(history.quiz_questions)
        ? history.quiz_questions[0]
        : history.quiz_questions;
      return question?.question ? [normalizeQuestionText(question.question)] : [];
    });

    const storedTexts = readStoredQuestionTexts(session.user.id);

    return {
      ids: [...new Set(historyRows.map((h) => h.question_id))],
      texts: [...new Set([...dbTexts, ...storedTexts])],
      userId: session.user.id,
    };
  };

  const kids = familyMembers.filter(m => !m.is_parent);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
      if (!session?.user) {
        navigate('/auth?redirect=/quiz-mode');
      }
    };
    checkAuth();
  }, [navigate]);

  const reserveQuestion = async (question: QuizQuestion, userId: string | null) => {
    const normalizedQuestion = normalizeQuestionText(question.question);

    if (usedQuestionIdsRef.current.has(question.id) || usedQuestionTextsRef.current.has(normalizedQuestion)) {
      return false;
    }

    if (userId) {
      const { error } = await supabase
        .from('user_question_history')
        .insert({ user_id: userId, question_id: question.id, family_member_id: null });
      
      if (error) {
        if (error.code === '23505') {
          usedQuestionIdsRef.current.add(question.id);
          usedQuestionTextsRef.current.add(normalizedQuestion);
          saveStoredQuestionText(userId, normalizedQuestion);
          return false;
        }

        console.error('Could not save question history:', error);
      }
    }

    usedQuestionIdsRef.current.add(question.id);
    usedQuestionTextsRef.current.add(normalizedQuestion);
    saveStoredQuestionText(userId, normalizedQuestion);
    setUsedQuestionIds(prev => [...new Set([...prev, question.id])]);
    setUserHistoryIds(prev => [...new Set([...prev, question.id])]);
    return true;
  };

  const pickFreshQuestion = async (
    questions: QuizQuestion[] | null,
    excludedIds: Set<string>,
    excludedTexts: Set<string>,
    userId: string | null,
  ) => {
    const freshQuestions = (questions ?? []).filter((question) => {
      const normalizedQuestion = normalizeQuestionText(question.question);
      return !excludedIds.has(question.id) && !excludedTexts.has(normalizedQuestion);
    });

    const shuffledQuestions = [...freshQuestions].sort(() => Math.random() - 0.5);

    for (const question of shuffledQuestions) {
      if (await reserveQuestion(question, userId)) {
        return question;
      }
    }

    return null;
  };

  const fetchQuestion = async (topic: string, difficulty: Difficulty): Promise<QuizQuestion | null> => {
    if (!player1 || !player2) return null;
    
    // Get fresh account-wide history so a question never repeats for any profile
    const freshHistory = await fetchPlayerHistory();
    
    // Use the ref for immediate/accurate session tracking (state is async)
    const sessionUsedIds = Array.from(usedQuestionIdsRef.current);
    const sessionUsedTexts = Array.from(usedQuestionTextsRef.current);
    
    // Combine ALL used IDs/texts - session + permanent history + browser backup.
    const excludeIds = new Set([...sessionUsedIds, ...freshHistory.ids]);
    const excludeTexts = new Set([...sessionUsedTexts, ...freshHistory.texts]);
    
    console.log('Excluding question IDs/texts:', excludeIds.size, excludeTexts.size);
    
    // FIRST: Try to get questions matching topic AND difficulty
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('topic', topic)
      .eq('difficulty', difficulty);
    
    if (!error) {
      const exactQuestion = await pickFreshQuestion(data as QuizQuestion[] | null, excludeIds, excludeTexts, freshHistory.userId);
      if (exactQuestion) {
        console.log('Found question (exact match):', exactQuestion.id);
        return exactQuestion;
      }
    }
    
    // FALLBACK 1: Try any difficulty for this topic
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('topic', topic);
    
    if (!fallbackError) {
      const topicQuestion = await pickFreshQuestion(fallbackData as QuizQuestion[] | null, excludeIds, excludeTexts, freshHistory.userId);
      if (topicQuestion) {
        console.log('Found question (any difficulty):', topicQuestion.id);
        return topicQuestion;
      }
    }
    
    // FALLBACK 2: Try ANY topic (user exhausted this topic)
    const { data: anyData, error: anyError } = await supabase
      .from('quiz_questions')
      .select('*');
    
    if (!anyError) {
      const anyQuestion = await pickFreshQuestion(anyData as QuizQuestion[] | null, excludeIds, excludeTexts, freshHistory.userId);
      if (anyQuestion) {
        console.log('Found question (any topic):', anyQuestion.id);
        return anyQuestion;
      }
    }
    
    console.error('No more questions available at all!');
    return null;
  };

  const startRound = async () => {
    if (!selectedTopic) return;
    
    const question = await fetchQuestion(selectedTopic, selectedDifficulty);
    if (!question) return;
    
    setCurrentQuestion(question);
    
    // Shuffle answers
    const allAnswers = [question.correct_answer, ...question.wrong_answers];
    const shuffled = allAnswers.sort(() => Math.random() - 0.5);
    setShuffledAnswers(shuffled);
    
    setPlayer1Answer(null);
    setPlayer2Answer(null);
    setPlayer1Time(null);
    setPlayer2Time(null);
    setRoundWinnerId(null);
    setElapsedMs(0);
    setCountdown(COUNTDOWN_SECONDS);
    setStep('countdown');
  };

  const startQuiz = async () => {
    setCurrentRound(1);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1Streak(0);
    setPlayer2Streak(0);
    setPlayer1BestStreak(0);
    setPlayer2BestStreak(0);
    setIsTiebreaker(false);
    setTiebreakerRound(0);
    // Keep usedQuestionIds - don't reset! This tracks questions used in this session
    // Combined with userHistoryIds, this prevents all repeats
    setWinner(null);
    await startRound();
  };

  // Countdown effect
  useEffect(() => {
    if (step !== 'countdown') return;
    
    if (countdown <= 0) {
      setStep('question-p1');
      setElapsedMs(0);
      setQuestionStartTime(Date.now());
      return;
    }
    
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Stopwatch for Player 1 (counts UP with millisecond precision)
  useEffect(() => {
    if (step !== 'question-p1') return;

    if (player1Answer) {
      setStep('pass-device');
      return;
    }

    if (elapsedMs >= MAX_STOPWATCH_MS) {
      setPlayer1Answer('__timeout__');
      setPlayer1Time(MAX_STOPWATCH_MS);
      setStep('pass-device');
      return;
    }

    const tick = setInterval(() => {
      setElapsedMs(Date.now() - questionStartTime);
    }, 31);
    return () => clearInterval(tick);
  }, [step, elapsedMs, player1Answer, questionStartTime]);

  // Stopwatch for Player 2
  useEffect(() => {
    if (step !== 'question-p2') return;

    if (player2Answer) {
      determineRoundWinner();
      return;
    }

    if (elapsedMs >= MAX_STOPWATCH_MS) {
      setPlayer2Answer('__timeout__');
      setPlayer2Time(MAX_STOPWATCH_MS);
      determineRoundWinner();
      return;
    }

    const tick = setInterval(() => {
      setElapsedMs(Date.now() - questionStartTime);
    }, 31);
    return () => clearInterval(tick);
  }, [step, elapsedMs, player2Answer, questionStartTime]);

  const handlePlayer1Answer = (answer: string) => {
    const answerTime = Date.now() - questionStartTime;
    setPlayer1Answer(answer);
    setPlayer1Time(answerTime);
  };

  const handlePlayer2Answer = (answer: string) => {
    const answerTime = Date.now() - questionStartTime;
    setPlayer2Answer(answer);
    setPlayer2Time(answerTime);
  };

  const startPlayer2Turn = () => {
    setElapsedMs(0);
    setQuestionStartTime(Date.now());
    setStep('question-p2');
  };

  const determineRoundWinner = useCallback(() => {
    if (!currentQuestion || !player1 || !player2) return;

    const correct = currentQuestion.correct_answer;
    const p1Correct = player1Answer === correct;
    const p2Correct = player2Answer === correct;
    const p1Timeout = player1Answer === '__timeout__';
    const p2Timeout = player2Answer === '__timeout__';
    const p1Time = player1Time ?? MAX_STOPWATCH_MS;
    const p2Time = player2Time ?? MAX_STOPWATCH_MS;

    // Round winner rules:
    //  • If exactly one player is correct → that player wins the round.
    //  • If both correct OR both wrong (same outcome) → faster stopwatch wins.
    //  • If both timed out → no winner this round.
    //  • If both have the SAME stopwatch time → null (triggers sudden-death tiebreaker at end).
    let roundWinner: 'p1' | 'p2' | null = null;
    if (p1Timeout && p2Timeout) {
      roundWinner = null;
    } else if (p1Correct && !p2Correct) {
      roundWinner = 'p1';
    } else if (p2Correct && !p1Correct) {
      roundWinner = 'p2';
    } else {
      // Same outcome (both correct OR both wrong) → fastest wins
      if (p1Time < p2Time) roundWinner = 'p1';
      else if (p2Time < p1Time) roundWinner = 'p2';
      else roundWinner = null; // identical time → no point, fall through to tiebreaker logic
    }

    const newP1Score = player1Score + (roundWinner === 'p1' ? 1 : 0);
    const newP2Score = player2Score + (roundWinner === 'p2' ? 1 : 0);

    setPlayer1Score(newP1Score);
    setPlayer2Score(newP2Score);
    setRoundWinnerId(
      roundWinner === 'p1' ? player1.id : roundWinner === 'p2' ? player2.id : null,
    );

    const newP1Streak = p1Correct ? player1Streak + 1 : 0;
    const newP2Streak = p2Correct ? player2Streak + 1 : 0;
    setPlayer1Streak(newP1Streak);
    setPlayer2Streak(newP2Streak);
    setPlayer1BestStreak(s => Math.max(s, newP1Streak));
    setPlayer2BestStreak(s => Math.max(s, newP2Streak));

    setStep('round-result');
  }, [currentQuestion, player1, player2, player1Answer, player2Answer, player1Time, player2Time, player1Score, player2Score, player1Streak, player2Streak]);

  const proceedToNextRound = async () => {
    // If we're already in a sudden-death tiebreaker round, a decisive winner ends the game.
    if (isTiebreaker) {
      if (roundWinnerId && player1 && player2) {
        const finalWinner = roundWinnerId === player1.id ? player1 : player2;
        setWinner(finalWinner);
        recordSeating(finalWinner.id, 'best-seat', 'preferred', 'quiz');
        setStep('final-result');
        return;
      }
      // Still tied (no winner this round) → another sudden-death question
      setTiebreakerRound(n => n + 1);
      await startRound();
      return;
    }

    if (currentRound >= quizLength) {
      // Main quiz complete
      if (player1Score > player2Score && player1) {
        setWinner(player1);
        recordSeating(player1.id, 'best-seat', 'preferred', 'quiz');
        setStep('final-result');
      } else if (player2Score > player1Score && player2) {
        setWinner(player2);
        recordSeating(player2.id, 'best-seat', 'preferred', 'quiz');
        setStep('final-result');
      } else {
        // Tied on rounds won → sudden-death tiebreaker (one question, repeat until decisive)
        setIsTiebreaker(true);
        setTiebreakerRound(1);
        await startRound();
      }
    } else {
      setCurrentRound(prev => prev + 1);
      await startRound();
    }
  };

  const resetQuiz = () => {
    setStep('setup');
    setPlayer1(null);
    setPlayer2(null);
    setSelectedTopic(null);
    setSelectedDifficulty('hard');
    setQuizLength(3);
    setCurrentRound(1);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1Streak(0);
    setPlayer2Streak(0);
    setPlayer1BestStreak(0);
    setPlayer2BestStreak(0);
    setIsTiebreaker(false);
    setTiebreakerRound(0);
    setRoundWinnerId(null);
    setCurrentQuestion(null);
    setWinner(null);
    setUsedQuestionIds([]);
    usedQuestionIdsRef.current.clear(); // Also clear the ref
    usedQuestionTextsRef.current.clear();
  };

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <ChairIcon className="w-10 h-10 text-primary animate-pulse" filled />
          <span className="text-xl font-bold text-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  const displayP1Score = player1Score;
  const displayP2Score = player2Score;

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative">
              <ChairIcon className="w-8 h-8 text-primary" filled />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-accent" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Fair<span className="text-primary">Chair</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-4">
            <Brain className="w-5 h-5 text-accent" />
            <span className="text-accent font-semibold">Quiz Mode</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Head-to-Head Trivia!</h1>
          <p className="text-muted-foreground">Take turns answering questions to win the best seat.</p>
        </div>

        <div className="card-elevated p-6">
          {/* Setup - Add family members if needed */}
          {step === 'setup' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Family Members</h2>
              {kids.length < 2 ? (
                <>
                  <p className="text-muted-foreground text-center py-4">
                    You need at least 2 kids to play Quiz Mode!
                  </p>
                  <AddFamilyMemberForm onAdd={addFamilyMember} />
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    {kids.map(member => (
                      <FamilyMemberCard key={member.id} member={member} showPoints={false} />
                    ))}
                  </div>
                  <Button variant="hero" className="w-full" onClick={() => setStep('select-players')}>
                    <Users className="w-5 h-5 mr-2" />
                    Start Quiz Battle!
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Select Players */}
          {step === 'select-players' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground text-center">Select Two Players</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">Player 1</p>
                  <div className="space-y-2">
                    {kids.map(kid => (
                      <Button
                        key={kid.id}
                        variant={player1?.id === kid.id ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => setPlayer1(kid)}
                        disabled={player2?.id === kid.id}
                      >
                        {kid.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">Player 2</p>
                  <div className="space-y-2">
                    {kids.map(kid => (
                      <Button
                        key={kid.id}
                        variant={player2?.id === kid.id ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => setPlayer2(kid)}
                        disabled={player1?.id === kid.id}
                      >
                        {kid.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={() => setStep('select-difficulty')}
                disabled={!player1 || !player2}
              >
                Next: Choose Difficulty
              </Button>
            </div>
          )}

          {/* Select Difficulty */}
          {step === 'select-difficulty' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground text-center">Choose Difficulty</h2>
              <p className="text-muted-foreground text-center">
                {player1?.name} vs {player2?.name}
              </p>
              
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(difficulty => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                    className={`h-20 flex-col gap-1`}
                    onClick={() => setSelectedDifficulty(difficulty)}
                  >
                    <span className="text-lg font-bold capitalize">{difficulty}</span>
                    <span className="text-xs opacity-70">stopwatch</span>
                  </Button>
                ))}
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={() => setStep('select-length')}
              >
                Next: Choose Quiz Length
              </Button>
            </div>
          )}

          {/* Select Quiz Length */}
          {step === 'select-length' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground text-center">How Long?</h2>
              <p className="text-muted-foreground text-center">
                {player1?.name} vs {player2?.name} • <span className="capitalize">{selectedDifficulty}</span>
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {QUIZ_LENGTH_OPTIONS.map(option => (
                  <Button
                    key={option.rounds}
                    variant={quizLength === option.rounds ? 'default' : 'outline'}
                    className="h-20 flex-col gap-1"
                    onClick={() => setQuizLength(option.rounds)}
                  >
                    <span className="text-lg font-bold">{option.label}</span>
                    <span className="text-xs opacity-70">{option.description}</span>
                  </Button>
                ))}
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={() => setStep('select-topic')}
              >
                Next: Choose Topic
              </Button>
            </div>
          )}

          {/* Select Topic */}
          {step === 'select-topic' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground text-center">Choose a Topic</h2>
              <p className="text-muted-foreground text-center">
                {player1?.name} vs {player2?.name} • <span className="capitalize">{selectedDifficulty}</span> • {quizLength} questions
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {TOPICS.map(topic => (
                  <Button
                    key={topic}
                    variant={selectedTopic === topic ? 'default' : 'outline'}
                    className="h-16 text-lg"
                    onClick={() => setSelectedTopic(topic)}
                  >
                    {topic}
                  </Button>
                ))}
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={startQuiz}
                disabled={!selectedTopic}
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Quiz!
              </Button>
            </div>
          )}

          {/* Countdown */}
          {step === 'countdown' && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">
                {isTiebreaker ? `Sudden Death · Tiebreaker #${tiebreakerRound}` : `Round ${currentRound} of ${quizLength}`}
              </p>
              <p className="text-lg font-semibold text-primary mb-4">{player1?.name}'s Turn</p>
              <div className="text-8xl font-bold text-primary animate-pulse">
                {countdown}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                <span className="capitalize">{selectedDifficulty}</span> • Stopwatch — fastest correct wins!
              </p>
            </div>
          )}

          {/* Player 1 Question */}
          {step === 'question-p1' && currentQuestion && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {isTiebreaker ? `Tiebreaker #${tiebreakerRound}` : `Round ${currentRound}/${quizLength}`}
                </span>
                <span className="text-sm font-semibold text-primary">{player1?.name}'s Turn</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-mono font-bold text-primary tabular-nums">
                    {formatStopwatch(elapsedMs)}
                  </span>
                </div>
                <Progress value={Math.min(100, (elapsedMs / MAX_STOPWATCH_MS) * 100)} className="h-2" />
              </div>

              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-muted-foreground">{currentQuestion.topic}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_CONFIG[selectedDifficulty].color} text-white`}>
                    {DIFFICULTY_CONFIG[selectedDifficulty].label}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">{currentQuestion.question}</h3>
              </div>

              <div className="space-y-2">
                {shuffledAnswers.map((answer, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full text-left justify-start h-auto py-3 whitespace-normal"
                    onClick={() => handlePlayer1Answer(answer)}
                  >
                    {answer}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Pass Device Screen */}
          {step === 'pass-device' && (
            <div className="text-center py-12 space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-4">
                <ChevronRight className="w-10 h-10 text-accent" />
              </div>
              <div>
                <p className="text-muted-foreground mb-2">Pass the device to:</p>
                <h2 className="text-4xl font-bold text-accent">{player2?.name}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Don't show {player2?.name} what {player1?.name} answered!
              </p>
              <Button
                variant="hero"
                className="w-full"
                onClick={startPlayer2Turn}
              >
                {player2?.name} is Ready!
              </Button>
            </div>
          )}

          {/* Player 2 Question */}
          {step === 'question-p2' && currentQuestion && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {isTiebreaker ? `Tiebreaker #${tiebreakerRound}` : `Round ${currentRound}/${quizLength}`}
                </span>
                <span className="text-sm font-semibold text-accent">{player2?.name}'s Turn</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="w-5 h-5 text-accent" />
                  <span className="text-3xl font-mono font-bold text-accent tabular-nums">
                    {formatStopwatch(elapsedMs)}
                  </span>
                </div>
                <Progress value={Math.min(100, (elapsedMs / MAX_STOPWATCH_MS) * 100)} className="h-2" />
              </div>

              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-muted-foreground">{currentQuestion.topic}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_CONFIG[selectedDifficulty].color} text-white`}>
                    {DIFFICULTY_CONFIG[selectedDifficulty].label}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">{currentQuestion.question}</h3>
              </div>

              <div className="space-y-2">
                {shuffledAnswers.map((answer, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full text-left justify-start h-auto py-3 whitespace-normal"
                    onClick={() => handlePlayer2Answer(answer)}
                  >
                    {answer}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Round Result */}
          {step === 'round-result' && currentQuestion && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {isTiebreaker ? `Sudden Death · Tiebreaker #${tiebreakerRound}` : `Round ${currentRound} of ${quizLength}`}
                </p>
                <h2 className="text-2xl font-bold text-foreground">
                  {roundWinnerId
                    ? `${roundWinnerId === player1?.id ? player1?.name : player2?.name} wins the round!`
                    : 'No winner this round'}
                </h2>
              </div>

              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground mb-2">Correct answer:</p>
                <p className="font-semibold text-success">{currentQuestion.correct_answer}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className={`p-4 rounded-xl ${player1Answer === currentQuestion.correct_answer ? 'bg-success/10 border-2 border-success' : 'bg-destructive/10'}`}>
                  <p className="font-semibold text-foreground">{player1?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {player1Answer === '__timeout__' ? '⏰ Timeout' : player1Answer === currentQuestion.correct_answer ? '✓ Correct' : '✗ Wrong'}
                  </p>
                  {player1Time != null && player1Answer !== '__timeout__' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ⏱ {formatStopwatch(player1Time)}s
                    </p>
                  )}
                </div>
                <div className={`p-4 rounded-xl ${player2Answer === currentQuestion.correct_answer ? 'bg-success/10 border-2 border-success' : 'bg-destructive/10'}`}>
                  <p className="font-semibold text-foreground">{player2?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {player2Answer === '__timeout__' ? '⏰ Timeout' : player2Answer === currentQuestion.correct_answer ? '✓ Correct' : '✗ Wrong'}
                  </p>
                  {player2Time != null && player2Answer !== '__timeout__' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ⏱ {formatStopwatch(player2Time)}s
                    </p>
                  )}
                </div>
              </div>

              {/* Current Score */}
              <div className="p-4 bg-primary/10 rounded-xl">
                <p className="text-sm text-muted-foreground text-center mb-2">Current Score</p>
                <div className="flex justify-center items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{player1?.name}</p>
                    <p className="text-2xl font-bold text-primary">{displayP1Score}</p>
                    {player1Streak >= 2 && (
                      <p className="text-xs font-semibold text-warning mt-1">🔥 {player1Streak} streak</p>
                    )}
                  </div>
                  <span className="text-2xl text-muted-foreground">-</span>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{player2?.name}</p>
                    <p className="text-2xl font-bold text-accent">{displayP2Score}</p>
                    {player2Streak >= 2 && (
                      <p className="text-xs font-semibold text-warning mt-1">🔥 {player2Streak} streak</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={proceedToNextRound}
              >
                {isTiebreaker
                  ? (roundWinnerId ? 'See Final Results' : 'Another Tiebreaker!')
                  : currentRound >= quizLength
                    ? (player1Score === player2Score ? 'Sudden Death!' : 'See Final Results')
                    : 'Next Question'}
              </Button>
            </div>
          )}

          {/* Final Result */}
          {step === 'final-result' && currentQuestion && (
            <div className="space-y-6">
              {winner && (
                <SeatWinnerDisplay
                  winner={winner}
                  seatDescription="Best Seat (Quiz Champion!)"
                  mode="quiz"
                  onDone={resetQuiz}
                />
              )}
              
              {/* Final Score */}
              <div className="p-4 bg-primary/10 rounded-xl">
                <p className="text-sm text-muted-foreground text-center mb-2">Final Score</p>
                <div className="flex justify-center items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{player1?.name}</p>
                    <p className="text-3xl font-bold text-primary">{displayP1Score}</p>
                    {player1BestStreak >= 2 && (
                      <p className="text-xs font-semibold text-warning mt-1">Best streak: 🔥 {player1BestStreak}</p>
                    )}
                  </div>
                  <span className="text-2xl text-muted-foreground">-</span>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{player2?.name}</p>
                    <p className="text-3xl font-bold text-accent">{displayP2Score}</p>
                    {player2BestStreak >= 2 && (
                      <p className="text-xs font-semibold text-warning mt-1">Best streak: 🔥 {player2BestStreak}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCurrentQuestion(null);
                  setWinner(null);
                  startQuiz();
                }}
              >
                Play Again with Same Players
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizMode;
