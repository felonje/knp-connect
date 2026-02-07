import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useStories = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((data || []).map((s) => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.user_id, p]));

      // Group stories by user
      const groupedMap: Record<string, { user: any; stories: any[] }> = {};
      (data || []).forEach((s) => {
        if (!groupedMap[s.user_id]) {
          groupedMap[s.user_id] = {
            user: profileMap[s.user_id] || { username: "unknown", full_name: "Unknown", avatar_url: null },
            stories: [],
          };
        }
        groupedMap[s.user_id].stories.push(s);
      });

      return Object.values(groupedMap);
    },
    enabled: !!user,
  });

  const createStory = useMutation({
    mutationFn: async ({ imageUrl, textContent, bgColor }: { imageUrl?: string; textContent?: string; bgColor?: string }) => {
      const { error } = await supabase.from("stories").insert({
        user_id: user!.id,
        image_url: imageUrl || null,
        text_content: textContent || null,
        background_color: bgColor || "#1a1a2e",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      toast.success("Story posted! ✨");
    },
  });

  return { storyGroups: query.data || [], isLoading: query.isLoading, createStory };
};
