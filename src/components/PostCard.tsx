import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { useState } from "react";

interface PostCardProps {
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timeAgo: string;
}

const PostCard = ({ author, content, image, likes, comments, timeAgo }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <article className="bg-card rounded-2xl border border-border overflow-hidden animate-slide-up knp-card-shadow">
      {/* Author header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="w-10 h-10 rounded-full knp-gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground">
          {author.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{author.name}</p>
          <p className="text-xs text-muted-foreground">@{author.username} · {timeAgo}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-foreground/90 leading-relaxed">{content}</p>
      </div>

      {/* Image */}
      {image && (
        <div className="px-4 pb-3">
          <div className="rounded-xl overflow-hidden bg-muted aspect-video">
            <img src={image} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${
              liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className={`w-4.5 h-4.5 ${liked ? "fill-current" : ""}`} strokeWidth={2} />
            <span className="text-xs font-medium">{likeCount}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="w-4.5 h-4.5" strokeWidth={2} />
            <span className="text-xs font-medium">{comments}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Share2 className="w-4.5 h-4.5" strokeWidth={2} />
          </button>
        </div>
        <button
          onClick={() => setSaved(!saved)}
          className={`transition-all duration-200 ${
            saved ? "text-accent" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bookmark className={`w-4.5 h-4.5 ${saved ? "fill-current" : ""}`} strokeWidth={2} />
        </button>
      </div>
    </article>
  );
};

export default PostCard;
