import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const senderIds = [...new Set((data || []).map((n) => n.sender_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .in("user_id", senderIds as string[]);

      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.user_id, p]));

      return (data || []).map((n) => ({
        ...n,
        sender: n.sender_id ? profileMap[n.sender_id] : null,
      }));
    },
    enabled: !!user,
  });

  const unreadCount = (query.data || []).filter((n) => !n.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async (notifId?: string) => {
      if (notifId) {
        await supabase.from("notifications").update({ is_read: true }).eq("id", notifId);
      } else {
        await supabase.from("notifications").update({ is_read: true }).eq("recipient_id", user!.id).eq("is_read", false);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Real-time
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  return { notifications: query.data || [], unreadCount, isLoading: query.isLoading, markAsRead };
};
