import { Plus } from "lucide-react";

interface StoryCircleProps {
  name: string;
  isOwn?: boolean;
  hasStatus?: boolean;
  emoji?: string;
}

const StoryCircle = ({ name, isOwn = false, hasStatus = true, emoji }: StoryCircleProps) => {
  return (
    <button className="flex flex-col items-center gap-1.5 min-w-[68px]">
      <div className="relative">
        <div className={`w-16 h-16 rounded-full p-[2.5px] ${hasStatus && !isOwn ? "knp-gradient-bg" : "bg-border"}`}>
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
            {emoji ? (
              <span className="text-xl">{emoji}</span>
            ) : (
              <span className="text-lg font-bold text-foreground">{name.charAt(0)}</span>
            )}
          </div>
        </div>
        {isOwn && (
          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-card">
            <Plus className="w-3 h-3" />
          </div>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground font-medium truncate w-full text-center">
        {isOwn ? "My Status" : name}
      </span>
    </button>
  );
};

export default StoryCircle;
