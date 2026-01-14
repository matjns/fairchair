import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChairIcon } from '@/components/icons/ChairIcon';
import { 
  Sparkles, ArrowLeft, ListChecks, Plus, Check, X, Clock,
  Star, Trophy, Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useChores } from '@/hooks/useChores';
import { useSeatingHistory } from '@/hooks/useSeatingHistory';
import { FamilyMemberCard } from '@/components/modes/FamilyMemberCard';
import { AddFamilyMemberForm } from '@/components/modes/AddFamilyMemberForm';
import { SeatWinnerDisplay } from '@/components/modes/SeatWinnerDisplay';

const ChoreMode: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'family' | 'chores' | 'pending' | 'compete'>('family');
  const [newChoreName, setNewChoreName] = useState('');
  const [newChorePoints, setNewChorePoints] = useState('5');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedChore, setSelectedChore] = useState<string | null>(null);
  const [winner, setWinner] = useState<typeof familyMembers[0] | null>(null);

  const { familyMembers, loading: membersLoading, addFamilyMember, deleteFamilyMember } = useFamilyMembers();
  const { chores, pendingSubmissions, loading: choresLoading, addChore, deleteChore, submitChore, reviewSubmission } = useChores();
  const { recordSeating } = useSeatingHistory();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
      if (!session?.user) {
        navigate('/auth?redirect=/chore-mode');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleAddChore = async () => {
    if (!newChoreName.trim()) return;
    try {
      await addChore(newChoreName.trim(), parseInt(newChorePoints) || 5);
      setNewChoreName('');
      setNewChorePoints('5');
    } catch (err) {
      console.error('Failed to add chore:', err);
    }
  };

  const handleSubmitChore = async () => {
    if (!selectedMember || !selectedChore) return;
    try {
      await submitChore(selectedChore, selectedMember);
      setSelectedMember(null);
      setSelectedChore(null);
      setActiveTab('pending');
    } catch (err) {
      console.error('Failed to submit chore:', err);
    }
  };

  const handleReview = async (submissionId: string, approved: boolean, memberId: string, chorePoints: number) => {
    try {
      await reviewSubmission(submissionId, approved, memberId, chorePoints);
    } catch (err) {
      console.error('Failed to review submission:', err);
    }
  };

  const handleCompete = () => {
    // Filter out parents and select winner based on highest points (not random)
    const kids = familyMembers.filter(m => !m.is_parent);
    if (kids.length === 0) return;

    // Sort kids by points descending and pick the one with highest points
    const sortedKids = [...kids].sort((a, b) => b.total_chore_points - a.total_chore_points);
    const topScore = sortedKids[0].total_chore_points;
    
    // Get all kids tied for first place
    const topKids = sortedKids.filter(k => k.total_chore_points === topScore);
    
    // If there's a tie, pick randomly among tied kids
    const selectedWinner = topKids.length === 1 
      ? topKids[0] 
      : topKids[Math.floor(Math.random() * topKids.length)];
    
    setWinner(selectedWinner);
    recordSeating(selectedWinner.id, 'best-seat', 'preferred', 'chore');
  };

  if (isAuthenticated === null || membersLoading) {
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
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-warning/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="card-elevated p-8">
            <SeatWinnerDisplay
              winner={winner}
              seatDescription="Best Seat (Earned by chores!)"
              mode="chore"
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

  const kids = familyMembers.filter(m => !m.is_parent);

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-warning/10 rounded-full blur-3xl" />
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
            <ListChecks className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">Chore Mode</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Earn Your Seat!</h1>
          <p className="text-muted-foreground">Complete chores to earn points. The person with the most points wins!</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'family', label: 'Family', icon: Users },
            { id: 'chores', label: 'Chores', icon: ListChecks },
            { id: 'pending', label: `Review (${pendingSubmissions.length})`, icon: Clock },
            { id: 'compete', label: 'Compete!', icon: Trophy },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="flex-shrink-0"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="card-elevated p-6">
          {activeTab === 'family' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Family Members</h2>
              {familyMembers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No family members yet. Add your first one!</p>
              ) : (
                <div className="space-y-3">
                  {familyMembers.map(member => (
                    <FamilyMemberCard
                      key={member.id}
                      member={member}
                      onDelete={() => deleteFamilyMember(member.id)}
                    />
                  ))}
                </div>
              )}
              <AddFamilyMemberForm onAdd={addFamilyMember} />
            </div>
          )}

          {activeTab === 'chores' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Available Chores</h2>
                {chores.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No chores yet. Add some!</p>
                ) : (
                  <div className="space-y-2">
                    {chores.map(chore => (
                      <div key={chore.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <ListChecks className="w-5 h-5 text-primary" />
                          <span className="font-medium text-foreground">{chore.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-warning flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current" />
                            {chore.points} pts
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => deleteChore(chore.id)}>
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-xl">
                <h3 className="font-medium text-foreground">Add New Chore</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Chore name..."
                    value={newChoreName}
                    onChange={(e) => setNewChoreName(e.target.value)}
                  />
                  <Input
                    type="number"
                    className="w-20"
                    placeholder="Pts"
                    value={newChorePoints}
                    onChange={(e) => setNewChorePoints(e.target.value)}
                  />
                  <Button onClick={handleAddChore} disabled={!newChoreName.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Submit Completed Chore</h3>
                <div className="space-y-3">
                  <Label>Who completed the chore?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {kids.map(kid => (
                      <Button
                        key={kid.id}
                        variant={selectedMember === kid.id ? 'default' : 'outline'}
                        onClick={() => setSelectedMember(kid.id)}
                        className="justify-start"
                      >
                        {kid.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Which chore?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {chores.map(chore => (
                      <Button
                        key={chore.id}
                        variant={selectedChore === chore.id ? 'default' : 'outline'}
                        onClick={() => setSelectedChore(chore.id)}
                        className="justify-start"
                      >
                        {chore.name} ({chore.points} pts)
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleSubmitChore}
                  disabled={!selectedMember || !selectedChore}
                >
                  Submit for Approval
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Pending Approvals</h2>
              {pendingSubmissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending submissions!</p>
              ) : (
                <div className="space-y-3">
                  {pendingSubmissions.map(sub => {
                    const chore = chores.find(c => c.id === sub.chore_id);
                    const member = familyMembers.find(m => m.id === sub.family_member_id);
                    if (!chore || !member) return null;

                    return (
                      <div key={sub.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {chore.name} • {chore.points} points
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReview(sub.id, false, member.id, chore.points)}
                            className="text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReview(sub.id, true, member.id, chore.points)}
                            className="bg-success hover:bg-success/90"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'compete' && (
            <div className="space-y-6 text-center">
              <h2 className="text-lg font-semibold text-foreground">Current Standings</h2>
              {kids.length < 2 ? (
                <p className="text-muted-foreground py-8">
                  Add at least 2 kids to compete for seats!
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {kids
                      .sort((a, b) => b.total_chore_points - a.total_chore_points)
                      .map((kid, index) => (
                        <div
                          key={kid.id}
                          className={`flex items-center justify-between p-4 rounded-xl ${
                            index === 0 ? 'bg-warning/20 ring-2 ring-warning' : 'bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-2xl font-bold ${index === 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                              #{index + 1}
                            </span>
                            <span className="font-medium text-foreground">{kid.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-warning">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="font-bold">{kid.total_chore_points}</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  <Button variant="hero" size="lg" onClick={handleCompete} className="mt-6">
                    <Trophy className="w-5 h-5 mr-2" />
                    Pick Today's Winner!
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    The person with the most points wins! Ties are broken randomly.
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

export default ChoreMode;