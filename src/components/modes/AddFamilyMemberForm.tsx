import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus } from 'lucide-react';

interface AddFamilyMemberFormProps {
  onAdd: (name: string, isParent: boolean) => Promise<unknown>;
}

export const AddFamilyMemberForm: React.FC<AddFamilyMemberFormProps> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [isParent, setIsParent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onAdd(name.trim(), isParent);
      setName('');
      setIsParent(false);
    } catch (err) {
      console.error('Failed to add family member:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted/50 rounded-xl">
      <div className="space-y-2">
        <Label htmlFor="memberName">Name</Label>
        <Input
          id="memberName"
          placeholder="Enter name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="isParent"
          checked={isParent}
          onCheckedChange={(checked) => setIsParent(checked === true)}
          disabled={loading}
        />
        <Label htmlFor="isParent" className="text-sm cursor-pointer">
          This is a parent (won't compete for seats)
        </Label>
      </div>
      <Button type="submit" disabled={!name.trim() || loading} className="w-full">
        <UserPlus className="w-4 h-4 mr-2" />
        {loading ? 'Adding...' : 'Add Family Member'}
      </Button>
    </form>
  );
};
