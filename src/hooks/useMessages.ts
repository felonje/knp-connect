import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface ConversationWithDetails {
  id: string;
  is_group: boolean | null;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_message?: {
    content: string;
    created_at: string;
    sender_name: string;
  };
  unread_count: number;
  members: {
    user_id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  }[];
}

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async (): Promise<ConversationWithDetails[]> => {
      const { data: memberships } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user!.id);

      if (!memberships?.length) return [];

      const convIds = memberships.map((m) => m.conversation_id);

      const { data: conversations } = await supabase
        .from("conversations")
        .select("*")
        .in("id", convIds)
        .order("updated_at", { ascending: false });

      if (!conversations?.length) return [];

      const { data: allMembers } = await supabase
        .from("conversation_members")
        .select("conversation_id, user_id")
        .in("conversation_id", convIds);

      const memberUserIds = [...new Set((allMembers || []).map((m) => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .in("user_id", memberUserIds);

      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.user_id, p]));

      const { data: lastMessages } = await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false });

      const lastMessageMap: Record<string, any> = {};
      (lastMessages || []).forEach((m) => {
        if (!lastMessageMap[m.conversation_id]) {
          lastMessageMap[m.conversation_id] = m;
        }
      });

      const { data: unreadMessages } = await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", convIds)
        .neq("sender_id", user!.id)
        .eq("is_read", false);

      const unreadMap: Record<string, number> = {};
      (unreadMessages || []).forEach((m) => {
        unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1;
      });

      return conversations.map((conv) => {
        const members = (allMembers || [])
          .filter((m) => m.conversation_id === conv.id)
          .map((m) => profileMap[m.user_id])
          .filter(Boolean);

        const lastMsg = lastMessageMap[conv.id];
        const senderProfile = lastMsg ? profileMap[lastMsg.sender_id] : null;

        return {
          ...conv,
          members,
          last_message: lastMsg
            ? { content: lastMsg.content, created_at: lastMsg.created_at, sender_name: senderProfile?.full_name || "Unknown" }
            : undefined,
          unread_count: unreadMap[conv.id] || 0,
        };
      });
    },
    enabled: !!user,
  });

  return { conversations: query.data || [], isLoading: query.isLoading, refetch: query.refetch };
};

export const useChatMessages = (conversationId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      const userIds = [...new Set((data || []).map((m) => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.user_id, p]));

      return (data || []).map((m) => ({
        ...m,
        sender: profileMap[m.sender_id] || { username: "unknown", full_name: "Unknown", avatar_url: null },
      }));
    },
    enabled: !!conversationId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user!.id,
        content,
      });
      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return { messages: query.data || [], isLoading: query.isLoading, sendMessage };
};

export const useCreateConversation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetUserId, isGroup, name }: { targetUserId?: string; isGroup?: boolean; name?: string }) => {
      // Check if 1-on-1 conversation already exists
      if (targetUserId && !isGroup) {
        const { data: myConvs } = await supabase
          .from("conversation_members")
          .select("conversation_id")
          .eq("user_id", user!.id);

        if (myConvs?.length) {
          const { data: theirConvs } = await supabase
            .from("conversation_members")
            .select("conversation_id")
            .eq("user_id", targetUserId)
            .in("conversation_id", myConvs.map((c) => c.conversation_id));

          if (theirConvs?.length) {
            for (const conv of theirConvs) {
              const { data: convData } = await supabase
                .from("conversations")
                .select("*")
                .eq("id", conv.conversation_id)
                .eq("is_group", false)
                .maybeSingle();
              if (convData) return convData.id;
            }
          }
        }
      }

      const { data: conv, error } = await supabase
        .from("conversations")
        .insert({ is_group: isGroup || false, name: name || null, created_by: user!.id })
        .select()
        .single();

      if (error) throw error;

      // Add self as member
      await supabase.from("conversation_members").insert({
        conversation_id: conv.id,
        user_id: user!.id,
        is_admin: true,
      });

      // Add other user
      if (targetUserId) {
        await supabase.from("conversation_members").insert({
          conversation_id: conv.id,
          user_id: targetUserId,
        });
      }

      return conv.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });
};
