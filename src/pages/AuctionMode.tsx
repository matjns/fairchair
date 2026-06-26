import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gavel, Star, Trophy, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useFamilyMembers, FamilyMember } from '@/hooks/useFamilyMembers';
import { FamilyMemberCard } from '@/components/modes/FamilyMemberCard';
import { SeatWinnerDisplay } from '@/components/modes/SeatWinnerDisplay';
import { toast } from '@/hooks/use-toast';

type Step = 'intro' | 'bidding' | 'reveal' | 'final';

const AuctionMode: React.FC = () => {
  const navigate = useNavigate();
  const { familyMembers, loading, updateChorePoints, refetch } = useFamilyMembers();
  const kids = familyMembers.filter(m => !m.is_parent);
  const [step, setStep] = useState<Step>('intro');
  const [idx, setIdx] = useState(0);
  const [bids, setBids] = useState<Record<string, number>>({});
  const [currentBid, setCurrentBid] = useState('');
  const [hidden, setHidden] = useState(true);
  const [winner, setWinner] = useState<FamilyMember | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  const current = kids[idx];

  const submitBid = () => {
    const n = Math.max(0, Math.floor(Number(currentBid) || 0));
    if (n > current.total_chore_points) {
      toast({ title: 'Not enough points', description: `${current.name} only has ${current.total_chore_points} points.`, variant: 'destructive' });
      return;
    }
    const next = { ...bids, [current.id]: n };
    setBids(next);
    setCurrentBid('');
    setHidden(true);
    if (idx + 1 < kids.length) setIdx(idx + 1);
    else setStep('reveal');
  };

  const finalize = async () => {
    const sorted = [...kids].sort((a, b) => (bids[b.id] ?? 0) - (bids[a.id] ?? 0));
    const top = bids[sorted[0].id] ?? 0;
    const topBidders = sorted.filter(k => (bids[k.id] ?? 0) === top);
    const w = topBidders[Math.floor(Math.random() * topBidders.length)];
    // Deduct points only from winner
    if (top > 0) await updateChorePoints(w.id, -top);
    await refetch();
    setWinner(w);
    setStep('final');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-2 font-bold"><Gavel className="w-5 h-5 text-primary" /> Auction Mode</div>
          <Button variant="ghost" size="sm" onClick={() => { setStep('intro'); setBids({}); setIdx(0); setWinner(null); }}>
            <RotateCcw className="w-4 h-4 mr-1" />Reset
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {step === 'intro' && (
          <div className="card-interactive p-8 text-center space-y-4">
            <Gavel className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">Bid for the Best Seat</h1>
            <p className="text-muted-foreground">Each kid secretly bids their chore points. Highest bidder wins the seat — and pays their points. Ties are broken by a coin flip.</p>
            {kids.length < 2 ? (
              <p className="text-warning">Add at least 2 kids in <Link to="/family-profiles" className="text-primary underline">Family Profiles</Link>.</p>
            ) : (
              <Button variant="hero" size="lg" onClick={() => setStep('bidding')}>Start Auction</Button>
            )}
          </div>
        )}

        {step === 'bidding' && current && (
          <div className="card-interactive p-8 space-y-5">
            <p className="text-center text-sm text-muted-foreground">Bidder {idx + 1} of {kids.length} — pass the device</p>
            <FamilyMemberCard member={current} />
            <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-warning fill-warning" /> Available: {current.total_chore_points} pts
            </div>
            <div className="relative">
              <Input
                autoFocus
                type={hidden ? 'password' : 'number'}
                inputMode="numeric"
                value={currentBid}
                onChange={e => setCurrentBid(e.target.value)}
                placeholder="Your secret bid"
                onKeyDown={e => e.key === 'Enter' && submitBid()}
                className="pr-12 text-center text-xl"
              />
              <button type="button" onClick={() => setHidden(h => !h)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <Button variant="hero" size="lg" className="w-full" onClick={submitBid}>Lock In Bid</Button>
          </div>
        )}

        {step === 'reveal' && (
          <div className="card-interactive p-8 space-y-5">
            <h2 className="text-2xl font-bold text-center">Reveal the Bids</h2>
            <div className="space-y-2">
              {kids.map(k => (
                <div key={k.id} className="flex items-center justify-between bg-muted/40 rounded-lg p-3">
                  <span className="font-semibold">{k.name}</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-warning fill-warning" /> {bids[k.id] ?? 0}</span>
                </div>
              ))}
            </div>
            <Button variant="hero" size="lg" className="w-full" onClick={finalize}>
              <Trophy className="w-5 h-5 mr-2" /> Crown the Winner
            </Button>
          </div>
        )}

        {step === 'final' && winner && (
          <SeatWinnerDisplay
            winner={winner}
            seatDescription={`Best seat — paid ${bids[winner.id] ?? 0} points!`}
            mode={'chore' as any}
            onDone={() => navigate('/assignments')}
          />
        )}
      </main>
    </div>
  );
};

export default AuctionMode;