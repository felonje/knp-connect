import { Plus, Image, Video, Calendar, FileText } from "lucide-react";
import { useState } from "react";

const CreatePostFAB = () => {
  const [expanded, setExpanded] = useState(false);

  const options = [
    { icon: FileText, label: "Post", color: "text-primary" },
    { icon: Image, label: "Photo", color: "text-knp-green" },
    { icon: Video, label: "Video", color: "text-knp-orange" },
    { icon: Calendar, label: "Event", color: "text-accent" },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
      {/* Options */}
      {expanded && (
        <div className="flex flex-col gap-2 animate-slide-up">
          {options.map((opt, i) => (
            <button
              key={i}
              className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-card border border-border shadow-lg hover:bg-secondary transition-colors animate-slide-up"
              style={{ animationDelay: `${(options.length - i) * 50}ms`, animationFillMode: "both" }}
            >
              <opt.icon className={`w-4 h-4 ${opt.color}`} />
              <span className="text-xs font-semibold text-foreground">{opt.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-14 h-14 rounded-full knp-gradient-bg flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          expanded ? "rotate-45" : ""
        }`}
      >
        <Plus className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default CreatePostFAB;
