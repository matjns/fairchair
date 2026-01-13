import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FamilyMember } from './useFamilyMembers';

export interface SeatingRecord {
  id: string;
  family_member_id: string;
  seat_position: string;
  row_position: string;
  mode: 'chore' | 'quiz' | 'random';
  created_at: string;
}

export const useSeatingHistory = () => {
  const [history, setHistory] = useState<SeatingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('seating_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setHistory((data || []) as SeatingRecord[]);
    } catch (err) {
      console.error('Error fetching seating history:', err);
    } finally {
      setLoading(false);
    }
  };

  const recordSeating = async (
    familyMemberId: string, 
    seatPosition: string, 
    rowPosition: string, 
    mode: 'chore' | 'quiz' | 'random'
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('seating_history')
        .insert({
          user_id: session.user.id,
          family_member_id: familyMemberId,
          seat_position: seatPosition,
          row_position: rowPosition,
          mode,
        })
        .select()
        .single();

      if (error) throw error;
      setHistory(prev => [data as SeatingRecord, ...prev]);
      return data;
    } catch (err) {
      console.error('Error recording seating:', err);
      throw err;
    }
  };

  // Calculate weighted random selection based on who got the seat least recently
  const selectWeightedRandom = (members: FamilyMember[], targetSeat: string) => {
    if (members.length === 0) return null;
    if (members.length === 1) return members[0];

    // Get last time each member got this seat
    const memberScores = members.map(member => {
      const lastGotSeat = history.find(
        h => h.family_member_id === member.id && h.seat_position === targetSeat
      );
      
      // Higher score = less recently got this seat = higher chance
      const daysSinceLastSeat = lastGotSeat 
        ? (Date.now() - new Date(lastGotSeat.created_at).getTime()) / (1000 * 60 * 60 * 24)
        : 365; // Never had this seat = very high score
      
      return {
        member,
        score: daysSinceLastSeat + Math.random() * 2, // Add some randomness
      };
    });

    // Sort by score and pick the highest
    memberScores.sort((a, b) => b.score - a.score);
    return memberScores[0].member;
  };

  // Get seat counts per member for a specific seat
  const getSeatCountsForMember = (memberId: string) => {
    return history.filter(h => h.family_member_id === memberId).length;
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return {
    history,
    loading,
    recordSeating,
    selectWeightedRandom,
    getSeatCountsForMember,
    refetch: fetchHistory,
  };
};
