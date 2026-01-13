import React from 'react';
import { User, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FamilyMember } from '@/hooks/useFamilyMembers';

interface FamilyMemberCardProps {
  member: FamilyMember;
  onDelete?: () => void;
  onClick?: () => void;
  selected?: boolean;
  showPoints?: boolean;
}

export const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  onDelete,
  onClick,
  selected,
  showPoints = true,
}) => {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  const avatarColor = colorMap[member.avatar_color] || colorMap.primary;

  return (
    <div
      onClick={onClick}
      className={`card-interactive p-4 flex items-center gap-4 ${onClick ? 'cursor-pointer' : ''} ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${avatarColor}`}>
        <User className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{member.name}</h3>
        {member.is_parent && (
          <span className="text-xs text-muted-foreground">Parent</span>
        )}
        {showPoints && !member.is_parent && (
          <div className="flex items-center gap-1 text-sm text-warning">
            <Star className="w-4 h-4 fill-current" />
            <span>{member.total_chore_points} points</span>
          </div>
        )}
      </div>
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
