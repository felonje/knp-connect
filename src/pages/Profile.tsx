import { Settings, MapPin, Link as LinkIcon, Calendar, Grid3X3, Camera, GraduationCap, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFollowCounts } from "@/hooks/useFollow";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

const Profile = () => {
  const [activeTab] = useState<"posts">("posts");
  const { profile, user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { followers, following } = useFollowCounts(user?.id);

  const { data: userPosts } = useQuery({
    queryKey: ["user-posts", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-14 pb-20 max-w-lg mx-auto">
        {/* Cover photo */}
        <div className="relative h-36 bg-gradient-to-r from-primary/30 to-accent/30 overflow-hidden">
          {profile?.cover_url && (
            <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile info */}
        <div className="px-4 -mt-10 relative">
          <div className="flex items-end justify-between mb-3">
            <div className="w-20 h-20 rounded-full knp-gradient-bg p-[3px]">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden border-2 border-background">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-foreground">{profile?.full_name?.charAt(0) || "U"}</span>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              {isAdmin && (
                <button onClick={() => navigate("/admin")} className="p-2 rounded-xl text-primary hover:bg-secondary transition-colors">
                  <Shield className="w-5 h-5" />
                </button>
              )}
              <button onClick={handleSignOut} className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{profile?.full_name || "User"}</h1>
              {profile?.is_verified && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/15 text-primary">✓</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{profile?.username}</p>
          </div>

          {profile?.bio && (
            <p className="text-sm text-foreground/85 leading-relaxed mb-3">{profile.bio}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 flex-wrap">
            {profile?.department && (
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> {profile.department}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{userPosts?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{followers}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{following}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => navigate("/edit-profile")}
              className="flex-1 py-2.5 rounded-xl knp-gradient-bg text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <div
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary relative"
          >
            <Grid3X3 className="w-4 h-4" />
            Posts
            <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 knp-gradient-bg rounded-full" />
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {(userPosts || []).map((post, i) => (
            <div
              key={post.id}
              className="aspect-square bg-card border border-border/30 flex items-center justify-center relative group cursor-pointer hover:opacity-80 transition-opacity animate-fade-in overflow-hidden"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
            >
              {post.image_url ? (
                <img src={post.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <p className="text-xs text-muted-foreground text-center px-2 line-clamp-3">{post.content}</p>
              )}
            </div>
          ))}
          {(userPosts || []).length === 0 && (
            <div className="col-span-3 text-center text-muted-foreground text-sm py-8">
              No posts yet
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Profile;
