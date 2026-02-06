import { Search, TrendingUp, Users, Hash } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

const trendingTopics = [
  { tag: "TechInnovation", posts: "2.4K posts", icon: TrendingUp },
  { tag: "Networking2026", posts: "1.8K posts", icon: Hash },
  { tag: "RemoteWork", posts: "956 posts", icon: Hash },
  { tag: "AIFuture", posts: "3.1K posts", icon: TrendingUp },
];

const suggestedPeople = [
  { name: "Sarah Kim", username: "@sarahk", bio: "UX Designer · Building the future" },
  { name: "Marcus Johnson", username: "@marcusj", bio: "Startup Founder · Angel Investor" },
  { name: "Elena Rodriguez", username: "@elenarodz", bio: "Full-Stack Dev · Open Source" },
  { name: "Raj Patel", username: "@rajp", bio: "Product Manager · Ex-Google" },
];

const Discover = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-14 pb-20 max-w-lg mx-auto">
        {/* Search bar */}
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search people, topics..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Trending Topics */}
        <section className="px-4 mb-6">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Trending Now
          </h2>
          <div className="flex flex-col gap-2">
            {trendingTopics.map((topic, i) => (
              <button
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <topic.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-foreground">#{topic.tag}</p>
                  <p className="text-xs text-muted-foreground">{topic.posts}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Suggested People */}
        <section className="px-4">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            People to Connect
          </h2>
          <div className="flex flex-col gap-2">
            {suggestedPeople.map((person, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border animate-slide-up"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
              >
                <div className="w-11 h-11 rounded-full knp-gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                  {person.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{person.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{person.bio}</p>
                </div>
                <button className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shrink-0">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default Discover;
