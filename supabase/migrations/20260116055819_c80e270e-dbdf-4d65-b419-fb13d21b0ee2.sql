-- Create table to track which questions each user has seen
CREATE TABLE public.user_question_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Enable RLS
ALTER TABLE public.user_question_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their question history"
ON public.user_question_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their question history"
ON public.user_question_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);