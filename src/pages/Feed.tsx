import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import PostCard from "@/components/PostCard";
import StoryCircle from "@/components/StoryCircle";

const mockStories = [
  { name: "You", isOwn: true },
  { name: "Aisha" },
  { name: "David" },
  { name: "Priya" },
  { name: "James" },
  { name: "Fatima" },
];

const mockPosts = [
  {
    author: { name: "Aisha Patel", username: "aishap", avatar: "" },
    content: "Just launched our new product feature! 🚀 Excited to share what the team has been working on. The future of social connectivity is here.",
    likes: 142,
    comments: 23,
    timeAgo: "2h",
  },
  {
    author: { name: "David Chen", username: "dchen", avatar: "" },
    content: "Great networking event today at the tech conference. Met amazing people building the future of mobile apps. #KNPConnect #Networking",
    likes: 89,
    comments: 12,
    timeAgo: "4h",
  },
  {
    author: { name: "Priya Sharma", username: "priyaS", avatar: "" },
    content: "Tips for building your professional network:\n\n1. Be authentic\n2. Give before you ask\n3. Follow up consistently\n4. Add value to conversations\n\nWhat would you add? 👇",
    likes: 256,
    comments: 45,
    timeAgo: "6h",
  },
  {
    author: { name: "James Wilson", username: "jwilson", avatar: "" },
    content: "Collaboration is the key to innovation. Just finished a project with an incredible cross-functional team. Grateful for these connections! 🙌",
    likes: 67,
    comments: 8,
    timeAgo: "8h",
  },
];

const Feed = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-14 pb-20 max-w-lg mx-auto">
        {/* Stories */}
        <div className="flex gap-3 px-4 py-4 overflow-x-auto scrollbar-none">
          {mockStories.map((story, i) => (
            <StoryCircle key={i} name={story.name} isOwn={story.isOwn} />
          ))}
        </div>

        {/* Feed */}
        <div className="flex flex-col gap-3 px-4 pb-4">
          {mockPosts.map((post, i) => (
            <PostCard key={i} {...post} />
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Feed;
