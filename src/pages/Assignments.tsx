import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { ChairIcon } from '@/components/icons/ChairIcon';
import {
  ArrowLeft,
  Brain,
  ListChecks,
  Shuffle,
  Trophy,
  Trash2,
  Share2,
  Filter,
  Sparkles,
  Crown,
  Flame,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFamilyMembers, FamilyMember } from '@/hooks/useFamilyMembers';
import { useSeatingHistory, SeatingRecord } from '@/hooks/useSeatingHistory';
import { useToast } from '@/hooks/use-toast';

type ModeFilter = 'all' | 'chore' | 'quiz' | 'random';

const MODE_META: Record<
  Exclude<ModeFilter, 'all'>,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  chore: { label: 'Chore Mode', icon: ListChecks, color: 'text-success' },
  quiz: { label: 'Quiz Mode', icon: Brain, color: 'text-primary' },
  random: { label: 'Random / Fair Mode', icon: Shuffle, color: 'text-warning' },
};

const Assignments: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { familyMembers, loading: membersLoading } = useFamilyMembers();
  const { history, loading: historyLoading, refetch } = useSeatingHistory();
  const [filter, setFilter] = useState<ModeFilter>('all');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        setAuthChecked(true);
      }
    });
  }, [navigate]);

  const memberById = useMemo(() => {
    const map = new Map<string, FamilyMember>();
    familyMembers.forEach((m) => map.set(m.id, m));
    return map;
  }, [familyMembers]);

  const filtered = useMemo(
    () => (filter === 'all' ? history : history.filter((h) => h.mode === filter)),
    [history, filter]
  );

  // Latest assignment per member (for "current seats")
  const latestByMember = useMemo(() => {
    const map = new Map<string, SeatingRecord>();
    filtered.forEach((rec) => {
      if (!map.has(rec.family_member_id)) map.set(rec.family_member_id, rec);
    });
    return map;
  }, [filtered]);

  // Wins per member
  const winsByMember = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((rec) => {
      map.set(rec.family_member_id, (map.get(rec.family_member_id) ?? 0) + 1);
    });
    return map;
  }, [filtered]);

  const leaderboard = useMemo(() => {
    return [...familyMembers]
      .map((m) => ({ member: m, wins: winsByMember.get(m.id) ?? 0 }))
      .sort((a, b) => b.wins - a.wins);
  }, [familyMembers, winsByMember]);

  // Streaks: consecutive most-recent wins by the same member
  const currentStreak = useMemo(() => {
    if (filtered.length === 0) return null as null | { member: FamilyMember; count: number };
    const first = filtered[0];
    let count = 0;
    for (const rec of filtered) {
      if (rec.family_member_id === first.family_member_id) count++;
      else break;
    }
    const member = memberById.get(first.family_member_id);
    if (!member) return null;
    return { member, count };
  }, [filtered, memberById]);

  const handleClearHistory = async () => {
    if (!confirm('Clear all seat assignment history? This cannot be undone.')) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { error } = await supabase
      .from('seating_history')
      .delete()
      .eq('user_id', session.user.id);
    if (error) {
      toast({ title: 'Could not clear', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'History cleared' });
      refetch();
    }
  };

  const handleShare = async () => {
    const lines = filtered.slice(0, 10).map((rec) => {
      const name = memberById.get(rec.family_member_id)?.name ?? 'Someone';
      return `${name} — ${rec.row_position}, ${rec.seat_position} (${rec.mode})`;
    });
    const text = `FairChair seat assignments:\n${lines.join('\n')}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'FairChair Assignments', text });
      } else {
        await navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard!' });
      }
    } catch {
      /* user cancelled */
    }
  };

  const loading = membersLoading || historyLoading || !authChecked;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ChairIcon className="w-8 h-8 text-primary" filled />
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
              Seat Assignments
            </h1>
            <p className="text-muted-foreground mt-1">
              See who won which seat from every game mode.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleShare} disabled={filtered.length === 0}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button
              variant="outline"
              onClick={handleClearHistory}
              disabled={history.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear History
            </Button>
          </div>
        </div>

        {/* Mode filter */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(['all', 'chore', 'quiz', 'random'] as ModeFilter[]).map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === m
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:bg-secondary'
              }`}
            >
              {m === 'all' ? 'All Modes' : MODE_META[m].label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading…</div>
        ) : familyMembers.length === 0 ? (
          <div className="card-elevated p-10 text-center">
            <h2 className="text-xl font-bold mb-2">Add your family first</h2>
            <p className="text-muted-foreground mb-6">
              Create family profiles so seats can be assigned to them.
            </p>
            <Button variant="hero" onClick={() => navigate('/family-profiles')}>
              Go to Family Profiles
            </Button>
          </div>
        ) : history.length === 0 ? (
          <div className="card-elevated p-10 text-center">
            <h2 className="text-xl font-bold mb-2">No assignments yet</h2>
            <p className="text-muted-foreground mb-6">
              Play a game mode to start assigning seats fairly.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => navigate('/chore-mode')}>
                <ListChecks className="w-4 h-4 mr-2" /> Chore Mode
              </Button>
              <Button variant="outline" onClick={() => navigate('/quiz-mode')}>
                <Brain className="w-4 h-4 mr-2" /> Quiz Mode
              </Button>
              <Button variant="outline" onClick={() => navigate('/random-mode')}>
                <Shuffle className="w-4 h-4 mr-2" /> Random Mode
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Current seats */}
            <section className="lg:col-span-2 card-elevated p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ChairIcon className="w-5 h-5 text-primary" filled />
                Current Seats
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {familyMembers.map((m) => {
                  const rec = latestByMember.get(m.id);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card"
                    >
                      <div>
                        <div className="font-semibold text-foreground">{m.name}</div>
                        {rec ? (
                          <div className="text-sm text-muted-foreground capitalize">
                            {rec.row_position} · {rec.seat_position}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No seat yet</div>
                        )}
                      </div>
                      {rec && (
                        <ModeBadge mode={rec.mode} />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Leaderboard & streak */}
            <aside className="space-y-6">
              <div className="card-elevated p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  Win Leaderboard
                </h2>
                <ol className="space-y-2">
                  {leaderboard.map((entry, idx) => (
                    <li
                      key={entry.member.id}
                      className="flex items-center justify-between gap-3 p-2 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {idx === 0 ? (
                          <Crown className="w-4 h-4 text-warning" />
                        ) : (
                          <span className="w-4 text-center text-sm text-muted-foreground">
                            {idx + 1}
                          </span>
                        )}
                        <span className="font-medium">{entry.member.name}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {entry.wins} {entry.wins === 1 ? 'win' : 'wins'}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {currentStreak && currentStreak.count > 1 && (
                <div className="card-elevated p-6 bg-gradient-to-br from-warning/10 to-accent/10">
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-warning" />
                    Hot Streak!
                  </h2>
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {currentStreak.member.name}
                    </span>{' '}
                    has won{' '}
                    <span className="font-bold text-warning">{currentStreak.count}</span> in a
                    row.
                  </p>
                </div>
              )}
            </aside>

            {/* Recent history */}
            <section className="lg:col-span-3 card-elevated p-6">
              <h2 className="text-xl font-bold mb-4">Recent Assignments</h2>
              <ul className="divide-y divide-border">
                {filtered.slice(0, 25).map((rec) => {
                  const member = memberById.get(rec.family_member_id);
                  const date = new Date(rec.created_at);
                  return (
                    <li
                      key={rec.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <ModeBadge mode={rec.mode} />
                        <div>
                          <div className="font-medium text-foreground">
                            {member?.name ?? 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {rec.row_position} · {rec.seat_position}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {date.toLocaleDateString()}{' '}
                        {date.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

const ModeBadge: React.FC<{ mode: 'chore' | 'quiz' | 'random' }> = ({ mode }) => {
  const meta = MODE_META[mode];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary ${meta.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {meta.label}
    </span>
  );
};

export default Assignments;