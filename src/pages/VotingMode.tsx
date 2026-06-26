import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Vote, Trophy, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFamilyMembers, FamilyMember } from '@/hooks/useFamilyMembers';
import { FamilyMemberCard } from '@/components/modes/FamilyMemberCard';
import { SeatWinnerDisplay } from '@/components/modes/SeatWinnerDisplay';

type Step = 'intro' | 'vote' | 'tally' | 'final';

const VotingMode: React.FC = () => {
  const navigate = useNavigate();
  const { familyMembers, loading } = useFamilyMembers();
  const candidates = familyMembers.filter(m => !m.is_parent); // kids compete for the seat
  const voters = familyMembers; // everyone votes (no self-vote)

  const [step, setStep] = useState<Step>('intro');
  const [voterIdx, setVoterIdx] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [winner, setWinner] = useState<FamilyMember | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  const currentVoter = voters[voterIdx];

  const castVote = (candidateId: string) => {
    const next = { ...votes, [candidateId]: (votes[candidateId] ?? 0) + 1 };
    setVotes(next);
    if (voterIdx + 1 < voters.length) setVoterIdx(voterIdx + 1);
    else {
      // Determine winner
      const max = Math.max(...Object.values(next));
      const top = candidates.filter(c => (next[c.id] ?? 0) === max);
      const w = top[Math.floor(Math.random() * top.length)];
      setWinner(w);
      setStep('tally');
    }
  };

  const reset = () => { setStep('intro'); setVotes({}); setVoterIdx(0); setWinner(null); };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-2 font-bold"><Vote className="w-5 h-5 text-primary" /> Voting Mode</div>
          <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="w-4 h-4 mr-1" />Reset</Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {step === 'intro' && (
          <div className="card-interactive p-8 text-center space-y-4">
            <Vote className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">Family Vote</h1>
            <p className="text-muted-foreground">Each family member secretly votes for which kid deserves the best seat today. Most votes wins. Ties broken randomly.</p>
            {candidates.length < 2 || voters.length < 2 ? (
              <p className="text-warning">Need at least 2 voters and 2 kid candidates. Add more in <Link to="/family-profiles" className="text-primary underline">Family Profiles</Link>.</p>
            ) : (
              <Button variant="hero" size="lg" onClick={() => setStep('vote')}>Start Voting</Button>
            )}
          </div>
        )}

        {step === 'vote' && currentVoter && (
          <div className="space-y-5">
            <div className="card-interactive p-5 text-center">
              <p className="text-sm text-muted-foreground">Voter {voterIdx + 1} of {voters.length} — pass the device</p>
              <h2 className="text-2xl font-bold text-primary mt-1">{currentVoter.name}</h2>
              <p className="text-xs text-muted-foreground mt-1">Tap who you think deserves the best seat</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {candidates.filter(c => c.id !== currentVoter.id).map(c => (
                <FamilyMemberCard key={c.id} member={c} onClick={() => castVote(c.id)} showPoints={false} />
              ))}
            </div>
          </div>
        )}

        {step === 'tally' && winner && (
          <div className="card-interactive p-8 space-y-4">
            <h2 className="text-2xl font-bold text-center">The Votes Are In</h2>
            <div className="space-y-2">
              {candidates
                .slice()
                .sort((a, b) => (votes[b.id] ?? 0) - (votes[a.id] ?? 0))
                .map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-muted/40 rounded-lg p-3">
                    <span className="font-semibold flex items-center gap-2">
                      {c.id === winner.id && <Trophy className="w-4 h-4 text-warning" />}
                      {c.name}
                    </span>
                    <span className="flex items-center gap-1"><Check className="w-4 h-4 text-success" /> {votes[c.id] ?? 0}</span>
                  </div>
                ))}
            </div>
            <Button variant="hero" size="lg" className="w-full" onClick={() => setStep('final')}>See Winner</Button>
          </div>
        )}

        {step === 'final' && winner && (
          <SeatWinnerDisplay
            winner={winner}
            seatDescription="Best seat — chosen by the family!"
            mode={'random' as any}
            onDone={() => navigate('/assignments')}
          />
        )}
      </main>
    </div>
  );
};

export default VotingMode;