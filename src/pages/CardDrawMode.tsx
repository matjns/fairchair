import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChairIcon } from '@/components/icons/ChairIcon';
import {
  Sparkles, ArrowLeft, Users, Trophy, Spade, Heart, Diamond, Club, Zap,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFamilyMembers, FamilyMember } from '@/hooks/useFamilyMembers';
import { useSeatingHistory } from '@/hooks/useSeatingHistory';
import { FamilyMemberCard } from '@/components/modes/FamilyMemberCard';
import { AddFamilyMemberForm } from '@/components/modes/AddFamilyMemberForm';
import { SeatWinnerDisplay } from '@/components/modes/SeatWinnerDisplay';

type Step = 'setup' | 'select-players' | 'select-length' | 'play' | 'final';
type Suit = 'spade' | 'heart' | 'diamond' | 'club';

const SUITS: Suit[] = ['spade', 'heart', 'diamond', 'club'];
const RANK_LABELS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUIT_ICONS = { spade: Spade, heart: Heart, diamond: Diamond, club: Club };
const SUIT_COLORS: Record<Suit, string> = {
  spade: 'text-foreground',
  heart: 'text-destructive',
  diamond: 'text-destructive',
  club: 'text-foreground',
};
const LENGTHS = [1, 3, 5, 7];

const drawCard = () => ({
  rank: Math.floor(Math.random() * 13),
  suit: SUITS[Math.floor(Math.random() * 4)],
});

const CardDrawMode: React.FC = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>('setup');
  const [player1, setPlayer1] = useState<FamilyMember | null>(null);
  const [player2, setPlayer2] = useState<FamilyMember | null>(null);
  const [rounds, setRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [p1Card, setP1Card] = useState<ReturnType<typeof drawCard> | null>(null);
  const [p2Card, setP2Card] = useState<ReturnType<typeof drawCard> | null>(null);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [revealing, setRevealing] = useState(false);
  const [winner, setWinner] = useState<FamilyMember | null>(null);

  const { familyMembers, loading, addFamilyMember } = useFamilyMembers();
  const { recordSeating } = useSeatingHistory();
  const kids = familyMembers.filter(m => !m.is_parent);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthed(!!session?.user);
      if (!session?.user) navigate('/auth?redirect=/card-draw-mode');
    })();
  }, [navigate]);

  const startGame = () => {
    setP1Score(0); setP2Score(0); setCurrentRound(1);
    setP1Card(null); setP2Card(null); setWinner(null);
    setStep('play');
  };

  const handleDraw = () => {
    setRevealing(true);
    const a = drawCard();
    const b = drawCard();
    setTimeout(() => {
      setP1Card(a); setP2Card(b);
      const np1 = p1Score + (a.rank > b.rank ? 1 : 0);
      const np2 = p2Score + (b.rank > a.rank ? 1 : 0);
      setP1Score(np1); setP2Score(np2);
      setRevealing(false);
    }, 700);
  };

  const nextRound = () => {
    if (currentRound >= rounds) {
      // Final - if tied, keep drawing sudden death
      if (p1Score === p2Score) {
        setCurrentRound(r => r + 1);
        setP1Card(null); setP2Card(null);
        return;
      }
      const w = p1Score > p2Score ? player1 : player2;
      if (w) {
        setWinner(w);
        recordSeating(w.id, 'best-seat', 'preferred', 'random');
      }
      setStep('final');
    } else {
      setCurrentRound(r => r + 1);
      setP1Card(null); setP2Card(null);
    }
  };

  const reset = () => {
    setStep('setup'); setPlayer1(null); setPlayer2(null); setRounds(3);
    setP1Score(0); setP2Score(0); setCurrentRound(1);
    setP1Card(null); setP2Card(null); setWinner(null);
  };

  if (authed === null || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ChairIcon className="w-10 h-10 text-primary animate-pulse" filled />
      </div>
    );
  }

  const renderCard = (card: ReturnType<typeof drawCard> | null, color: string) => {
    if (revealing || !card) {
      return (
        <div className="w-28 h-40 rounded-xl bg-gradient-to-br from-primary to-primary/60 border-2 border-primary shadow-lg flex items-center justify-center animate-pulse">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      );
    }
    const SuitIcon = SUIT_ICONS[card.suit];
    return (
      <div className={`w-28 h-40 rounded-xl bg-card border-2 ${color} shadow-lg flex flex-col items-center justify-between p-3`}>
        <span className={`text-2xl font-bold ${SUIT_COLORS[card.suit]}`}>{RANK_LABELS[card.rank]}</span>
        <SuitIcon className={`w-10 h-10 ${SUIT_COLORS[card.suit]}`} fill="currentColor" />
        <span className={`text-2xl font-bold rotate-180 ${SUIT_COLORS[card.suit]}`}>{RANK_LABELS[card.rank]}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />Back to home
          </Link>
          <div className="flex items-center gap-2">
            <ChairIcon className="w-8 h-8 text-primary" filled />
            <span className="text-xl font-bold">Fair<span className="text-primary">Chair</span></span>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Spade className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">Card Draw Mode</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">High Card Wins!</h1>
          <p className="text-muted-foreground">Draw a card. Highest rank takes the seat.</p>
        </div>

        <div className="card-elevated p-6">
          {step === 'setup' && (
            <div className="space-y-6">
              {kids.length < 2 ? (
                <>
                  <p className="text-muted-foreground text-center py-4">Add at least 2 kids to play!</p>
                  <AddFamilyMemberForm onAdd={addFamilyMember} />
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    {kids.map(m => <FamilyMemberCard key={m.id} member={m} showPoints={false} />)}
                  </div>
                  <Button variant="hero" className="w-full" onClick={() => setStep('select-players')}>
                    <Users className="w-5 h-5 mr-2" />Start Card Battle!
                  </Button>
                </>
              )}
            </div>
          )}

          {step === 'select-players' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-center">Select Two Players</h2>
              <div className="grid grid-cols-2 gap-4">
                {[['Player 1', player1, setPlayer1, player2] as const, ['Player 2', player2, setPlayer2, player1] as const].map(([label, val, setter, other]) => (
                  <div key={label} className="space-y-2">
                    <p className="text-sm text-muted-foreground text-center">{label}</p>
                    {kids.map(k => (
                      <Button key={k.id} variant={val?.id === k.id ? 'default' : 'outline'} className="w-full"
                        onClick={() => setter(k)} disabled={other?.id === k.id}>{k.name}</Button>
                    ))}
                  </div>
                ))}
              </div>
              <Button variant="hero" className="w-full" onClick={() => setStep('select-length')} disabled={!player1 || !player2}>
                Next: Best of?
              </Button>
            </div>
          )}

          {step === 'select-length' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-center">How Many Rounds?</h2>
              <div className="grid grid-cols-4 gap-3">
                {LENGTHS.map(n => (
                  <Button key={n} variant={rounds === n ? 'default' : 'outline'} className="h-16" onClick={() => setRounds(n)}>
                    Best of {n}
                  </Button>
                ))}
              </div>
              <Button variant="hero" className="w-full" onClick={startGame}>
                <Zap className="w-5 h-5 mr-2" />Deal!
              </Button>
            </div>
          )}

          {step === 'play' && (
            <div className="space-y-6">
              <div className="text-center text-sm text-muted-foreground">
                {currentRound > rounds ? `Sudden Death Round ${currentRound - rounds}` : `Round ${currentRound} of ${rounds}`}
              </div>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="flex flex-col items-center gap-3">
                  <p className="font-semibold text-primary">{player1?.name}</p>
                  {renderCard(p1Card, 'border-primary')}
                  <p className="text-2xl font-bold text-primary">{p1Score}</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <p className="font-semibold text-accent">{player2?.name}</p>
                  {renderCard(p2Card, 'border-accent')}
                  <p className="text-2xl font-bold text-accent">{p2Score}</p>
                </div>
              </div>
              {p1Card && p2Card && (
                <div className="text-center font-semibold">
                  {p1Card.rank > p2Card.rank
                    ? `${player1?.name} wins this round!`
                    : p2Card.rank > p1Card.rank
                      ? `${player2?.name} wins this round!`
                      : "It's a tie — draw again!"}
                </div>
              )}
              {!p1Card && !p2Card && !revealing ? (
                <Button variant="hero" className="w-full" onClick={handleDraw}>Draw Cards!</Button>
              ) : p1Card && p2Card ? (
                <Button variant="hero" className="w-full" onClick={p1Card.rank === p2Card.rank ? handleDraw : nextRound}>
                  {p1Card.rank === p2Card.rank ? 'Redraw' : (currentRound >= rounds && p1Score !== p2Score ? 'See Winner' : 'Next Round')}
                </Button>
              ) : null}
            </div>
          )}

          {step === 'final' && winner && (
            <SeatWinnerDisplay winner={winner} seatDescription="Best Seat (High Card!)" mode="random" onDone={reset} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDrawMode;