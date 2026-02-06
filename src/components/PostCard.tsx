import { Heart, MessageCircle, Share2, Bookmark, ThumbsUp, Laugh, MoreHorizontal } from "lucide-react";
import { useState } from "react";

export type ReactionType = "like" | "love" | "laugh" | null;

interface PostCardProps {
  author: {
    name: string;
    username: string;
    avatar?: string;
    badge?: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares?: number;
  timeAgo: string;
  postType?: "text" | "photo" | "event" | "announcement";
}

const reactionEmojis: Record<string, { icon: typeof Heart; label: string }> = {
  like: { icon: ThumbsUp, label: "Like" },
  love: { icon: Heart, label: "Love" },
  laugh: { icon: Laugh, label: "Haha" },
};

const PostCard = ({ author, content, image, likes, comments, shares = 0, timeAgo, postType = "text" }: PostCardProps) => {
  const [reaction, setReaction] = useState<ReactionType>(null);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showReactions, setShowReactions] = useState(false);

  const handleReaction = (type: ReactionType) => {
    if (reaction === type) {
      setReaction(null);
      setLikeCount(prev => prev - 1);
    } else {
      if (!reaction) setLikeCount(prev => prev + 1);
      setReaction(type);
    }
    setShowReactions(false);
  };

  return (
    <article className="bg-card rounded-2xl border border-border overflow-hidden animate-slide-up knp-card-shadow">
      {/* Author header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="w-11 h-11 rounded-full knp-gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
          {author.avatar ? (
            <img src={author.avatar} alt={author.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            author.name.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm text-foreground truncate">{author.name}</p>
            {author.badge && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/15 text-primary shrink-0">
                {author.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{content}</p>
      </div>

      {/* Image */}
      {image && (
        <div className="bg-muted">
          <img src={image} alt="" className="w-full max-h-96 object-cover" />
        </div>
      )}

      {/* Reaction counts */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">👍</span>
            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px]">❤️</span>
          </span>
          <span className="ml-1">{likeCount}</span>
        </div>
        <div className="flex gap-3">
          <span>{comments} comments</span>
          {shares > 0 && <span>{shares} shares</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center border-t border-border/50 relative">
        {/* Reaction picker */}
        {showReactions && (
          <div className="absolute bottom-full left-2 mb-1 flex items-center gap-1 bg-card border border-border rounded-full px-2 py-1.5 shadow-xl animate-slide-up z-10">
            {Object.entries(reactionEmojis).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => handleReaction(key as ReactionType)}
                className="text-lg hover:scale-125 transition-transform px-1"
                title={label}
              >
                {key === "like" ? "👍" : key === "love" ? "❤️" : "😂"}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => handleReaction("like")}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${
            reaction ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          }`}
        >
          {reaction === "love" ? "❤️" : reaction === "laugh" ? "😂" : <ThumbsUp className={`w-4 h-4 ${reaction === "like" ? "fill-current" : ""}`} />}
          <span>{reaction ? reactionEmojis[reaction]?.label || "Like" : "Like"}</span>
        </button>

        <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>

        <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className={`px-3 py-2.5 transition-all ${
            saved ? "text-accent" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>
    </article>
  );
};

export default PostCard;
