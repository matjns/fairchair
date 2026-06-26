import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Flame, Medal, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFamilyMembers, FamilyMember } from '@/hooks/useFamilyMembers';
import { useSeatingHistory, SeatingRecord } from '@/hooks/useSeatingHistory';

interface MemberStats {
  member: FamilyMember;
  totalWins: number;
  byMode: Record<string, number>;
  currentStreak: number;
  lastWin?: string;
}

const computeStats = (members: FamilyMember[], history: SeatingRecord[]): MemberStats[] => {
  // History is newest first
  const ordered = [...history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Group by "battle" — same mode + same minute = one battle event
  const battles: { mode: string; winnerId: string; at: string }[] = [];
  const seen = new Set<string>();
  for (const h of ordered) {
    const bucket = `${h.mode}-${new Date(h.created_at).toISOString().slice(0, 16)}`;
    if (seen.has(bucket)) continue;
    seen.add(bucket);
    battles.push({ mode: h.mode, winnerId: h.family_member_id, at: h.created_at });
  }

  return members.map(m => {
    const wins = battles.filter(b => b.winnerId === m.id);
    const byMode: Record<string, number> = {};
    wins.forEach(w => { byMode[w.mode] = (byMode[w.mode] ?? 0) + 1; });

    // Current streak: consecutive battles (most recent first) won by this member
    let streak = 0;
    for (const b of battles) {
      if (b.winnerId === m.id) streak++;
      else break;
    }

    return {
      member: m,
      totalWins: wins.length,
      byMode,
      currentStreak: streak,
      lastWin: wins[0]?.at,
    };
  }).sort((a, b) => b.totalWins - a.totalWins || b.currentStreak - a.currentStreak);
};

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const { familyMembers, loading: lm } = useFamilyMembers();
  const { history, loading: lh } = useSeatingHistory();

  useEffect(() => {
    let t: number | null = null;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setAuthed(!!s?.user);
      if (t !== null) { window.clearTimeout(t); t = null; }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session?.user);
      if (!session?.user) t = window.setTimeout(() => navigate('/auth?redirect=/leaderboard'), 400);
    });
    return () => { subscription.unsubscribe(); if (t !== null) window.clearTimeout(t); };
  }, [navigate]);

  const stats = useMemo(() => computeStats(familyMembers, history), [familyMembers, history]);
  const topWins = stats[0]?.totalWins ?? 0;

  if (authed === null || lm || lh) {
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
            <Trophy className="w-5 h-5 text-primary" /> Leaderboard
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="text-center space-y-2">
          <Trophy className="w-12 h-12 text-warning mx-auto" />
          <h1 className="text-3xl font-bold">Family Leaderboard</h1>
          <p className="text-muted-foreground">All-time seat-battle wins, streaks, and mode mastery.</p>
        </div>

        {stats.length === 0 ? (
          <div className="card-interactive p-8 text-center text-muted-foreground">
            No family members yet. Add some in{' '}
            <Link to="/family-profiles" className="text-primary underline">Family Profiles</Link>.
          </div>
        ) : (
          <div className="space-y-3">
            {stats.map((s, i) => {
              const rankIcon = i === 0 ? Crown : Medal;
              const RankIcon = rankIcon;
              const rankColor = i === 0 ? 'text-warning' : i === 1 ? 'text-muted-foreground' : i === 2 ? 'text-accent' : 'text-muted-foreground/60';
              const isLeader = i === 0 && s.totalWins > 0;
              return (
                <div key={s.member.id} className={`card-interactive p-5 flex items-center gap-4 ${isLeader ? 'ring-2 ring-warning/40' : ''}`}>
                  <div className="flex items-center gap-2 w-12">
                    <RankIcon className={`w-6 h-6 ${rankColor}`} />
                    <span className="font-bold text-lg">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg truncate">{s.member.name}</h3>
                      {s.member.is_parent && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Adult</span>
                      )}
                      {s.currentStreak >= 2 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {s.currentStreak} streak
                        </span>
                      )}
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60"
                        style={{ width: `${topWins ? (s.totalWins / topWins) * 100 : 0}%` }}
                      />
                    </div>
                    {Object.keys(s.byMode).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {Object.entries(s.byMode).map(([mode, n]) => (
                          <span key={mode} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                            {mode}: {n}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold text-primary">{s.totalWins}</p>
                    <p className="text-xs text-muted-foreground">wins</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;