import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import PostCard from "@/components/PostCard";
import StoryCircle from "@/components/StoryCircle";
import CreatePostFAB from "@/components/CreatePostFAB";
import CampusGroups from "@/components/CampusGroups";
import campusHero from "@/assets/campus-hero.jpg";

const mockStories = [
  { name: "You", isOwn: true },
  { name: "Kevin", emoji: "🎸", hasStatus: true },
  { name: "Grace", hasStatus: true },
  { name: "Brian", emoji: "⚽", hasStatus: true },
  { name: "Faith", hasStatus: true },
  { name: "Dennis", hasStatus: false },
  { name: "Mercy", hasStatus: true },
];

const mockPosts = [
  {
    author: { name: "KNP Admin", username: "knpadmin", badge: "Official" },
    content: "📢 Important Notice: Registration for the new semester is now open! Visit the admissions office or check the student portal. Deadline: February 15, 2026.\n\n#KisiiNationalPolytechnic #Registration",
    likes: 342,
    comments: 56,
    shares: 124,
    timeAgo: "1h ago",
    postType: "announcement" as const,
  },
  {
    author: { name: "Grace Moraa", username: "gracemoraa" },
    content: "Beautiful day on campus! 🌞 Love the new garden next to the engineering block. KNP is really upgrading! 💚",
    image: campusHero,
    likes: 189,
    comments: 34,
    shares: 12,
    timeAgo: "2h ago",
    postType: "photo" as const,
  },
  {
    author: { name: "ICT Department", username: "ictknp", badge: "Department" },
    content: "🖥️ Free coding bootcamp starting next week!\n\nTopics:\n• Web Development (HTML, CSS, JS)\n• Mobile App Development\n• Database Management\n\nOpen to all departments. Register at the ICT lab, Room 204.\n\n#LearnToCode #KNPTech",
    likes: 278,
    comments: 89,
    shares: 67,
    timeAgo: "3h ago",
  },
  {
    author: { name: "Brian Ochieng", username: "brianochieng" },
    content: "Just finished our group project presentation for Software Engineering! 💻 Shoutout to my team — Kevin, Mercy, and Dennis. We built an e-commerce app from scratch! 🔥\n\nWho else is done with their projects? 👇",
    likes: 156,
    comments: 42,
    shares: 8,
    timeAgo: "5h ago",
  },
  {
    author: { name: "KNP Sports Club", username: "knpsports", badge: "Club" },
    content: "🏆 CONGRATULATIONS to our football team for winning the inter-polytechnic tournament! 🎉⚽\n\nFinal score: KNP 3 - 1 Eldoret Poly\n\nMVP: Brian Ochieng 🌟\n\n#KNPPride #Champions",
    likes: 567,
    comments: 123,
    shares: 89,
    timeAgo: "8h ago",
  },
];

const Feed = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-14 pb-20 max-w-lg mx-auto">
        {/* Stories / Status bar */}
        <div className="flex gap-3 px-4 py-4 overflow-x-auto scrollbar-none border-b border-border/50">
          {mockStories.map((story, i) => (
            <StoryCircle
              key={i}
              name={story.name}
              isOwn={story.isOwn}
              hasStatus={story.hasStatus}
              emoji={story.emoji}
            />
          ))}
        </div>

        {/* Campus Groups horizontal scroll */}
        <div className="pt-4">
          <CampusGroups />
        </div>

        {/* Feed */}
        <div className="flex flex-col gap-3 px-4 pb-4">
          {mockPosts.map((post, i) => (
            <PostCard key={i} {...post} />
          ))}
        </div>
      </main>

      <CreatePostFAB />
      <BottomNav />
    </div>
  );
};

export default Feed;
