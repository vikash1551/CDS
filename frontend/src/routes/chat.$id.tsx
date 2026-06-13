import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { MobileShell } from "@/components/MobileShell";
import { Send, Phone } from "lucide-react";
import { socketService } from "@/lib/socket";
import { api } from "@/lib/api";

export const Route = createFileRoute("/chat/$id")({
  component: ChatScreen,
});

type Message = {
  id: number;
  text: string;
  sender: string;
  time: string;
};

function ChatScreen() {
  const { id } = Route.useParams();
  const roomId = `chat_${id}`;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  // Connect socket and load history
  useEffect(() => {
    const socket = socketService.connect();

    // Join the chat room
    socket.emit("join_chat", { room_id: roomId, user: "me" });

    // Listen for incoming messages
    socket.on("new_message", (data: any) => {
      // Only add messages from the other person (our own are added immediately)
      if (data.sender !== "me") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: data.text,
            sender: data.sender,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    });

    // Load chat history from backend
    api
      .get(`/chat/history/${roomId}`)
      .then((res) => {
        const history: Message[] = (res.data.messages || []).map((m: any, i: number) => ({
          id: i,
          text: m.text,
          sender: m.sender,
          time: m.timestamp
            ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "",
        }));
        if (history.length > 0) {
          setMessages(history);
        } else {
          // Seed with a welcome message for demo
          setMessages([
            { id: 1, text: `Hey, I saw your listing.`, sender: "me", time: "10:00 AM" },
            { id: 2, text: `Hi! Yes, it's still available.`, sender: "them", time: "10:02 AM" },
          ]);
        }
      })
      .catch(() => {
        // Fallback if backend is unreachable
        setMessages([
          { id: 1, text: `Hey, I saw your listing.`, sender: "me", time: "10:00 AM" },
          { id: 2, text: `Hi! Yes, it's still available.`, sender: "them", time: "10:02 AM" },
        ]);
      })
      .finally(() => setLoading(false));

    return () => {
      socket.off("new_message");
      socket.emit("leave_chat", { room_id: roomId, user: "me" });
    };
  }, [roomId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      text: input,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Emit via socket for real-time delivery
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("chat_message", {
        room_id: roomId,
        text: input,
        sender: "me",
      });
    }
  };

  return (
    <MobileShell>
      <TopBar
        title={id}
        right={
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <Phone className="h-4 w-4" />
          </button>
        }
      />

      <div className="flex h-[calc(100vh-140px)] flex-col bg-background">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center text-xs text-muted-foreground my-4">
            Campus verified chat · Keep it safe!
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    m.sender === "me"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border text-foreground rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm">{m.text}</p>
                  <p
                    className={`mt-1 text-[9px] ${
                      m.sender === "me" ? "text-primary-foreground/70 text-right" : "text-muted-foreground"
                    }`}
                  >
                    {m.time}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border bg-card p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </MobileShell>
  );
}
