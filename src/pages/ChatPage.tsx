import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMessages, addMessage, deleteMessage, messageSchema, Message } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Send } from "lucide-react";

const roleBadgeColor: Record<string, string> = {
  patient: "bg-primary/10 text-primary",
  caregiver: "bg-accent text-accent-foreground",
  volunteer: "bg-success/10 text-success",
  moderator: "bg-destructive/10 text-destructive",
};

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(getMessages());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { text: validated } = messageSchema.parse({ text });
      addMessage(user, validated);
      setMessages(getMessages());
      setText("");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid message");
    }
  };

  const handleDelete = (id: string) => {
    deleteMessage(id);
    setMessages(getMessages());
  };

  const isModerator = user.role === "moderator";

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-3rem)]">
      <h1 className="text-xl font-bold mb-4">Community Chat</h1>

      <div className="flex-1 overflow-auto space-y-3 mb-4 rounded-lg border bg-card p-4">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.userId === user.id ? "justify-end" : ""}`}>
            <div className={`max-w-[75%] rounded-lg px-4 py-2.5 ${msg.userId === user.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold">{msg.userName}</span>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${roleBadgeColor[msg.userRole] || ""}`}>
                  {msg.userRole}
                </Badge>
                {isModerator && (
                  <button onClick={() => handleDelete(msg.id)} className="ml-auto opacity-60 hover:opacity-100" title="Delete message">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.userId === user.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          maxLength={1000}
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
