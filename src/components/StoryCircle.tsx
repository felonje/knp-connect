interface StoryCircleProps {
  name: string;
  isOwn?: boolean;
}

const StoryCircle = ({ name, isOwn = false }: StoryCircleProps) => {
  return (
    <button className="flex flex-col items-center gap-1.5 min-w-[68px]">
      <div className="relative">
        <div className="w-16 h-16 rounded-full p-[2px] knp-gradient-bg">
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">{name.charAt(0)}</span>
          </div>
        </div>
        {isOwn && (
          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-card">
            +
          </div>
        )}
      </div>
      <span className="text-[11px] text-muted-foreground font-medium truncate w-full text-center">
        {isOwn ? "Your Story" : name}
      </span>
    </button>
  );
};

export default StoryCircle;
