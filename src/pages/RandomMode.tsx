import React, { useState, useEffect, useRef } from 'react';
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

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--warning))',
  'hsl(var(--success))',
  'hsl(210, 70%, 55%)',
  'hsl(280, 70%, 55%)',
  'hsl(30, 70%, 55%)',
  'hsl(180, 70%, 55%)',
];

const RandomMode: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'family' | 'history' | 'pick'>('family');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<FamilyMember | null>(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || kids.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw segments
    const segmentAngle = (2 * Math.PI) / kids.length;
    
    kids.forEach((kid, index) => {
      const startAngle = index * segmentAngle + (rotation * Math.PI / 180);
      const endAngle = startAngle + segmentAngle;
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 2;
      ctx.fillText(kid.name, radius - 20, 5);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 3;
    ctx.stroke();

  }, [kids, rotation]);

  const spinWheel = () => {
    if (kids.length < 2 || isSpinning) return;
    
    setIsSpinning(true);
    setWinner(null);
    
    // Select weighted random winner first
    const selectedWinner = selectWeightedRandom(kids, 'best-seat');
    if (!selectedWinner) {
      setIsSpinning(false);
      return;
    }
    
    // Calculate winning segment index
    const winnerIndex = kids.findIndex(k => k.id === selectedWinner.id);
    const segmentAngle = 360 / kids.length;
    
    // The wheel rotates, and the pointer is at the TOP (270 degrees in standard math coordinates)
    // When rotation is 0, segment 0 starts at 0 degrees (right side)
    // We need to rotate so that the winner's segment center aligns with the TOP (270 degrees)
    // 
    // Winner segment center at rotation 0: winnerIndex * segmentAngle + segmentAngle/2
    // We need this to align with 270 degrees (top), so we add rotation to move it there
    // targetRotation = 270 - (winnerIndex * segmentAngle + segmentAngle/2)
    // But since canvas draws with rotation added, we need to normalize
    
    const winnerCenterAngle = winnerIndex * segmentAngle + segmentAngle / 2;
    // To align winner center with top (270°), we need total rotation where:
    // (winnerCenterAngle + totalRotation) mod 360 = 270
    // So: totalRotation = 270 - winnerCenterAngle
    const baseTargetRotation = 270 - winnerCenterAngle;
    
    // Add extra rotations for dramatic effect (always positive, spinning clockwise)
    const extraRotations = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + (extraRotations * 360) + baseTargetRotation - rotation + (Math.random() * 10 - 5);
    
    // Animate the spin
    const duration = 4000;
    const startTime = Date.now();
    const startRotation = rotation;
    const totalRotation = finalRotation - startRotation;
    
    // Store winner to set after animation completes
    const winnerToSet = selectedWinner;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentRotation = startRotation + totalRotation * easeOut;
      setRotation(currentRotation);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete - set the winner that was pre-selected
        setWinner(winnerToSet);
        setIsSpinning(false);
        recordSeating(winnerToSet.id, 'best-seat', 'preferred', 'random');
      }
    };
    
    requestAnimationFrame(animate);
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
                  {/* Spinning Wheel */}
                  <div className="relative inline-block">
                    {/* Pointer/Arrow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                      <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
                    </div>
                    
                    {/* Wheel Canvas */}
                    <canvas
                      ref={canvasRef}
                      width={280}
                      height={280}
                      className="rounded-full shadow-2xl"
                    />
                    
                    {/* Outer ring decoration */}
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 pointer-events-none" />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Eligible kids:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {kids.map((kid, index) => (
                        <span
                          key={kid.id}
                          className="px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
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