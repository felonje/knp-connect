import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EditProfile = () => {
  const navigate = useNavigate();
  const { profile, user, refreshProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    username: profile?.username || "",
    bio: profile?.bio || "",
    department: profile?.department || "",
    course: profile?.course || "",
    year_of_study: profile?.year_of_study?.toString() || "",
    phone: profile?.phone || "",
    website: profile?.website || "",
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop();
    const path = `${user!.id}/avatar.${ext}`;

    const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed"); return; }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("user_id", user!.id);
    await refreshProfile();
    toast.success("Avatar updated!");
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          username: form.username,
          bio: form.bio,
          department: form.department,
          course: form.course,
          year_of_study: form.year_of_study ? parseInt(form.year_of_study) : null,
          phone: form.phone,
          website: form.website,
        })
        .eq("user_id", user!.id);

      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated! ✨");
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border safe-top">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-foreground">Edit Profile</h1>
          <button onClick={handleSave} disabled={loading} className="px-4 py-1.5 rounded-full knp-gradient-bg text-primary-foreground text-sm font-semibold disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </button>
        </div>
      </header>

      <main className="pt-14 pb-6 max-w-lg mx-auto px-4">
        {/* Avatar */}
        <div className="flex justify-center py-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full knp-gradient-bg p-[3px]">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-foreground">{profile?.full_name?.charAt(0) || "U"}</span>
                )}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 p-2 rounded-full knp-gradient-bg text-primary-foreground">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {[
            { label: "Full Name", key: "full_name", type: "text" },
            { label: "Username", key: "username", type: "text" },
            { label: "Bio", key: "bio", type: "textarea" },
            { label: "Department", key: "department", type: "text" },
            { label: "Course", key: "course", type: "text" },
            { label: "Year of Study", key: "year_of_study", type: "number" },
            { label: "Phone", key: "phone", type: "tel" },
            { label: "Website", key: "website", type: "url" },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  className="w-full h-20 px-3 py-2 rounded-xl bg-card border border-border text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              ) : (
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  className="w-full h-11 px-3 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
