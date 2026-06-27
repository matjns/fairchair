import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Trophy, Flame, Star, Brain, ListChecks, Crown, Sparkles } from 'lucide-react';
import { useFamilyMembers, FamilyMember } from '@/hooks/useFamilyMembers';
import { useSeatingHistory, SeatingRecord } from '@/hooks/useSeatingHistory';

interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  check: (wins: SeatingRecord[], member: FamilyMember) => boolean;
}

const BADGES: BadgeDef[] = [
  { id: 'first',     name: 'First Win',       description: 'Win your very first seat battle.',          icon: Sparkles,   check: w => w.length >= 1 },
  { id: 'three',     name: 'Triple Threat',   description: 'Win 3 seat battles total.',                 icon: Trophy,     check: w => w.length >= 3 },
  { id: 'ten',       name: 'Seat Legend',     description: 'Win 10 seat battles total.',                icon: Crown,      check: w => w.length >= 10 },
  { id: 'chore',     name: 'Chore Champion',  description: 'Win at least 3 Chore Mode battles.',        icon: ListChecks, check: w => w.filter(r => r.mode === 'chore').length >= 3 },
  { id: 'quiz',      name: 'Brainiac',        description: 'Win at least 3 Quiz Mode battles.',         icon: Brain,      check: w => w.filter(r => r.mode === 'quiz').length >= 3 },
  { id: 'points50',  name: 'Hard Worker',     description: 'Earn 50+ total chore points.',              icon: Star,       check: (_w, m) => m.total_chore_points >= 50 },
  { id: 'streak',    name: 'On Fire',         description: 'Win 3 seat battles in a row.',              icon: Flame,      check: () => false },
];

const Achievements: React.FC = () => {
  const { familyMembers, loading: ml } = useFamilyMembers();
  const { history, loading: hl } = useSeatingHistory();

  const computed = useMemo(() => {
    return familyMembers.map(m => {
      const wins = history.filter(h => h.family_member_id === m.id);
      const chrono = [...history].reverse();
      let max = 0, cur = 0;
      chrono.forEach(r => {
        if (r.family_member_id === m.id) { cur++; max = Math.max(max, cur); }
        else cur = 0;
      });
      const earned = BADGES.filter(b => b.id === 'streak' ? max >= 3 : b.check(wins, m));
      return { member: m, wins, earned, streak: max };
    });
  }, [familyMembers, history]);

  if (ml || hl) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-2 font-bold"><Award className="w-5 h-5 text-primary" /> Achievements</div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Family Achievements</h1>
          <p className="text-muted-foreground">Unlock badges by winning seat battles and earning chore points.</p>
        </div>

        {computed.length === 0 && (
          <div className="card-interactive p-8 text-center">
            <p className="text-muted-foreground">No family members yet. Add some in <Link to="/family-profiles" className="text-primary underline">Family Profiles</Link>.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {computed.map(({ member, wins, earned, streak }) => (
            <div key={member.id} className="card-interactive p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {wins.length} wins • {streak >= 2 ? `🔥 ${streak} streak` : 'No active streak'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-primary">{earned.length}</p>
                  <p className="text-xs text-muted-foreground">/ {BADGES.length} badges</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {BADGES.map(b => {
                  const got = earned.some(e => e.id === b.id);
                  return (
                    <div key={b.id} className={`rounded-xl p-3 text-center transition ${got ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/30 opacity-40'}`} title={`${b.name} — ${b.description}`}>
                      <b.icon className={`w-6 h-6 mx-auto ${got ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="text-[10px] font-semibold mt-1 leading-tight">{b.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Achievements;