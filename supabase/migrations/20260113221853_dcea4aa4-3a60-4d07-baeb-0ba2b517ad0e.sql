-- Create family_members table
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_parent BOOLEAN NOT NULL DEFAULT false,
  avatar_color TEXT DEFAULT 'primary',
  total_chore_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Policies for family_members
CREATE POLICY "Users can view their family members" ON public.family_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert family members" ON public.family_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update family members" ON public.family_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete family members" ON public.family_members FOR DELETE USING (auth.uid() = user_id);

-- Create chores table
CREATE TABLE public.chores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;

-- Policies for chores
CREATE POLICY "Users can view their chores" ON public.chores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert chores" ON public.chores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update chores" ON public.chores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete chores" ON public.chores FOR DELETE USING (auth.uid() = user_id);

-- Create chore_submissions table (kids submit, parents approve)
CREATE TABLE public.chore_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chore_id UUID NOT NULL REFERENCES public.chores(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.chore_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for chore_submissions
CREATE POLICY "Users can view their submissions" ON public.chore_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert submissions" ON public.chore_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update submissions" ON public.chore_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete submissions" ON public.chore_submissions FOR DELETE USING (auth.uid() = user_id);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public read for quiz questions)
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions FOR SELECT USING (true);

-- Create seating_history table for fair rotation tracking
CREATE TABLE public.seating_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  seat_position TEXT NOT NULL,
  row_position TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('chore', 'quiz', 'random')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seating_history ENABLE ROW LEVEL SECURITY;

-- Policies for seating_history
CREATE POLICY "Users can view their seating history" ON public.seating_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert seating history" ON public.seating_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default quiz questions
INSERT INTO public.quiz_questions (topic, question, correct_answer, wrong_answers, difficulty) VALUES
('Science', 'What planet is known as the Red Planet?', 'Mars', ARRAY['Venus', 'Jupiter', 'Saturn'], 'easy'),
('Science', 'What gas do plants absorb from the air?', 'Carbon Dioxide', ARRAY['Oxygen', 'Nitrogen', 'Hydrogen'], 'easy'),
('Science', 'What is the largest organ in the human body?', 'Skin', ARRAY['Heart', 'Liver', 'Brain'], 'medium'),
('Math', 'What is 7 x 8?', '56', ARRAY['54', '58', '64'], 'easy'),
('Math', 'What is the square root of 144?', '12', ARRAY['11', '13', '14'], 'medium'),
('Math', 'What is 15% of 200?', '30', ARRAY['25', '35', '20'], 'medium'),
('Geography', 'What is the capital of France?', 'Paris', ARRAY['London', 'Berlin', 'Madrid'], 'easy'),
('Geography', 'What is the largest ocean on Earth?', 'Pacific Ocean', ARRAY['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'], 'easy'),
('Geography', 'Which country has the most people?', 'India', ARRAY['China', 'United States', 'Indonesia'], 'medium'),
('History', 'Who was the first president of the United States?', 'George Washington', ARRAY['Abraham Lincoln', 'Thomas Jefferson', 'John Adams'], 'easy'),
('History', 'In what year did World War II end?', '1945', ARRAY['1944', '1946', '1943'], 'medium'),
('Animals', 'What is the fastest land animal?', 'Cheetah', ARRAY['Lion', 'Horse', 'Gazelle'], 'easy'),
('Animals', 'How many legs does a spider have?', '8', ARRAY['6', '10', '4'], 'easy'),
('Animals', 'What is a group of wolves called?', 'Pack', ARRAY['Herd', 'Flock', 'School'], 'medium'),
('Sports', 'How many players are on a basketball team on the court?', '5', ARRAY['4', '6', '7'], 'easy'),
('Sports', 'What sport is played at Wimbledon?', 'Tennis', ARRAY['Golf', 'Cricket', 'Soccer'], 'easy');