import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Shield, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { useT } from "@/lib/i18n";

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

export default function FileComplaint() {
  const { isAuthenticated } = useAuth();
  const { easyMode, language } = useEasyMode();
  const t = useT(language);

  const [sessionId] = useState(() => String(Date.now()));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [complaint, setComplaint] = useState<ComplaintResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Start conversation on mount
  useEffect(() => {
    if (isAuthenticated && messages.length === 0) {
      sendMessage("hi", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const sendMessage = async (text: string, isInit = false) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };

    if (!isInit) {
      setMessages((prev) => [...prev, userMsg]);
    }
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${CHAT_API}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text.trim() }),
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

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
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: "bot",
        content: "Something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading && input.trim()) {
      sendMessage(input);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">{t("auth.loginRequired")}</h2>
        <p className="text-muted-foreground text-sm mb-6">{t("auth.loginToFile")}</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold min-h-[48px] hover:brightness-110 transition-all focus:outline-none focus:ring-4 focus:ring-primary/30"
        >
          {t("auth.loginButton")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-2xl flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className={`font-bold ${easyMode ? "text-3xl" : "text-2xl"}`}>{t("wizard.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("wizard.subtitle")}</p>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4 min-h-0">
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

        {/* Complaint ready card */}
        {completed && complaint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-5 shadow-card"
          >
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

      {/* Input */}
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
