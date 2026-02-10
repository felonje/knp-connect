-- Allow conversation members to mark messages as read
CREATE POLICY "Members can update message read status"
ON public.messages
FOR UPDATE
USING (is_conversation_member(auth.uid(), conversation_id))
WITH CHECK (is_conversation_member(auth.uid(), conversation_id));