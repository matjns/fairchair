GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_question_history TO authenticated;
GRANT ALL ON public.user_question_history TO service_role;

DROP POLICY IF EXISTS "Users can view their question history" ON public.user_question_history;
DROP POLICY IF EXISTS "Users can insert their question history" ON public.user_question_history;

CREATE POLICY "Users can view their own question history"
ON public.user_question_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can save their own question history"
ON public.user_question_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own question history"
ON public.user_question_history
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);