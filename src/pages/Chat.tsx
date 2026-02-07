import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Image } from "lucide-react";
import { useChatMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, sendMessage, isLoading } = useChatMessages(id || "");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversation } = useQuery({
    queryKey: ["conversation-detail", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", id!)
        .maybeSingle();

      if (!data) return null;

      const { data: members } = await supabase
        .from("conversation_members")
        .select("user_id")
        .eq("conversation_id", id!);

      const otherUserId = members?.find((m) => m.user_id !== user!.id)?.user_id;
      let otherProfile = null;

      if (otherUserId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", otherUserId)
          .maybeSingle();
        otherProfile = profile;
      }

      return { ...data, otherProfile };
    },
    enabled: !!id,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (!id || !user) return;
    supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", id)
      .neq("sender_id", user.id)
      .eq("is_read", false)
      .then();
  }, [id, user, messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const msg = newMessage.trim();
    setNewMessage("");
    await sendMessage.mutateAsync(msg);
  };

  const chatName = conversation?.is_group
    ? conversation.name
    : conversation?.otherProfile?.full_name || "Chat";

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-background/90 backdrop-blur-xl border-b border-border safe-top shrink-0">
        <div className="flex items-center gap-3 h-14 px-4 max-w-lg mx-auto">
          <button onClick={() => navigate("/messages")} className="p-2 rounded-xl text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full knp-gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
            {chatName?.charAt(0) || "C"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{chatName}</p>
            <p className="text-xs text-muted-foreground">
              {conversation?.is_group ? "Group" : "Online"}
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex mb-3 ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                    isOwn
                      ? "knp-gradient-bg text-primary-foreground rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md"
                  }`}
                >
                  {!isOwn && conversation?.is_group && (
                    <p className="text-xs font-semibold text-primary mb-0.5">{msg.sender?.full_name}</p>
                  )}
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background/90 backdrop-blur-xl safe-bottom shrink-0">
        <div className="flex items-center gap-2 px-4 py-3 max-w-lg mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-10 px-4 rounded-full bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-10 h-10 rounded-full knp-gradient-bg flex items-center justify-center disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
