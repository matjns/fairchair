import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Settings2, Trophy, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFamilyMembers, FamilyMember } from '@/hooks/useFamilyMembers';
import { FamilyMemberCard } from '@/components/modes/FamilyMemberCard';
import { SeatWinnerDisplay } from '@/components/modes/SeatWinnerDisplay';

type Step = 'setup' | 'config' | 'play' | 'final';

interface RoundResult { winnerId: string; rule: string; }

const STORAGE_KEY = 'fairchair_custom_mode';

const CustomMode: React.FC = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>('setup');

  const [modeName, setModeName] = useState('Our Family Challenge');
  const [description, setDescription] = useState('Whoever does the best at our challenge wins the seat!');
  const [rules, setRules] = useState<string[]>(['Highest score wins']);
  const [newRule, setNewRule] = useState('');
  const [totalRounds, setTotalRounds] = useState(3);
  const [seatDescription, setSeatDescription] = useState('Best seat');
  const [players, setPlayers] = useState<FamilyMember[]>([]);

  const [round, setRound] = useState(1);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [winner, setWinner] = useState<FamilyMember | null>(null);

  const { familyMembers, loading } = useFamilyMembers();
  const kids = familyMembers.filter(m => !m.is_parent);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthed(!!session?.user);
      if (!session?.user) navigate('/auth?redirect=/custom-mode');
    })();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const c = JSON.parse(saved);
        setModeName(c.modeName ?? 'Our Family Challenge');
        setDescription(c.description ?? '');
        setRules(c.rules ?? []);
        setTotalRounds(c.totalRounds ?? 3);
        setSeatDescription(c.seatDescription ?? 'Best seat');
      } catch {}
    }
  }, [navigate]);

  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ modeName, description, rules, totalRounds, seatDescription }));
  };

  const togglePlayer = (m: FamilyMember) => {
    setPlayers(p => p.find(x => x.id === m.id) ? p.filter(x => x.id !== m.id) : [...p, m]);
  };

  const pickWinner = (m: FamilyMember) => {
    const next: RoundResult[] = [...results, { winnerId: m.id, rule: `Round ${round}` }];
    if (round >= totalRounds) {
      const tally: Record<string, number> = {};
      next.forEach(r => { tally[r.winnerId] = (tally[r.winnerId] ?? 0) + 1; });
      const winnerId = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
      const w = players.find(p => p.id === winnerId) ?? m;
      setResults(next); setWinner(w); setStep('final');
    } else {
      setResults(next); setRound(r => r + 1);
    }
  };

  const reset = () => {
    setStep('setup'); setRound(1); setResults([]); setWinner(null); setPlayers([]);
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
            <Settings2 className="w-5 h-5 text-primary" /> Custom Mode
          </div>
          <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="w-4 h-4 mr-1" />Reset</Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {step === 'setup' && (
          <div className="card-interactive p-8 space-y-4 text-center">
            <Settings2 className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">Custom Mode</h1>
            <p className="text-muted-foreground">Design your own seat-picking game. Set the name, the rules, the rounds — everything is up to you.</p>
            <Button variant="hero" size="lg" onClick={() => setStep('config')}>Customize</Button>
          </div>
        )}

        {step === 'config' && (
          <div className="space-y-5">
            <div className="card-interactive p-6 space-y-4">
              <h2 className="font-bold text-xl">Mode Details</h2>
              <div className="space-y-2">
                <Label>Mode Name</Label>
                <Input value={modeName} onChange={e => setModeName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Rounds</Label>
                  <Input type="number" min={1} max={20} value={totalRounds}
                    onChange={e => setTotalRounds(Math.max(1, parseInt(e.target.value) || 1))} />
                </div>
                <div className="space-y-2">
                  <Label>Seat at Stake</Label>
                  <Input value={seatDescription} onChange={e => setSeatDescription(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rules</Label>
                <ul className="space-y-2">
                  {rules.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                      <span className="flex-1 text-sm">{r}</span>
                      <Button variant="ghost" size="icon" onClick={() => setRules(rs => rs.filter((_, j) => j !== i))}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Input value={newRule} placeholder="Add a rule" onChange={e => setNewRule(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && newRule.trim()) { setRules([...rules, newRule.trim()]); setNewRule(''); } }} />
                  <Button variant="outline" onClick={() => { if (newRule.trim()) { setRules([...rules, newRule.trim()]); setNewRule(''); } }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="card-interactive p-6 space-y-4">
              <h2 className="font-bold text-xl">Pick Players</h2>
              {kids.length === 0 ? (
                <p className="text-muted-foreground text-sm">Add kids in <Link to="/family-profiles" className="text-primary underline">Family Profiles</Link> first.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {kids.map(k => (
                    <FamilyMemberCard key={k.id} member={k} onClick={() => togglePlayer(k)}
                      selected={!!players.find(p => p.id === k.id)} showPoints={false} />
                  ))}
                </div>
              )}
            </div>

            <Button variant="hero" size="lg" className="w-full"
              disabled={players.length < 2}
              onClick={() => { saveConfig(); setStep('play'); }}>
              Start {modeName}
            </Button>
          </div>
        )}

        {step === 'play' && (
          <div className="space-y-5">
            <div className="card-interactive p-6">
              <p className="text-sm text-muted-foreground">Round {round} of {totalRounds}</p>
              <h2 className="text-2xl font-bold">{modeName}</h2>
              <p className="text-muted-foreground mt-2">{description}</p>
              {rules.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm list-disc pl-5">
                  {rules.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Who won this round?</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {players.map(p => (
                  <Button key={p.id} variant="outline" size="lg" className="h-auto py-4 justify-start" onClick={() => pickWinner(p)}>
                    <Trophy className="w-5 h-5 mr-2 text-warning" />
                    <span className="font-semibold">{p.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {results.length > 0 && (
              <div className="card-interactive p-4">
                <p className="text-sm font-semibold mb-2">Round wins</p>
                <div className="flex flex-wrap gap-2">
                  {players.map(p => {
                    const c = results.filter(r => r.winnerId === p.id).length;
                    return (
                      <div key={p.id} className="px-3 py-1 rounded-full bg-muted text-sm">
                        {p.name}: <span className="font-bold">{c}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'final' && winner && (
          <SeatWinnerDisplay
            winner={winner}
            seatDescription={seatDescription}
            mode={'random' as any}
            onDone={() => navigate('/assignments')}
          />
        )}
      </main>
    </div>
  );
};

export default CustomMode;