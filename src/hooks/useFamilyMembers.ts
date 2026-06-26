import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FamilyMember {
  id: string;
  name: string;
  is_parent: boolean;
  avatar_color: string;
  avatar_icon: string;
  total_chore_points: number;
  favorite_seat?: string | null;
}

export const useFamilyMembers = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at');

      if (fetchError) throw fetchError;
      setFamilyMembers(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching family members:', err);
      setError('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  const addFamilyMember = async (name: string, isParent: boolean = false) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const colors = ['primary', 'accent', 'success', 'warning'];
      const avatarColor = colors[familyMembers.length % colors.length];

      const { data, error } = await supabase
        .from('family_members')
        .insert({
          user_id: session.user.id,
          name,
          is_parent: isParent,
          avatar_color: avatarColor,
        })
        .select()
        .single();

      if (error) throw error;
      setFamilyMembers(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding family member:', err);
      throw err;
    }
  };

  const updateChorePoints = async (memberId: string, points: number) => {
    try {
      const member = familyMembers.find(m => m.id === memberId);
      if (!member) throw new Error('Member not found');

      const newTotal = member.total_chore_points + points;
      
      const { error } = await supabase
        .from('family_members')
        .update({ total_chore_points: newTotal })
        .eq('id', memberId);

      if (error) throw error;
      
      setFamilyMembers(prev => 
        prev.map(m => m.id === memberId ? { ...m, total_chore_points: newTotal } : m)
      );
    } catch (err) {
      console.error('Error updating chore points:', err);
      throw err;
    }
  };

  const deleteFamilyMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      console.error('Error deleting family member:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  return {
    familyMembers,
    loading,
    error,
    addFamilyMember,
    updateChorePoints,
    deleteFamilyMember,
    refetch: fetchFamilyMembers,
  };
};
