import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { PostWithAuthor } from "@/hooks/usePosts";

export const useReels = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const reelsQuery = useQuery({
    queryKey: ["reels"],
    queryFn: async (): Promise<PostWithAuthor[]> => {
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .eq("post_type", "reel")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!posts?.length) return [];

      const userIds = [...new Set(posts.map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, is_verified")
        .in("user_id", userIds);

      const postIds = posts.map((p) => p.id);
      const { data: likes } = await supabase
        .from("likes")
        .select("post_id, user_id, reaction")
        .in("post_id", postIds);

      const { data: comments } = await supabase
        .from("comments")
        .select("post_id")
        .in("post_id", postIds);

      const profileMap = Object.fromEntries(
        (profiles || []).map((p) => [p.user_id, p])
      );

      return posts.map((post) => {
        const postLikes = (likes || []).filter((l) => l.post_id === post.id);
        const userLike = postLikes.find((l) => l.user_id === user?.id);
        const postComments = (comments || []).filter((c) => c.post_id === post.id);
        const author = profileMap[post.user_id];

        return {
          ...post,
          author: author || { username: "unknown", full_name: "Unknown", avatar_url: null, is_verified: false },
          likes_count: postLikes.length,
          comments_count: postComments.length,
          user_has_liked: !!userLike,
          user_reaction: userLike?.reaction || null,
        };
      });
    },
    enabled: !!user,
  });

  const toggleLike = useMutation({
    mutationFn: async ({ postId }: { postId: string }) => {
      const { data: existing } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (existing) {
        await supabase.from("likes").delete().eq("id", existing.id);
      } else {
        await supabase.from("likes").insert({ post_id: postId, user_id: user!.id, reaction: "like" });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reels"] }),
  });

  return { reels: reelsQuery.data || [], isLoading: reelsQuery.isLoading, toggleLike };
};