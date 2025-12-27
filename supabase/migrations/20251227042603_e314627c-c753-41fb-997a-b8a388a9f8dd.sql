-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert error logs" ON public.error_logs;

-- Create a more restrictive INSERT policy
-- Users can only insert error logs for themselves or with NULL user_id
CREATE POLICY "Users can insert own error logs"
ON public.error_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);