import React from 'react';
import { Trophy, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FamilyMember } from '@/hooks/useFamilyMembers';

interface SeatWinnerDisplayProps {
  winner: FamilyMember;
  seatDescription: string;
  onDone: () => void;
  mode: 'chore' | 'quiz' | 'random';
}

export const SeatWinnerDisplay: React.FC<SeatWinnerDisplayProps> = ({
  winner,
  seatDescription,
  onDone,
  mode,
}) => {
  const modeLabels = {
    chore: 'Chore Points Winner!',
    quiz: 'Quiz Champion!',
    random: 'Lucky Winner!',
  };

  return (
    <div className="text-center space-y-6 py-8">
      <div className="relative inline-block">
        <div className="w-24 h-24 rounded-full bg-warning/20 flex items-center justify-center mx-auto">
          <Trophy className="w-12 h-12 text-warning" />
        </div>
        <PartyPopper className="absolute -top-2 -right-2 w-8 h-8 text-primary animate-bounce" />
      </div>

      <div>
        <p className="text-muted-foreground mb-2">{modeLabels[mode]}</p>
        <h2 className="text-3xl font-bold text-foreground">{winner.name}</h2>
      </div>

      <div className="p-4 bg-primary/10 rounded-xl inline-block">
        <p className="text-sm text-muted-foreground">Gets the</p>
        <p className="text-lg font-semibold text-primary">{seatDescription}</p>
      </div>

      <Button variant="hero" size="lg" onClick={onDone} className="mt-4">
        <PartyPopper className="w-5 h-5 mr-2" />
        Awesome!
      </Button>
    </div>
  );
};
