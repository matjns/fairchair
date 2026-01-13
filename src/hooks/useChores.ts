import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Chore {
  id: string;
  name: string;
  points: number;
}

export interface ChoreSubmission {
  id: string;
  chore_id: string;
  family_member_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
}

export const useChores = () => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [submissions, setSubmissions] = useState<ChoreSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChores = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const [choresResult, submissionsResult] = await Promise.all([
        supabase.from('chores').select('*').eq('user_id', session.user.id),
        supabase.from('chore_submissions').select('*').eq('user_id', session.user.id).order('submitted_at', { ascending: false }),
      ]);

      if (choresResult.error) throw choresResult.error;
      if (submissionsResult.error) throw submissionsResult.error;

      setChores(choresResult.data || []);
      setSubmissions((submissionsResult.data || []) as ChoreSubmission[]);
    } catch (err) {
      console.error('Error fetching chores:', err);
    } finally {
      setLoading(false);
    }
  };

  const addChore = async (name: string, points: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('chores')
        .insert({ user_id: session.user.id, name, points })
        .select()
        .single();

      if (error) throw error;
      setChores(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding chore:', err);
      throw err;
    }
  };

  const deleteChore = async (choreId: string) => {
    try {
      const { error } = await supabase.from('chores').delete().eq('id', choreId);
      if (error) throw error;
      setChores(prev => prev.filter(c => c.id !== choreId));
    } catch (err) {
      console.error('Error deleting chore:', err);
      throw err;
    }
  };

  const submitChore = async (choreId: string, familyMemberId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('chore_submissions')
        .insert({
          user_id: session.user.id,
          chore_id: choreId,
          family_member_id: familyMemberId,
        })
        .select()
        .single();

      if (error) throw error;
      setSubmissions(prev => [data as ChoreSubmission, ...prev]);
      return data;
    } catch (err) {
      console.error('Error submitting chore:', err);
      throw err;
    }
  };

  const reviewSubmission = async (submissionId: string, approved: boolean, memberId: string, chorePoints: number) => {
    try {
      const status = approved ? 'approved' : 'rejected';
      
      const { error } = await supabase
        .from('chore_submissions')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', submissionId);

      if (error) throw error;

      // If approved, update the member's points
      if (approved) {
        const { data: member, error: memberError } = await supabase
          .from('family_members')
          .select('total_chore_points')
          .eq('id', memberId)
          .single();

        if (memberError) throw memberError;

        const newPoints = (member?.total_chore_points || 0) + chorePoints;
        
        const { error: updateError } = await supabase
          .from('family_members')
          .update({ total_chore_points: newPoints })
          .eq('id', memberId);

        if (updateError) throw updateError;
      }

      setSubmissions(prev =>
        prev.map(s => s.id === submissionId ? { ...s, status, reviewed_at: new Date().toISOString() } : s)
      );
    } catch (err) {
      console.error('Error reviewing submission:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchChores();
  }, []);

  return {
    chores,
    submissions,
    loading,
    addChore,
    deleteChore,
    submitChore,
    reviewSubmission,
    refetch: fetchChores,
    pendingSubmissions: submissions.filter(s => s.status === 'pending'),
  };
};
