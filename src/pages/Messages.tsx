import { Search, Edit, Check, CheckCheck, Users as UsersIcon } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";

type ChatType = "personal" | "group";

interface Chat {
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: ChatType;
  members?: number;
  emoji?: string;
  isTyping?: boolean;
  delivered?: boolean;
  read?: boolean;
}

const mockChats: Chat[] = [
  {
    name: "Engineering Class 2027",
    lastMessage: "Kevin: Has anyone done the CAT revision?",
    time: "2m",
    unread: 12,
    type: "group",
    members: 78,
    emoji: "⚙️",
  },
  {
    name: "Grace Moraa",
    lastMessage: "See you at the library! 📚",
    time: "5m",
    unread: 2,
    type: "personal",
    isTyping: false,
    read: true,
  },
  {
    name: "ICT Club KNP",
    lastMessage: "Admin: Bootcamp starts Monday 🖥️",
    time: "15m",
    unread: 5,
    type: "group",
    members: 234,
    emoji: "💻",
  },
  {
    name: "Brian Ochieng",
    lastMessage: "The project is submitted! 🎉",
    time: "1h",
    unread: 0,
    type: "personal",
    delivered: true,
    read: true,
  },
  {
    name: "KNP Marketplace",
    lastMessage: "Faith: Selling textbooks, DM me",
    time: "2h",
    unread: 0,
    type: "group",
    members: 456,
    emoji: "🛒",
  },
  {
    name: "Mercy Kemunto",
    lastMessage: "Thanks for the notes! 🙏",
    time: "3h",
    unread: 0,
    type: "personal",
    delivered: true,
    read: false,
  },
  {
    name: "Business Studies Hub",
    lastMessage: "Dennis: Exam timetable is out",
    time: "5h",
    unread: 3,
    type: "group",
    members: 145,
    emoji: "📊",
  },
  {
    name: "Dennis Otieno",
    lastMessage: "You: I'll check the notice board",
    time: "1d",
    unread: 0,
    type: "personal",
    delivered: true,
    read: true,
  },
];

const Messages = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "personal" | "groups">("all");

  const filteredChats = mockChats.filter(chat => {
    if (activeFilter === "all") return true;
    if (activeFilter === "personal") return chat.type === "personal";
    return chat.type === "group";
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-14 pb-20 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Chats</h1>
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
              placeholder="Search chats..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-4 pb-3">
          {(["all", "personal", "groups"] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                activeFilter === filter
                  ? "knp-gradient-bg text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Chat list */}
        <div className="flex flex-col">
          {filteredChats.map((chat, i) => (
            <button
              key={i}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors animate-slide-up"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
            >
              <div className="relative shrink-0">
                {chat.type === "group" ? (
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg">
                    {chat.emoji}
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full knp-gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {chat.name.charAt(0)}
                  </div>
                )}
                {chat.unread > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
                    {chat.unread}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{chat.name}</p>
                    {chat.type === "group" && (
                      <UsersIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  <span className={`text-[11px] shrink-0 ml-2 ${chat.unread > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {chat.delivered && chat.unread === 0 && (
                    chat.read ? (
                      <CheckCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )
                  )}
                  <p className={`text-xs truncate ${chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {chat.lastMessage}
                  </p>
                </div>
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
