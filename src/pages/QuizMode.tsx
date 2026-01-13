import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChairIcon } from '@/components/icons/ChairIcon';
import { 
  Sparkles, ArrowLeft, Brain, Clock, Users, Trophy, Zap, Check
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

type QuizStep = 'setup' | 'select-players' | 'select-topic' | 'countdown' | 'question' | 'result';

const TOPICS = ['Science', 'Math', 'Geography', 'History', 'Animals', 'Sports'];
const COUNTDOWN_SECONDS = 3;
const ANSWER_TIME_SECONDS = 10;

const QuizMode: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [step, setStep] = useState<QuizStep>('setup');
  const [player1, setPlayer1] = useState<FamilyMember | null>(null);
  const [player2, setPlayer2] = useState<FamilyMember | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIME_SECONDS);
  const [player1Answer, setPlayer1Answer] = useState<string | null>(null);
  const [player2Answer, setPlayer2Answer] = useState<string | null>(null);
  const [player1Time, setPlayer1Time] = useState<number | null>(null);
  const [player2Time, setPlayer2Time] = useState<number | null>(null);
  const [winner, setWinner] = useState<FamilyMember | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  const { familyMembers, loading, addFamilyMember } = useFamilyMembers();
  const { recordSeating } = useSeatingHistory();

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

  const fetchQuestion = async (topic: string) => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('topic', topic);
    
    if (error || !data || data.length === 0) {
      console.error('Failed to fetch question:', error);
      return null;
    }
    
    const randomQuestion = data[Math.floor(Math.random() * data.length)];
    return randomQuestion as QuizQuestion;
  };

  const startQuiz = async () => {
    if (!selectedTopic) return;
    
    const question = await fetchQuestion(selectedTopic);
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
    setWinner(null);
    setCountdown(COUNTDOWN_SECONDS);
    setStep('countdown');
  };

  // Countdown effect
  useEffect(() => {
    if (step !== 'countdown') return;
    
    if (countdown <= 0) {
      setStep('question');
      setTimeLeft(ANSWER_TIME_SECONDS);
      setQuestionStartTime(Date.now());
      return;
    }
    
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Question timer effect
  useEffect(() => {
    if (step !== 'question') return;
    
    if (timeLeft <= 0 || (player1Answer && player2Answer)) {
      determineWinner();
      return;
    }
    
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, timeLeft, player1Answer, player2Answer]);

  const handleAnswer = (player: 1 | 2, answer: string) => {
    const answerTime = Date.now() - questionStartTime;
    
    if (player === 1 && !player1Answer) {
      setPlayer1Answer(answer);
      setPlayer1Time(answerTime);
    } else if (player === 2 && !player2Answer) {
      setPlayer2Answer(answer);
      setPlayer2Time(answerTime);
    }
  };

  const determineWinner = useCallback(() => {
    if (!currentQuestion || !player1 || !player2) return;
    
    const correct = currentQuestion.correct_answer;
    const p1Correct = player1Answer === correct;
    const p2Correct = player2Answer === correct;
    
    let quizWinner: FamilyMember | null = null;
    
    if (p1Correct && p2Correct) {
      // Both correct - faster wins
      quizWinner = (player1Time || Infinity) < (player2Time || Infinity) ? player1 : player2;
    } else if (p1Correct) {
      quizWinner = player1;
    } else if (p2Correct) {
      quizWinner = player2;
    } else {
      // Neither correct - faster wrong answer loses, so slower wins
      quizWinner = (player1Time || 0) > (player2Time || 0) ? player1 : player2;
    }
    
    setWinner(quizWinner);
    if (quizWinner) {
      recordSeating(quizWinner.id, 'best-seat', 'preferred', 'quiz');
    }
    setStep('result');
  }, [currentQuestion, player1, player2, player1Answer, player2Answer, player1Time, player2Time, recordSeating]);

  useEffect(() => {
    if (step === 'question' && player1Answer && player2Answer) {
      determineWinner();
    }
  }, [step, player1Answer, player2Answer, determineWinner]);

  const resetQuiz = () => {
    setStep('setup');
    setPlayer1(null);
    setPlayer2(null);
    setSelectedTopic(null);
    setCurrentQuestion(null);
    setWinner(null);
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
          <p className="text-muted-foreground">Answer faster than your opponent to win the best seat.</p>
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
                onClick={() => setStep('select-topic')}
                disabled={!player1 || !player2}
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
                {player1?.name} vs {player2?.name}
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
              <p className="text-muted-foreground mb-4">Get Ready!</p>
              <div className="text-8xl font-bold text-primary animate-pulse">
                {countdown}
              </div>
              <p className="text-muted-foreground mt-4">
                {player1?.name} vs {player2?.name}
              </p>
            </div>
          )}

          {/* Question */}
          {step === 'question' && currentQuestion && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-warning" />
                  <span className={`text-2xl font-bold ${timeLeft <= 3 ? 'text-destructive animate-pulse' : 'text-warning'}`}>
                    {timeLeft}s
                  </span>
                </div>
                <Progress value={(timeLeft / ANSWER_TIME_SECONDS) * 100} className="h-2" />
              </div>

              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">{currentQuestion.topic}</p>
                <h3 className="text-xl font-semibold text-foreground">{currentQuestion.question}</h3>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Player 1 answers */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-center text-primary">{player1?.name}</p>
                  {player1Answer ? (
                    <div className="p-4 bg-primary/10 rounded-xl text-center">
                      <Check className="w-6 h-6 text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground mt-1">Answered!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {shuffledAnswers.map((answer, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="w-full text-sm h-auto py-2 whitespace-normal"
                          onClick={() => handleAnswer(1, answer)}
                        >
                          {answer}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Player 2 answers */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-center text-accent">{player2?.name}</p>
                  {player2Answer ? (
                    <div className="p-4 bg-accent/10 rounded-xl text-center">
                      <Check className="w-6 h-6 text-accent mx-auto" />
                      <p className="text-sm text-muted-foreground mt-1">Answered!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {shuffledAnswers.map((answer, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="w-full text-sm h-auto py-2 whitespace-normal"
                          onClick={() => handleAnswer(2, answer)}
                        >
                          {answer}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {step === 'result' && currentQuestion && (
            <div className="space-y-6">
              {winner && (
                <SeatWinnerDisplay
                  winner={winner}
                  seatDescription="Best Seat (Quiz Champion!)"
                  mode="quiz"
                  onDone={resetQuiz}
                />
              )}
              
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground mb-2">Correct answer:</p>
                <p className="font-semibold text-success">{currentQuestion.correct_answer}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className={`p-4 rounded-xl ${player1Answer === currentQuestion.correct_answer ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <p className="font-semibold text-foreground">{player1?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {player1Answer === currentQuestion.correct_answer ? '✓ Correct' : '✗ Wrong'}
                    {player1Time && ` (${(player1Time / 1000).toFixed(1)}s)`}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${player2Answer === currentQuestion.correct_answer ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <p className="font-semibold text-foreground">{player2?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {player2Answer === currentQuestion.correct_answer ? '✓ Correct' : '✗ Wrong'}
                    {player2Time && ` (${(player2Time / 1000).toFixed(1)}s)`}
                  </p>
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
