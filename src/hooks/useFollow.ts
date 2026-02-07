import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useFollow = (targetUserId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isFollowingQuery = useQuery({
    queryKey: ["follow", user?.id, targetUserId],
    queryFn: async () => {
      if (!targetUserId) return false;
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user!.id)
        .eq("following_id", targetUserId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      if (!targetUserId) return;
      const { data: existing } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user!.id)
        .eq("following_id", targetUserId)
        .maybeSingle();

      if (existing) {
        await supabase.from("follows").delete().eq("id", existing.id);
      } else {
        await supabase.from("follows").insert({
          follower_id: user!.id,
          following_id: targetUserId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { isFollowing: isFollowingQuery.data ?? false, toggleFollow, isLoading: isFollowingQuery.isLoading };
};

export const useFollowCounts = (userId?: string) => {
  const followersQuery = useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", userId!);
      return count || 0;
    },
    enabled: !!userId,
  });

  const followingQuery = useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", userId!);
      return count || 0;
    },
    enabled: !!userId,
  });

  return {
    followers: followersQuery.data ?? 0,
    following: followingQuery.data ?? 0,
  };
};

export const useSuggestedUsers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["suggested-users", user?.id],
    queryFn: async () => {
      const { data: followingIds } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user!.id);

      const excludeIds = [user!.id, ...(followingIds || []).map((f) => f.following_id)];

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .not("user_id", "in", `(${excludeIds.join(",")})`)
        .limit(10);

      return data || [];
    },
    enabled: !!user,
  });
};
