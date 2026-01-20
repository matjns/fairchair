import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChairIcon } from '@/components/icons/ChairIcon';
import { 
  Sparkles, ArrowLeft, Brain, Clock, Users, Trophy, Zap, Check, ChevronRight
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

type QuizStep = 'setup' | 'select-players' | 'select-difficulty' | 'select-length' | 'select-topic' | 'countdown' | 'question-p1' | 'pass-device' | 'question-p2' | 'round-result' | 'final-result';
type Difficulty = 'easy' | 'medium' | 'hard';

const TOPICS = ['Science', 'Math', 'Geography', 'History', 'Animals', 'Sports', 'Presidents'];
const COUNTDOWN_SECONDS = 3;
const DIFFICULTY_CONFIG: Record<Difficulty, { time: number; label: string; color: string }> = {
  easy: { time: 45, label: 'Easy', color: 'bg-success' },
  medium: { time: 30, label: 'Medium', color: 'bg-warning' },
  hard: { time: 20, label: 'Hard', color: 'bg-destructive' },
};

const QUIZ_LENGTH_OPTIONS = [
  { rounds: 1, label: '1 Question', description: 'Quick battle' },
  { rounds: 3, label: '3 Questions', description: 'Best of 3' },
  { rounds: 5, label: '5 Questions', description: 'Best of 5' },
  { rounds: 10, label: '10 Questions', description: 'Marathon' },
];

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
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_CONFIG.hard.time);
  const [player1Answer, setPlayer1Answer] = useState<string | null>(null);
  const [player2Answer, setPlayer2Answer] = useState<string | null>(null);
  const [player1Time, setPlayer1Time] = useState<number | null>(null);
  const [player2Time, setPlayer2Time] = useState<number | null>(null);
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [winner, setWinner] = useState<FamilyMember | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [userHistoryIds, setUserHistoryIds] = useState<string[]>([]);
  
  // Use ref for immediate tracking (state updates are async and cause race conditions)
  const usedQuestionIdsRef = useRef<Set<string>>(new Set());

  const { familyMembers, loading, addFamilyMember } = useFamilyMembers();
  const { recordSeating } = useSeatingHistory();

  // Fetch question history for selected players - we'll fetch fresh for each quiz
  // Include questions with NULL family_member_id (legacy) AND questions for either player
  const fetchPlayerHistory = async (p1Id: string, p2Id: string): Promise<string[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];
    
    // Get ALL question history for this user - including legacy ones with null family_member_id
    const { data } = await supabase
      .from('user_question_history')
      .select('question_id, family_member_id')
      .eq('user_id', session.user.id);
    
    if (data) {
      // Include: 1) legacy questions (null family_member_id), 2) questions either player has seen
      const relevantQuestions = data.filter(
        (h: any) => h.family_member_id === null || h.family_member_id === p1Id || h.family_member_id === p2Id
      );
      return [...new Set(relevantQuestions.map((h: any) => h.question_id))];
    }
    return [];
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

  const fetchQuestion = async (topic: string, difficulty: Difficulty): Promise<QuizQuestion | null> => {
    if (!player1 || !player2) return null;
    
    // Get fresh player history for BOTH current players
    const freshHistoryIds = await fetchPlayerHistory(player1.id, player2.id);
    
    // Use the ref for immediate/accurate session tracking (state is async)
    const sessionUsedIds = Array.from(usedQuestionIdsRef.current);
    
    // Combine ALL used IDs - session + permanent player history
    const excludeIds = [...new Set([...sessionUsedIds, ...freshHistoryIds])];
    
    console.log('Excluding question IDs:', excludeIds.length);
    
    // FIRST: Try to get questions matching topic AND difficulty
    let query = supabase
      .from('quiz_questions')
      .select('*')
      .eq('topic', topic)
      .eq('difficulty', difficulty);
    
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }
    
    const { data, error } = await query;
    
    if (!error && data && data.length > 0) {
      const randomQuestion = data[Math.floor(Math.random() * data.length)];
      console.log('Found question (exact match):', randomQuestion.id);
      return randomQuestion as QuizQuestion;
    }
    
    // FALLBACK 1: Try any difficulty for this topic
    let fallbackQuery = supabase
      .from('quiz_questions')
      .select('*')
      .eq('topic', topic);
    
    if (excludeIds.length > 0) {
      fallbackQuery = fallbackQuery.not('id', 'in', `(${excludeIds.join(',')})`);
    }
    
    const { data: fallbackData, error: fallbackError } = await fallbackQuery;
    
    if (!fallbackError && fallbackData && fallbackData.length > 0) {
      const randomQuestion = fallbackData[Math.floor(Math.random() * fallbackData.length)];
      console.log('Found question (any difficulty):', randomQuestion.id);
      return randomQuestion as QuizQuestion;
    }
    
    // FALLBACK 2: Try ANY topic (user exhausted this topic)
    let anyTopicQuery = supabase
      .from('quiz_questions')
      .select('*');
    
    if (excludeIds.length > 0) {
      anyTopicQuery = anyTopicQuery.not('id', 'in', `(${excludeIds.join(',')})`);
    }
    
    const { data: anyData, error: anyError } = await anyTopicQuery;
    
    if (!anyError && anyData && anyData.length > 0) {
      const randomQuestion = anyData[Math.floor(Math.random() * anyData.length)];
      console.log('Found question (any topic):', randomQuestion.id);
      return randomQuestion as QuizQuestion;
    }
    
    console.error('No more questions available at all!');
    return null;
  };

  const recordQuestionForPlayers = async (questionId: string, p1Id: string, p2Id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    
    // Record question for BOTH players who saw it
    await supabase.from('user_question_history').insert([
      { user_id: session.user.id, question_id: questionId, family_member_id: p1Id },
      { user_id: session.user.id, question_id: questionId, family_member_id: p2Id }
    ]);
    
    setUserHistoryIds(prev => [...prev, questionId]);
  };

  const startRound = async () => {
    if (!selectedTopic) return;
    
    const question = await fetchQuestion(selectedTopic, selectedDifficulty);
    if (!question) return;
    
    // IMMEDIATELY add to ref to prevent race conditions (ref is synchronous)
    usedQuestionIdsRef.current.add(question.id);
    
    // Also update state for UI consistency
    setUsedQuestionIds(prev => [...prev, question.id]);
    
    setCurrentQuestion(question);
    
    // Record this question for BOTH players so it never repeats for them
    if (player1 && player2) {
      await recordQuestionForPlayers(question.id, player1.id, player2.id);
    }
    
    // Shuffle answers
    const allAnswers = [question.correct_answer, ...question.wrong_answers];
    const shuffled = allAnswers.sort(() => Math.random() - 0.5);
    setShuffledAnswers(shuffled);
    
    setPlayer1Answer(null);
    setPlayer2Answer(null);
    setPlayer1Time(null);
    setPlayer2Time(null);
    setCountdown(COUNTDOWN_SECONDS);
    setStep('countdown');
  };

  const startQuiz = async () => {
    setCurrentRound(1);
    setPlayer1Score(0);
    setPlayer2Score(0);
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
      setTimeLeft(DIFFICULTY_CONFIG[selectedDifficulty].time);
      setQuestionStartTime(Date.now());
      return;
    }
    
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown, selectedDifficulty]);

  // Question timer effect for Player 1
  useEffect(() => {
    if (step !== 'question-p1') return;
    
    if (timeLeft <= 0) {
      // Time ran out for player 1
      setPlayer1Answer('__timeout__');
      setPlayer1Time(DIFFICULTY_CONFIG[selectedDifficulty].time * 1000);
      setStep('pass-device');
      return;
    }
    
    if (player1Answer) {
      setStep('pass-device');
      return;
    }
    
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, timeLeft, player1Answer, selectedDifficulty]);

  // Question timer effect for Player 2
  useEffect(() => {
    if (step !== 'question-p2') return;
    
    if (timeLeft <= 0) {
      // Time ran out for player 2
      setPlayer2Answer('__timeout__');
      setPlayer2Time(DIFFICULTY_CONFIG[selectedDifficulty].time * 1000);
      determineRoundWinner();
      return;
    }
    
    if (player2Answer) {
      determineRoundWinner();
      return;
    }
    
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, timeLeft, player2Answer, selectedDifficulty]);

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
    setTimeLeft(DIFFICULTY_CONFIG[selectedDifficulty].time);
    setQuestionStartTime(Date.now());
    setStep('question-p2');
  };

  const determineRoundWinner = useCallback(() => {
    if (!currentQuestion || !player1 || !player2) return;
    
    const correct = currentQuestion.correct_answer;
    const p1Correct = player1Answer === correct;
    const p2Correct = player2Answer === correct;
    
    // Update scores - store the new values directly to avoid display issues
    const newP1Score = player1Score + (p1Correct ? 1 : 0);
    const newP2Score = player2Score + (p2Correct ? 1 : 0);
    
    setPlayer1Score(newP1Score);
    setPlayer2Score(newP2Score);
    
    setStep('round-result');
  }, [currentQuestion, player1, player2, player1Answer, player2Answer, player1Score, player2Score]);

  const proceedToNextRound = async () => {
    if (currentRound >= quizLength) {
      // Determine final winner - scores are already updated by determineRoundWinner
      let finalWinner: FamilyMember | null = null;
      
      if (player1Score > player2Score) {
        finalWinner = player1;
      } else if (player2Score > player1Score) {
        finalWinner = player2;
      } else {
        // Tie - use total time as tiebreaker (lower is better)
        finalWinner = (player1Time || Infinity) < (player2Time || Infinity) ? player1 : player2;
      }
      
      setWinner(finalWinner);
      if (finalWinner) {
        recordSeating(finalWinner.id, 'best-seat', 'preferred', 'quiz');
      }
      setStep('final-result');
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
    setCurrentQuestion(null);
    setWinner(null);
    setUsedQuestionIds([]);
    usedQuestionIdsRef.current.clear(); // Also clear the ref
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

  const answerTimeSeconds = DIFFICULTY_CONFIG[selectedDifficulty].time;

  // Scores are now directly updated, no need for display calculation
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
                    <span className="text-xs opacity-70">{DIFFICULTY_CONFIG[difficulty].time}s timer</span>
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
              <p className="text-muted-foreground mb-2">Round {currentRound} of {quizLength}</p>
              <p className="text-lg font-semibold text-primary mb-4">{player1?.name}'s Turn</p>
              <div className="text-8xl font-bold text-primary animate-pulse">
                {countdown}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                <span className="capitalize">{selectedDifficulty}</span> • {answerTimeSeconds} seconds to answer
              </p>
            </div>
          )}

          {/* Player 1 Question */}
          {step === 'question-p1' && currentQuestion && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Round {currentRound}/{quizLength}</span>
                <span className="text-sm font-semibold text-primary">{player1?.name}'s Turn</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-warning" />
                  <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-warning'}`}>
                    {timeLeft}s
                  </span>
                </div>
                <Progress value={(timeLeft / answerTimeSeconds) * 100} className="h-2" />
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
                <span className="text-sm text-muted-foreground">Round {currentRound}/{quizLength}</span>
                <span className="text-sm font-semibold text-accent">{player2?.name}'s Turn</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-warning" />
                  <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-warning'}`}>
                    {timeLeft}s
                  </span>
                </div>
                <Progress value={(timeLeft / answerTimeSeconds) * 100} className="h-2" />
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
                <p className="text-sm text-muted-foreground mb-2">Round {currentRound} of {quizLength}</p>
                <h2 className="text-2xl font-bold text-foreground">Round Complete!</h2>
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
                  {player1Time && player1Answer !== '__timeout__' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {(player1Time / 1000).toFixed(1)}s
                    </p>
                  )}
                </div>
                <div className={`p-4 rounded-xl ${player2Answer === currentQuestion.correct_answer ? 'bg-success/10 border-2 border-success' : 'bg-destructive/10'}`}>
                  <p className="font-semibold text-foreground">{player2?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {player2Answer === '__timeout__' ? '⏰ Timeout' : player2Answer === currentQuestion.correct_answer ? '✓ Correct' : '✗ Wrong'}
                  </p>
                  {player2Time && player2Answer !== '__timeout__' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {(player2Time / 1000).toFixed(1)}s
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
                  </div>
                  <span className="text-2xl text-muted-foreground">-</span>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{player2?.name}</p>
                    <p className="text-2xl font-bold text-accent">{displayP2Score}</p>
                  </div>
                </div>
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={proceedToNextRound}
              >
                {currentRound >= quizLength ? 'See Final Results' : 'Next Question'}
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
                  </div>
                  <span className="text-2xl text-muted-foreground">-</span>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{player2?.name}</p>
                    <p className="text-3xl font-bold text-accent">{displayP2Score}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizMode;
