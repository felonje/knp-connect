import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, FileText, Flag, Shield, Trash2, Ban, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type AdminTab = "users" | "posts" | "reports";

const Admin = () => {
  const [tab, setTab] = useState<AdminTab>("users");
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: roles } = await supabase.from("user_roles").select("*");
      const roleMap: Record<string, string[]> = {};
      (roles || []).forEach((r) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });
      return (profiles || []).map((p) => ({ ...p, roles: roleMap[p.user_id] || ["user"] }));
    },
    enabled: isAdmin,
  });

  // Fetch all posts
  const { data: posts } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(100);
      const userIds = [...new Set((data || []).map((p) => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, full_name").in("user_id", userIds);
      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.user_id, p]));
      return (data || []).map((p) => ({ ...p, author: profileMap[p.user_id] }));
    },
    enabled: isAdmin,
  });

  // Fetch reports
  const { data: reports } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
      const reporterIds = [...new Set((data || []).map((r) => r.reporter_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, full_name").in("user_id", reporterIds);
      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.user_id, p]));
      return (data || []).map((r) => ({ ...r, reporter: profileMap[r.reporter_id] }));
    },
    enabled: isAdmin,
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      await supabase.from("posts").delete().eq("id", postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Post deleted");
    },
  });

  const updateReport = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await supabase.from("reports").update({ status, resolved_at: new Date().toISOString() }).eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast.success("Report updated");
    },
  });

  const toggleRole = useMutation({
    mutationFn: async ({ userId, role, action }: { userId: string; role: "admin" | "moderator"; action: "add" | "remove" }) => {
      if (action === "add") {
        await supabase.from("user_roles").insert({ user_id: userId, role });
      } else {
        await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const tabs = [
    { key: "users" as const, label: "Users", icon: Users, count: users?.length },
    { key: "posts" as const, label: "Posts", icon: FileText, count: posts?.length },
    { key: "reports" as const, label: "Reports", icon: Flag, count: reports?.filter((r) => r.status === "pending").length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border safe-top">
        <div className="flex items-center gap-3 h-14 px-4 max-w-2xl mx-auto">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-base font-bold text-foreground">Admin Dashboard</h1>
        </div>
      </header>

      <main className="pt-14 pb-6 max-w-2xl mx-auto">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${
                tab === t.key ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.count !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full bg-secondary text-[10px] font-bold">{t.count}</span>
              )}
              {tab === t.key && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 knp-gradient-bg rounded-full" />}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === "users" && (
          <div className="px-4 py-4 flex flex-col gap-2">
            {(users || []).map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full knp-gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                  {u.full_name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{u.full_name}</p>
                  <p className="text-xs text-muted-foreground">@{u.username} · {u.roles.join(", ")}</p>
                </div>
                <div className="flex gap-1">
                  {u.roles.includes("moderator") ? (
                    <button onClick={() => toggleRole.mutate({ userId: u.user_id, role: "moderator", action: "remove" })} className="px-2 py-1 rounded-lg bg-accent/20 text-accent text-[10px] font-bold">
                      - Mod
                    </button>
                  ) : (
                    <button onClick={() => toggleRole.mutate({ userId: u.user_id, role: "moderator", action: "add" })} className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-[10px] font-bold">
                      + Mod
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Posts Tab */}
        {tab === "posts" && (
          <div className="px-4 py-4 flex flex-col gap-2">
            {(posts || []).map((p) => (
              <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">@{p.author?.username || "unknown"}</p>
                  <p className="text-sm text-foreground line-clamp-2">{p.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => deletePost.mutate(p.id)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Reports Tab */}
        {tab === "reports" && (
          <div className="px-4 py-4 flex flex-col gap-2">
            {(reports || []).length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No reports 🎉</p>
            ) : (
              (reports || []).map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === "pending" ? "bg-accent/20 text-accent" : r.status === "resolved" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}>{r.status}</span>
                    <span className="text-xs text-muted-foreground">{r.reported_entity_type}</span>
                  </div>
                  <p className="text-sm text-foreground mb-1">{r.reason}</p>
                  <p className="text-xs text-muted-foreground">by @{r.reporter?.username || "unknown"} · {new Date(r.created_at).toLocaleDateString()}</p>
                  {r.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => updateReport.mutate({ id: r.id, status: "resolved" })} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/20 text-primary text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" /> Resolve
                      </button>
                      <button onClick={() => updateReport.mutate({ id: r.id, status: "dismissed" })} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-semibold">
                        <XCircle className="w-3 h-3" /> Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
