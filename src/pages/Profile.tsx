import { Settings, MapPin, Link as LinkIcon, Calendar, Grid3X3, Bookmark, Camera, GraduationCap } from "lucide-react";
import { useState } from "react";
import knpLogo from "@/assets/knp-logo.png";
import campusHero from "@/assets/campus-hero.jpg";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

const Profile = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  const postGrid = [
    { emoji: "🚀", caption: "Tech week prep" },
    { emoji: "📚", caption: "Study session" },
    { emoji: "🤝", caption: "Group project" },
    { emoji: "⚽", caption: "Tournament" },
    { emoji: "💻", caption: "Coding bootcamp" },
    { emoji: "🎓", caption: "Graduation prep" },
    { emoji: "🎯", caption: "Career fair" },
    { emoji: "🎉", caption: "Campus event" },
    { emoji: "✨", caption: "Lab work" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-14 pb-20 max-w-lg mx-auto">
        {/* Cover photo */}
        <div className="relative h-36 bg-muted overflow-hidden">
          <img src={campusHero} alt="Campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <button className="absolute bottom-2 right-2 p-2 rounded-full bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Profile info */}
        <div className="px-4 -mt-10 relative">
          <div className="flex items-end justify-between mb-3">
            <div className="w-20 h-20 rounded-full knp-gradient-bg p-[3px]">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden border-2 border-background">
                <img src={knpLogo} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
            <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">KNP Connect</h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/15 text-primary">
                Official
              </span>
            </div>
            <p className="text-sm text-muted-foreground">@knpconnect</p>
          </div>

          <p className="text-sm text-foreground/85 leading-relaxed mb-3">
            The official social platform for Kisii National Polytechnic 🎓 Connect with fellow students, join groups, share campus moments, and stay updated! 🇰🇪
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 flex-wrap">
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Kisii, Kenya
            </span>
            <span className="flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5" /> knpconnect.co.ke
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Joined Feb 2026
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4">
            <button className="text-center">
              <p className="text-lg font-bold text-foreground">248</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </button>
            <button className="text-center">
              <p className="text-lg font-bold text-foreground">1.2K</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </button>
            <button className="text-center">
              <p className="text-lg font-bold text-foreground">892</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-4">
            <button className="flex-1 py-2.5 rounded-xl knp-gradient-bg text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Edit Profile
            </button>
            <button className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
              Share Profile
            </button>
          </div>
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
          {postGrid.map((item, i) => (
            <div
              key={i}
              className="aspect-square bg-card border border-border/30 flex items-center justify-center relative group cursor-pointer hover:opacity-80 transition-opacity animate-fade-in"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
            >
              <span className="text-3xl">{item.emoji}</span>
              <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-xs font-medium text-foreground">{item.caption}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Profile;
