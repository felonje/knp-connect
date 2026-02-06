import { Search, TrendingUp, Users, Hash, Calendar, GraduationCap, Trophy, Briefcase } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import CampusEvents from "@/components/CampusEvents";

const trendingTopics = [
  { tag: "KNPRegistration", posts: "2.4K posts", icon: TrendingUp },
  { tag: "TechWeek2026", posts: "1.8K posts", icon: Hash },
  { tag: "KNPFootball", posts: "956 posts", icon: Trophy },
  { tag: "CodingBootcamp", posts: "743 posts", icon: Hash },
];

const departments = [
  { name: "ICT & Computing", members: 456, emoji: "💻" },
  { name: "Engineering", members: 389, emoji: "⚙️" },
  { name: "Business Studies", members: 312, emoji: "📊" },
  { name: "Applied Sciences", members: 278, emoji: "🔬" },
  { name: "Hospitality", members: 198, emoji: "🏨" },
  { name: "Social Work", members: 167, emoji: "🤝" },
];

const suggestedPeople = [
  { name: "Kevin Nyakundi", username: "@kevinn", bio: "Engineering · Class of 2027" },
  { name: "Mercy Kemunto", username: "@mercyk", bio: "ICT Student · Web Developer" },
  { name: "Dennis Otieno", username: "@denniso", bio: "Business Studies · Entrepreneur" },
  { name: "Faith Nyaboke", username: "@faithn", bio: "Applied Sciences · Lab Tech" },
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
              placeholder="Search students, groups, events..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Quick filters */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-none">
          {[
            { label: "All", active: true },
            { label: "Students", icon: GraduationCap },
            { label: "Groups", icon: Users },
            { label: "Events", icon: Calendar },
            { label: "Jobs", icon: Briefcase },
          ].map((filter, i) => (
            <button
              key={i}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filter.active
                  ? "knp-gradient-bg text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.icon && <filter.icon className="w-3.5 h-3.5" />}
              {filter.label}
            </button>
          ))}
        </div>

        {/* Trending Topics */}
        <section className="px-4 mb-6">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Trending at KNP
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

        {/* Campus Events */}
        <CampusEvents />

        {/* Departments */}
        <section className="px-4 mb-6">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-knp-green" />
            Departments
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {departments.map((dept, i) => (
              <button
                key={i}
                className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/20 transition-all animate-slide-up"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
              >
                <span className="text-xl">{dept.emoji}</span>
                <div className="text-left min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{dept.name}</p>
                  <p className="text-[10px] text-muted-foreground">{dept.members} students</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Suggested People */}
        <section className="px-4">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            Students to Connect With
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
