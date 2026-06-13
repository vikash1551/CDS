import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Phone, MoreVertical } from "lucide-react";
import { CourierAvatar } from "./courier/CourierAvatar";

interface Message {
  id: string;
  text: string;
  sender: "user" | "courier";
  time: string;
}

export function ChatOverlay({
  isOpen,
  onClose,
  courierName = "Rahul",
  courierGender = "male",
}: {
  isOpen: boolean;
  onClose: () => void;
  courierName?: string;
  courierGender?: "male" | "female";
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey! I've picked up your order and am on the way.",
      sender: "courier",
      time: "10:32 AM",
    },
    {
      id: "2",
      text: "Great, thanks! I'm near the main gate.",
      sender: "user",
      time: "10:33 AM",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessage("");

    // Simulate courier reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: "Got it! Reaching in 2 mins.",
        sender: "courier",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, reply]);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl border border-border bg-card shadow-xl md:mx-auto md:max-w-md md:rounded-3xl md:bottom-6 md:h-[600px] h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-3xl border-b border-border bg-card px-4 py-3">
              <div className="flex items-center gap-3">
                <CourierAvatar gender={courierGender} size={40} isMoving={false} />
                <div>
                  <h3 className="text-sm font-bold">{courierName}</h3>
                  <p className="flex items-center gap-1 text-[10px] font-semibold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success"></span> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80">
                  <MoreVertical className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              <div className="flex justify-center">
                <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold text-muted-foreground">
                  Today
                </span>
              </div>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-card border border-border text-foreground rounded-tl-sm shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-1 text-[9px] text-muted-foreground">
                    {msg.time}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-card p-3 md:rounded-b-3xl">
              <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1 pl-4 focus-within:ring-1 focus-within:ring-primary">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    message.trim()
                      ? "bg-primary text-primary-foreground shadow-pop"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
