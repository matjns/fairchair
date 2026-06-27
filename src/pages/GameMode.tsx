import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Gamepad2, Trophy, Calculator, Type, Brain, Crown, RotateCcw, Flag, Zap,
} from 'lucide-react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { supabase } from '@/integrations/supabase/client';
import { useFamilyMembers, FamilyMember } from '@/hooks/useFamilyMembers';
import { FamilyMemberCard } from '@/components/modes/FamilyMemberCard';
import { SeatWinnerDisplay } from '@/components/modes/SeatWinnerDisplay';

type GameId = 'math' | 'word' | 'memory' | 'chess' | 'reaction';
type Step = 'setup' | 'pick-game' | 'pick-players' | 'play' | 'final';

const GAMES: { id: GameId; title: string; desc: string; icon: React.ComponentType<any> }[] = [
  { id: 'math', title: 'Math Duel', desc: 'Solve arithmetic problems fastest to win.', icon: Calculator },
  { id: 'word', title: 'Word Scramble', desc: 'Unscramble the word before the other player.', icon: Type },
  { id: 'memory', title: 'Memory Sequence', desc: 'Repeat the growing pattern. Longest streak wins.', icon: Brain },
  { id: 'chess', title: 'Chess', desc: 'Two players, one board. Checkmate to win the seat.', icon: Crown },
  { id: 'reaction', title: 'Reaction Time', desc: 'Tap the moment the screen turns green. Fastest reflex wins.', icon: Zap },
];

const WORDS = ['planet', 'puzzle', 'rocket', 'butter', 'window', 'forest', 'castle', 'guitar', 'silver', 'orange', 'mighty', 'wonder'];
const COLORS = ['bg-primary', 'bg-success', 'bg-warning', 'bg-destructive'];

const shuffle = (s: string) => s.split('').sort(() => Math.random() - 0.5).join('');

const GameMode: React.FC = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>('setup');
  const [game, setGame] = useState<GameId | null>(null);
  const [p1, setP1] = useState<FamilyMember | null>(null);
  const [p2, setP2] = useState<FamilyMember | null>(null);
  const [winner, setWinner] = useState<FamilyMember | null>(null);
  const { familyMembers, loading } = useFamilyMembers();
  const kids = familyMembers.filter(m => !m.is_parent);

  useEffect(() => {
    let redirectTimer: number | null = null;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session?.user);
      if (redirectTimer !== null) { window.clearTimeout(redirectTimer); redirectTimer = null; }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session?.user);
      if (!session?.user) {
        // Give onAuthStateChange a brief moment to hydrate before bouncing
        redirectTimer = window.setTimeout(() => navigate('/auth?redirect=/game-mode'), 400);
      }
    });
    return () => {
      subscription.unsubscribe();
      if (redirectTimer !== null) window.clearTimeout(redirectTimer);
    };
  }, [navigate]);

  const reset = () => {
    setStep('setup'); setGame(null); setP1(null); setP2(null); setWinner(null);
  };

  const selectPlayer = (m: FamilyMember) => {
    if (!p1) setP1(m);
    else if (m.id !== p1.id && !p2) {
      setP2(m); setStep('play');
    }
  };

  if (authed === null || loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-2 font-bold">
            <Gamepad2 className="w-5 h-5 text-primary" /> Game Mode
          </div>
          <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="w-4 h-4 mr-1" />Reset</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {step === 'setup' && (
          <div className="card-interactive p-8 text-center space-y-4">
            <Gamepad2 className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">Game Mode</h1>
            <p className="text-muted-foreground">Pick a learning game and two players to battle for the seat.</p>
            <Button variant="hero" size="lg" onClick={() => setStep('pick-game')}>Start</Button>
          </div>
        )}

        {step === 'pick-game' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Choose a game</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {GAMES.map(g => (
                <button key={g.id} onClick={() => { setGame(g.id); setStep('pick-players'); }}
                  className="card-interactive p-6 text-left hover:scale-[1.02] transition">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <g.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">{g.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{g.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'pick-players' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              {!p1 ? 'Pick Player 1' : 'Pick Player 2'}
            </h2>
            {kids.length < 2 ? (
              <p className="text-muted-foreground">Add at least 2 kids in <Link to="/family-profiles" className="text-primary underline">Family Profiles</Link>.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {kids.map(k => (
                  <FamilyMemberCard key={k.id} member={k} onClick={() => selectPlayer(k)} selected={p1?.id === k.id} showPoints={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'play' && game && p1 && p2 && (
          <GamePlay game={game} p1={p1} p2={p2} onWinner={(w) => { setWinner(w); setStep('final'); }} />
        )}

        {step === 'final' && winner && (
          <SeatWinnerDisplay
            winner={winner}
            seatDescription="winning seat for this round!"
            mode={'random' as any}
            onDone={() => navigate('/assignments')}
          />
        )}
      </main>
    </div>
  );
};

/* ---------- Individual games ---------- */

const GamePlay: React.FC<{ game: GameId; p1: FamilyMember; p2: FamilyMember; onWinner: (m: FamilyMember) => void; }> = ({ game, p1, p2, onWinner }) => {
  if (game === 'math') return <MathDuel p1={p1} p2={p2} onWinner={onWinner} />;
  if (game === 'word') return <WordScramble p1={p1} p2={p2} onWinner={onWinner} />;
  if (game === 'memory') return <MemorySequence p1={p1} p2={p2} onWinner={onWinner} />;
  if (game === 'reaction') return <ReactionTime p1={p1} p2={p2} onWinner={onWinner} />;
  return <ChessGame p1={p1} p2={p2} onWinner={onWinner} />;
};

const TurnHeader: React.FC<{ player: FamilyMember; label: string }> = ({ player, label }) => (
  <div className="text-center mb-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <h3 className="text-2xl font-bold text-primary">{player.name}</h3>
  </div>
);

const useStopwatch = () => {
  const [start, setStart] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed(Date.now() - start), 31);
    return () => clearInterval(id);
  }, [running, start]);
  return {
    elapsed, running,
    start: () => { setStart(Date.now()); setElapsed(0); setRunning(true); },
    stop: () => { setRunning(false); return Date.now() - start; },
    reset: () => { setElapsed(0); setRunning(false); },
  };
};

const fmt = (ms: number) => `${(ms / 1000).toFixed(2)}s`;

/* Math Duel */
const MathDuel: React.FC<{ p1: FamilyMember; p2: FamilyMember; onWinner: (m: FamilyMember) => void }> = ({ p1, p2, onWinner }) => {
  const [turn, setTurn] = useState<0 | 1>(0);
  const [problem, setProblem] = useState(() => makeProblem());
  const [answer, setAnswer] = useState('');
  const [times, setTimes] = useState<{ p1?: number; p2?: number }>({});
  const sw = useStopwatch();
  const current = turn === 0 ? p1 : p2;

  function makeProblem() {
    const a = Math.floor(Math.random() * 40) + 10;
    const b = Math.floor(Math.random() * 40) + 10;
    const ops = ['+', '-', '×'] as const;
    const op = ops[Math.floor(Math.random() * 3)];
    const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
    return { text: `${a} ${op} ${b}`, ans };
  }

  const begin = () => { setAnswer(''); sw.start(); };
  const submit = () => {
    const t = sw.stop();
    const correct = Number(answer) === problem.ans;
    const effective = correct ? t : t + 30000;
    if (turn === 0) {
      setTimes(s => ({ ...s, p1: effective }));
      setTurn(1); sw.reset();
    } else {
      const result = { ...times, p2: effective };
      const p1t = result.p1 ?? Infinity;
      const p2t = result.p2 ?? Infinity;
      onWinner(p1t <= p2t ? p1 : p2);
    }
  };

  return (
    <div className="card-interactive p-8 space-y-5">
      <TurnHeader player={current} label={`Math Duel — ${turn === 0 ? 'Player 1' : 'Player 2'} (pass the device)`} />
      <div className="text-center text-5xl font-bold tracking-wider py-6 bg-muted/40 rounded-xl">{problem.text} = ?</div>
      <div className="text-center text-sm text-muted-foreground">Elapsed: {fmt(sw.elapsed)}</div>
      {!sw.running ? (
        <Button variant="hero" size="lg" className="w-full" onClick={begin}>Start Timer</Button>
      ) : (
        <div className="space-y-3">
          <Input autoFocus value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type the answer" inputMode="numeric" onKeyDown={e => e.key === 'Enter' && submit()} />
          <Button variant="hero" size="lg" className="w-full" onClick={submit}>Submit</Button>
        </div>
      )}
    </div>
  );
};

/* Word Scramble */
const WordScramble: React.FC<{ p1: FamilyMember; p2: FamilyMember; onWinner: (m: FamilyMember) => void }> = ({ p1, p2, onWinner }) => {
  const [turn, setTurn] = useState<0 | 1>(0);
  const [word, setWord] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const scrambled = useMemo(() => shuffle(word), [word]);
  const [guess, setGuess] = useState('');
  const [times, setTimes] = useState<{ p1?: number; p2?: number }>({});
  const sw = useStopwatch();
  const current = turn === 0 ? p1 : p2;

  const begin = () => { setGuess(''); sw.start(); };
  const submit = () => {
    const t = sw.stop();
    const correct = guess.toLowerCase().trim() === word;
    const effective = correct ? t : t + 30000;
    if (turn === 0) {
      setTimes(s => ({ ...s, p1: effective }));
      setTurn(1); sw.reset();
    } else {
      const result = { ...times, p2: effective };
      onWinner((result.p1 ?? Infinity) <= (result.p2 ?? Infinity) ? p1 : p2);
    }
  };

  return (
    <div className="card-interactive p-8 space-y-5">
      <TurnHeader player={current} label={`Word Scramble — ${turn === 0 ? 'Player 1' : 'Player 2'}`} />
      <div className="text-center text-5xl font-bold tracking-[0.4em] py-6 bg-muted/40 rounded-xl uppercase">{scrambled}</div>
      <div className="text-center text-sm text-muted-foreground">Elapsed: {fmt(sw.elapsed)}</div>
      {!sw.running ? (
        <Button variant="hero" size="lg" className="w-full" onClick={begin}>Start Timer</Button>
      ) : (
        <div className="space-y-3">
          <Input autoFocus value={guess} onChange={e => setGuess(e.target.value)} placeholder="Unscramble the word" onKeyDown={e => e.key === 'Enter' && submit()} />
          <Button variant="hero" size="lg" className="w-full" onClick={submit}>Submit</Button>
        </div>
      )}
    </div>
  );
};

/* Memory Sequence */
const MemorySequence: React.FC<{ p1: FamilyMember; p2: FamilyMember; onWinner: (m: FamilyMember) => void }> = ({ p1, p2, onWinner }) => {
  const [turn, setTurn] = useState<0 | 1>(0);
  // Pre-generate a shared master sequence so both players face the same challenge
  const master = useMemo<number[]>(() => Array.from({ length: 20 }, () => Math.floor(Math.random() * 4)), []);
  const [seq, setSeq] = useState<number[]>([]);
  const [showing, setShowing] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [input, setInput] = useState<number[]>([]);
  const [scores, setScores] = useState<{ p1?: number; p2?: number }>({});
  const current = turn === 0 ? p1 : p2;

  const next = (cur: number[]) => master.slice(0, cur.length + 1);

  const playSequence = async (s: number[]) => {
    setShowing(true); setInput([]);
    for (const i of s) {
      setActive(i);
      await new Promise(r => setTimeout(r, 500));
      setActive(null);
      await new Promise(r => setTimeout(r, 200));
    }
    setShowing(false);
  };

  const start = async () => {
    const s = next([]);
    setSeq(s);
    await playSequence(s);
  };

  const press = async (i: number) => {
    if (showing) return;
    const ni = [...input, i];
    setInput(ni);
    if (seq[ni.length - 1] !== i) {
      // wrong — record score = length reached
      const score = ni.length - 1;
      if (turn === 0) {
        setScores(s => ({ ...s, p1: score }));
        setTurn(1); setSeq([]); setInput([]);
      } else {
        const r = { ...scores, p2: score };
        onWinner((r.p1 ?? 0) >= (r.p2 ?? 0) ? p1 : p2);
      }
      return;
    }
    if (ni.length === seq.length) {
      const s = next(seq);
      setSeq(s);
      await playSequence(s);
    }
  };

  return (
    <div className="card-interactive p-8 space-y-5">
      <TurnHeader player={current} label={`Memory — ${turn === 0 ? 'Player 1' : 'Player 2'}`} />
      <p className="text-center text-sm text-muted-foreground">Watch the sequence, then repeat it. Longest streak wins.</p>
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        {[0, 1, 2, 3].map(i => (
          <button key={i} onClick={() => press(i)}
            className={`h-28 rounded-2xl transition-all ${COLORS[i]} ${active === i ? 'opacity-100 scale-105' : 'opacity-60'} ${showing ? 'pointer-events-none' : ''}`} />
        ))}
      </div>
      <div className="text-center text-sm text-muted-foreground">Streak so far: {Math.max(0, seq.length - 1)}</div>
      {seq.length === 0 && (
        <Button variant="hero" size="lg" className="w-full" onClick={start}>Start {current.name}'s Turn</Button>
      )}
    </div>
  );
};

/* Chess (external board for now) */
/* Chess — play in-browser with react-chessboard + chess.js */
const ChessGame: React.FC<{ p1: FamilyMember; p2: FamilyMember; onWinner: (m: FamilyMember) => void }> = ({ p1, p2, onWinner }) => {
  // Randomly assign colors so it's fair
  const [white, black] = useMemo<[FamilyMember, FamilyMember]>(
    () => (Math.random() < 0.5 ? [p1, p2] : [p2, p1]),
    [p1, p2]
  );
  const gameRef = React.useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [status, setStatus] = useState<string>('');

  const turnColor = gameRef.current.turn() === 'w' ? 'White' : 'Black';
  const turnPlayer = gameRef.current.turn() === 'w' ? white : black;

  const checkEnd = () => {
    const g = gameRef.current;
    if (g.isCheckmate()) {
      // The player who just moved (opposite of current turn) wins
      const winner = g.turn() === 'w' ? black : white;
      setStatus(`Checkmate! ${winner.name} wins.`);
      setTimeout(() => onWinner(winner), 1200);
      return true;
    }
    if (g.isDraw() || g.isStalemate() || g.isThreefoldRepetition() || g.isInsufficientMaterial()) {
      setStatus(`Draw. Tap a winner below.`);
      return true;
    }
    setStatus(g.inCheck() ? `${turnColor} (${turnPlayer.name}) is in check` : '');
    return false;
  };

  const onPieceDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = gameRef.current.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (!move) return false;
      setFen(gameRef.current.fen());
      checkEnd();
      return true;
    } catch {
      return false;
    }
  };

  const resign = (loser: FamilyMember) => {
    const winner = loser.id === white.id ? black : white;
    setStatus(`${loser.name} resigned. ${winner.name} wins.`);
    setTimeout(() => onWinner(winner), 800);
  };

  const restart = () => {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setStatus('');
  };

  return (
    <div className="card-interactive p-6 space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Crown className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-bold">Chess Match</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-center text-sm">
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-muted-foreground">White</p>
          <p className="font-bold">{white.name}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-muted-foreground">Black</p>
          <p className="font-bold">{black.name}</p>
        </div>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Turn: <span className="font-semibold text-foreground">{turnPlayer.name}</span> ({turnColor})
      </p>
      <div className="max-w-md mx-auto">
        <Chessboard
          position={fen}
          onPieceDrop={onPieceDrop}
          boardOrientation={gameRef.current.turn() === 'w' ? 'white' : 'black'}
          id="fairchair-chess"
        />
      </div>
      {status && <p className="text-center font-semibold">{status}</p>}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <Button variant="outline" onClick={restart}><RotateCcw className="w-4 h-4 mr-1" />Restart</Button>
        <Button variant="outline" onClick={() => resign(white)}><Flag className="w-4 h-4 mr-1" />{white.name} resigns</Button>
        <Button variant="outline" onClick={() => resign(black)}><Flag className="w-4 h-4 mr-1" />{black.name} resigns</Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="hero" onClick={() => onWinner(p1)}><Trophy className="w-4 h-4 mr-2" />{p1.name} won</Button>
        <Button variant="hero" onClick={() => onWinner(p2)}><Trophy className="w-4 h-4 mr-2" />{p2.name} won</Button>
      </div>
    </div>
  );
};

export default GameMode;

/* Reaction Time — best of 3, fastest reflex wins */
const ReactionTime: React.FC<{ p1: FamilyMember; p2: FamilyMember; onWinner: (m: FamilyMember) => void }> = ({ p1, p2, onWinner }) => {
  const ROUNDS = 3;
  const [turn, setTurn] = useState<0 | 1>(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'go' | 'result' | 'foul'>('idle');
  const [startAt, setStartAt] = useState(0);
  const [reaction, setReaction] = useState<number | null>(null);
  const [times, setTimes] = useState<{ p1: number[]; p2: number[] }>({ p1: [], p2: [] });
  const timerRef = React.useRef<number | null>(null);
  const current = turn === 0 ? p1 : p2;

  const clearTimer = () => {
    if (timerRef.current !== null) { window.clearTimeout(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => () => clearTimer(), []);

  const begin = () => {
    setReaction(null);
    setPhase('waiting');
    const delay = 1500 + Math.random() * 2500;
    timerRef.current = window.setTimeout(() => {
      setStartAt(Date.now());
      setPhase('go');
    }, delay);
  };

  const tap = () => {
    if (phase === 'waiting') {
      clearTimer();
      setPhase('foul');
      return;
    }
    if (phase === 'go') {
      const t = Date.now() - startAt;
      setReaction(t);
      setPhase('result');
    }
  };

  const record = (ms: number) => {
    const key = turn === 0 ? 'p1' : 'p2';
    const updated = { ...times, [key]: [...times[key], ms] };
    setTimes(updated);

    const lastOfRound = turn === 1;
    if (lastOfRound && round >= ROUNDS) {
      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      onWinner(avg(updated.p1) <= avg(updated.p2) ? p1 : p2);
      return;
    }
    if (turn === 0) setTurn(1);
    else { setTurn(0); setRound(r => r + 1); }
    setPhase('idle');
    setReaction(null);
  };

  const nextStep = () => {
    if (phase === 'foul') {
      record(2000); // 2s penalty
    } else if (phase === 'result' && reaction !== null) {
      record(reaction);
    }
  };

  const bg =
    phase === 'go' ? 'bg-success' :
    phase === 'waiting' ? 'bg-destructive' :
    phase === 'foul' ? 'bg-warning' :
    'bg-muted/40';

  const label =
    phase === 'idle' ? 'Tap Start, then tap when the box turns GREEN' :
    phase === 'waiting' ? 'Wait for green…' :
    phase === 'go' ? 'TAP NOW!' :
    phase === 'foul' ? 'Too early! +2.00s penalty' :
    `${fmt(reaction ?? 0)} reaction`;

  return (
    <div className="card-interactive p-8 space-y-5">
      <TurnHeader player={current} label={`Reaction Time — Round ${round} of ${ROUNDS} (pass the device)`} />
      <button
        onClick={tap}
        disabled={phase !== 'waiting' && phase !== 'go'}
        className={`w-full h-56 rounded-2xl ${bg} text-white text-3xl font-extrabold flex items-center justify-center transition-colors disabled:cursor-default`}
      >
        {label}
      </button>
      {phase === 'idle' && (
        <Button variant="hero" size="lg" className="w-full" onClick={begin}>Start {current.name}'s Turn</Button>
      )}
      {(phase === 'result' || phase === 'foul') && (
        <Button variant="hero" size="lg" className="w-full" onClick={nextStep}>
          {turn === 1 && round >= ROUNDS ? 'See Winner' : 'Next Turn'}
        </Button>
      )}
      <div className="grid grid-cols-2 gap-3 text-center text-sm">
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-muted-foreground">{p1.name}</p>
          <p className="font-bold">{times.p1.map(fmt).join(' • ') || '—'}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-muted-foreground">{p2.name}</p>
          <p className="font-bold">{times.p2.map(fmt).join(' • ') || '—'}</p>
        </div>
      </div>
    </div>
  );
};