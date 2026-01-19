-- Add family_member_id column to user_question_history table to track per-player question history
ALTER TABLE public.user_question_history
ADD COLUMN family_member_id uuid REFERENCES public.family_members(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX idx_user_question_history_family_member ON public.user_question_history(family_member_id);

-- Add comment explaining the column
COMMENT ON COLUMN public.user_question_history.family_member_id IS 'The family member who answered this question - allows per-player tracking instead of just per-account';