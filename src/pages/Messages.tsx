import { Search, Edit } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

const mockChats = [
  { name: "Aisha Patel", lastMessage: "That sounds great! Let's connect tomorrow 🤝", time: "2m", unread: 3 },
  { name: "David Chen", lastMessage: "Did you see the new feature launch?", time: "15m", unread: 1 },
  { name: "Priya Sharma", lastMessage: "Thanks for the recommendation!", time: "1h", unread: 0 },
  { name: "James Wilson", lastMessage: "Let me send you the deck", time: "3h", unread: 0 },
  { name: "Sarah Kim", lastMessage: "Welcome to KNP Connect! 🎉", time: "1d", unread: 0 },
  { name: "Marcus Johnson", lastMessage: "Interested in the investment opportunity", time: "2d", unread: 0 },
];

const Messages = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-14 pb-20 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
          <button className="p-2 rounded-xl text-primary hover:bg-secondary transition-colors">
            <Edit className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex flex-col">
          {mockChats.map((chat, i) => (
            <button
              key={i}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors animate-slide-up"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full knp-gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {chat.name.charAt(0)}
                </div>
                {chat.unread > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
                    {chat.unread}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-semibold text-foreground truncate ${chat.unread > 0 ? "" : ""}`}>
                    {chat.name}
                  </p>
                  <span className={`text-xs shrink-0 ml-2 ${chat.unread > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                    {chat.time}
                  </span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {chat.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Messages;
