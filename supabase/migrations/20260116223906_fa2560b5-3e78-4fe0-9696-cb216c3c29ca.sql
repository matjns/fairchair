-- Add avatar_icon column to family_members table for icon selection
ALTER TABLE public.family_members 
ADD COLUMN avatar_icon text DEFAULT 'user';

-- Add comment explaining the column
COMMENT ON COLUMN public.family_members.avatar_icon IS 'Icon identifier for the member avatar (e.g., basketball, golf-ball, soccer, etc.)';