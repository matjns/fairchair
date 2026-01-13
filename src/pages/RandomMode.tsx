import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChairIcon } from '@/components/icons/ChairIcon';
import { 
  Sparkles, ArrowLeft, Shuffle, Users, Trophy, RotateCcw, History
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFamilyMembers, FamilyMember } from '@/hooks/useFamilyMembers';
import { useSeatingHistory } from '@/hooks/useSeatingHistory';
import { FamilyMemberCard } from '@/components/modes/FamilyMemberCard';
import { AddFamilyMemberForm } from '@/components/modes/AddFamilyMemberForm';
import { SeatWinnerDisplay } from '@/components/modes/SeatWinnerDisplay';

const RandomMode: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'family' | 'history' | 'pick'>('family');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningName, setSpinningName] = useState<string | null>(null);
  const [winner, setWinner] = useState<FamilyMember | null>(null);

  const { familyMembers, loading, addFamilyMember, deleteFamilyMember } = useFamilyMembers();
  const { history, selectWeightedRandom, recordSeating, getSeatCountsForMember } = useSeatingHistory();

  const kids = familyMembers.filter(m => !m.is_parent);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
      if (!session?.user) {
        navigate('/auth?redirect=/random-mode');
      }
    };
    checkAuth();
  }, [navigate]);

  const spinWheel = () => {
    if (kids.length < 2) return;
    
    setIsSpinning(true);
    setWinner(null);
    
    // Animate through names
    let spins = 0;
    const maxSpins = 20;
    const spinInterval = setInterval(() => {
      const randomKid = kids[Math.floor(Math.random() * kids.length)];
      setSpinningName(randomKid.name);
      spins++;
      
      if (spins >= maxSpins) {
        clearInterval(spinInterval);
        
        // Select weighted random winner
        const selectedWinner = selectWeightedRandom(kids, 'best-seat');
        if (selectedWinner) {
          setSpinningName(selectedWinner.name);
          setTimeout(() => {
            setWinner(selectedWinner);
            setIsSpinning(false);
            recordSeating(selectedWinner.id, 'best-seat', 'preferred', 'random');
          }, 500);
        }
      }
    }, 100);
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

  if (winner) {
    return (
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="card-elevated p-8">
            <SeatWinnerDisplay
              winner={winner}
              seatDescription="Best Seat (Fair & Random!)"
              mode="random"
              onDone={() => {
                setWinner(null);
                setActiveTab('family');
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Get recent history with member names
  const recentHistory = history.slice(0, 10).map(record => {
    const member = familyMembers.find(m => m.id === record.family_member_id);
    return { ...record, memberName: member?.name || 'Unknown' };
  });

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Shuffle className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">Random/Fair Mode</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Fair & Random Selection!</h1>
          <p className="text-muted-foreground">Everyone gets a fair turn—those who had it less recently have better odds.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'family', label: 'Family', icon: Users },
            { id: 'history', label: 'History', icon: History },
            { id: 'pick', label: 'Pick Winner', icon: Trophy },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="flex-1"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="card-elevated p-6">
          {activeTab === 'family' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Family Members</h2>
              {familyMembers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No family members yet. Add your first one!</p>
              ) : (
                <div className="space-y-3">
                  {familyMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <FamilyMemberCard
                          member={member}
                          onDelete={() => deleteFamilyMember(member.id)}
                          showPoints={false}
                        />
                      </div>
                      {!member.is_parent && (
                        <div className="text-center px-3">
                          <p className="text-2xl font-bold text-primary">{getSeatCountsForMember(member.id)}</p>
                          <p className="text-xs text-muted-foreground">wins</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <AddFamilyMemberForm onAdd={addFamilyMember} />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Seat Assignments</h2>
              {recentHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No history yet. Start picking winners!</p>
              ) : (
                <div className="space-y-2">
                  {recentHistory.map((record, index) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-foreground">{record.memberName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.created_at).toLocaleDateString()} • {record.mode} mode
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-primary font-medium">
                        {record.seat_position}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pick' && (
            <div className="space-y-6 text-center">
              {kids.length < 2 ? (
                <p className="text-muted-foreground py-8">
                  Add at least 2 kids to use Random Mode!
                </p>
              ) : (
                <>
                  <div className="py-8">
                    <div 
                      className={`inline-block px-8 py-6 rounded-2xl ${
                        isSpinning 
                          ? 'bg-primary/20 animate-pulse' 
                          : 'bg-muted/50'
                      }`}
                    >
                      {isSpinning ? (
                        <p className="text-3xl font-bold text-primary">
                          {spinningName}
                        </p>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Shuffle className="w-8 h-8 text-muted-foreground" />
                          <p className="text-xl text-muted-foreground">Press spin to pick!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Eligible kids:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {kids.map(kid => (
                        <span
                          key={kid.id}
                          className="px-3 py-1 bg-muted rounded-full text-sm font-medium text-foreground"
                        >
                          {kid.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="hero"
                    size="lg"
                    onClick={spinWheel}
                    disabled={isSpinning}
                    className="mt-4"
                  >
                    {isSpinning ? (
                      <>
                        <RotateCcw className="w-5 h-5 mr-2 animate-spin" />
                        Spinning...
                      </>
                    ) : (
                      <>
                        <Shuffle className="w-5 h-5 mr-2" />
                        Spin the Wheel!
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-muted-foreground mt-4">
                    Kids who haven't won recently have better odds!
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RandomMode;
