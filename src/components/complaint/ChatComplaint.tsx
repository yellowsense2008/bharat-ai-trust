import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { useEasyMode } from "@/contexts/EasyModeContext";

const CHAT_API = "https://rbi-backend-1008375634733.asia-south1.run.app";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
}

interface ComplaintResult {
  category: string;
  subcategory: string;
  amount: string;
  description: string;
}

export function ChatComplaint() {
  const { easyMode } = useEasyMode();

  const [sessionId] = useState(() => String(Date.now()));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [complaint, setComplaint] = useState<ComplaintResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${CHAT_API}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text.trim() }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "bot",
        content: data.reply || "Sorry, I didn't understand that.",
      };
      setMessages((prev) => [...prev, botMsg]);

      if (data.completed) {
        setCompleted(true);
        setComplaint({
          category: data.category || data.complaint?.category || "",
          subcategory: data.subcategory || data.complaint?.subcategory || "",
          amount: data.amount || data.complaint?.amount || "",
          description: data.description || data.complaint?.description || "",
        });
      }
    } catch {
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: "bot", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading && input.trim()) sendMessage(input);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4 min-h-0">
        {messages.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <p className={easyMode ? "text-lg" : "text-sm"}>Type a message to start filing your complaint with AI assistance.</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                } ${easyMode ? "text-lg" : "text-sm"}`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Typing...</span>
            </div>
          </motion.div>
        )}

        {completed && complaint && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-bold text-success">Complaint Ready</span>
            </div>
            <div className="space-y-3">
              {complaint.category && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Category</p>
                  <p className="font-medium">{complaint.category}</p>
                </div>
              )}
              {complaint.subcategory && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Subcategory</p>
                  <p className="font-medium">{complaint.subcategory}</p>
                </div>
              )}
              {complaint.amount && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Amount</p>
                  <p className="font-medium">{complaint.amount}</p>
                </div>
              )}
              {complaint.description && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Description</p>
                  <p className="font-medium">{complaint.description}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {!completed && (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-border">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className={`flex-1 border border-border rounded-xl px-4 py-3 bg-card text-foreground focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 ${easyMode ? "text-lg" : ""}`}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:brightness-110 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      )}
    </div>
  );
}
