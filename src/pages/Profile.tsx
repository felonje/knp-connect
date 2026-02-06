import { Settings, MapPin, Link as LinkIcon, Calendar, Grid3X3, Bookmark } from "lucide-react";
import { useState } from "react";
import knpLogo from "@/assets/knp-logo.png";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

const Profile = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-14 pb-20 max-w-lg mx-auto">
        {/* Profile header */}
        <div className="px-4 pt-4">
          <div className="flex items-start justify-between mb-4">
            <div className="w-20 h-20 rounded-full knp-gradient-bg p-[3px]">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                <img src={knpLogo} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
            <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <h1 className="text-xl font-bold text-foreground">KNP Connect</h1>
            <p className="text-sm text-muted-foreground">@knpconnect</p>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            Building the future of social networking. Connect, collaborate, and grow with amazing people around the world. 🌍✨
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Global
            </span>
            <span className="flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5" /> knpconnect.com
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Joined Feb 2026
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">248</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">12.4K</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">892</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>

          {/* Edit profile button */}
          <button className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors mb-4">
            Edit Profile
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "posts" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            Posts
            {activeTab === "posts" && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 knp-gradient-bg rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "saved" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saved
            {activeTab === "saved" && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 knp-gradient-bg rounded-full" />
            )}
          </button>
        </div>

        {/* Grid content */}
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-secondary/80 flex items-center justify-center animate-fade-in"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
            >
              <span className="text-2xl text-muted-foreground/30">
                {["🚀", "💡", "🤝", "🌍", "📱", "⚡", "🎯", "💬", "✨"][i]}
              </span>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Profile;
