
-- Fix permissive notification INSERT policy
DROP POLICY "System can create notifications" ON public.notifications;
CREATE POLICY "Users can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
