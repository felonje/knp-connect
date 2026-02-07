import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PostWithAuthor {
  id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  post_type: string | null;
  is_pinned: boolean | null;
  created_at: string;
  user_id: string;
  author: {
    username: string;
    full_name: string;
    avatar_url: string | null;
    is_verified: boolean | null;
  };
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
  user_reaction: string | null;
}

export const usePosts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const postsQuery = useQuery({
    queryKey: ["posts"],
    queryFn: async (): Promise<PostWithAuthor[]> => {
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .order("is_pinned", { ascending: false })
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

  const createPost = useMutation({
    mutationFn: async ({ content, imageUrl, postType }: { content: string; imageUrl?: string; postType?: string }) => {
      const { error } = await supabase.from("posts").insert({
        user_id: user!.id,
        content,
        image_url: imageUrl || null,
        post_type: postType || "text",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post created! 🎉");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleLike = useMutation({
    mutationFn: async ({ postId, reaction = "like" }: { postId: string; reaction?: string }) => {
      const { data: existing } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (existing) {
        await supabase.from("likes").delete().eq("id", existing.id);
      } else {
        await supabase.from("likes").insert({ post_id: postId, user_id: user!.id, reaction });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted");
    },
  });

  return { posts: postsQuery.data || [], isLoading: postsQuery.isLoading, createPost, toggleLike, deletePost, refetch: postsQuery.refetch };
};

export const useComments = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const userIds = [...new Set((data || []).map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.user_id, p]));

      return (data || []).map((c) => ({
        ...c,
        author: profileMap[c.user_id] || { username: "unknown", full_name: "Unknown", avatar_url: null },
      }));
    },
    enabled: !!postId,
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user!.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { comments: commentsQuery.data || [], isLoading: commentsQuery.isLoading, addComment };
};
