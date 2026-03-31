import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, Loader2, Mic, MicOff, Volume2 } from "lucide-react";
import { SuccessOverlay } from "./SuccessOverlay";
import { useEasyMode } from "@/contexts/EasyModeContext";
import { useVoiceRecognition } from "./useVoiceRecognition";

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

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex justify-start">
      <div className="bg-muted rounded-2xl rounded-bl-md px-5 py-3.5 flex items-center gap-1.5 shadow-sm">
        <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/60" />
        <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/60" />
        <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/60" />
      </div>
    </motion.div>
  );
}

function SpeakingIndicator() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-xs text-primary ml-2 mt-1">
      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
      <span>Speaking...</span>
    </motion.div>
  );
}

export function ChatComplaint() {
  const { easyMode, language } = useEasyMode();

  const [sessionId] = useState(() => String(Date.now()));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [complaint, setComplaint] = useState<ComplaintResult | null>(null);
  const [showSpeaking, setShowSpeaking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { voiceState, transcript, start, stop, reset } = useVoiceRecognition(
    language === "hi" ? "hi" : "en"
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (voiceState === "understood" && transcript) {
      sendMessage(transcript);
      reset();
    }
  }, [voiceState]);

  // 🔊 AUDIO PLAYER
  const playAudio = (base64: string) => {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audio.play().catch((err) => console.error("Audio blocked:", err));
    } catch (err) {
      console.error("Audio decode error:", err);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${CHAT_API}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text.trim() }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "bot",
        content: data.reply || "Sorry, I didn't understand that.",
      };

      await new Promise((r) => setTimeout(r, 400));

      setMessages((prev) => [...prev, botMsg]);

      setShowSpeaking(true);
      setTimeout(() => setShowSpeaking(false), 2000);

      // 🔊 PLAY BOT VOICE
      if (data.audio) {
        setTimeout(() => {
          playAudio(data.audio);
        }, 300);
      }

      if (data.completed) {
        setCompleted(true);
        setComplaint({
          category: data.data?.category || "",
          subcategory: data.data?.subcategory || "",
          amount: data.data?.amount || "",
          description: data.data?.issue || "",
        });
        setShowSuccess(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "bot",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading && input.trim()) sendMessage(input);
  };

  const handleMicClick = () => {
    if (voiceState === "listening") stop();
    else if (voiceState === "idle") start();
  };

  const handleFileAnother = () => {
    setShowSuccess(false);
    setCompleted(false);
    setComplaint(null);
    setMessages([]);
    setInput("");
  };

  const micDisabled = loading || voiceState === "processing" || completed;

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <SuccessOverlay visible={showSuccess} complaint={complaint} onFileAnother={handleFileAnother} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4 min-h-0 px-1">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex flex-col max-w-[80%]">
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  } ${easyMode ? "text-lg" : "text-sm"}`}
                >
                  {msg.content}
                </div>

                {msg.role === "bot" && idx === messages.length - 1 && showSpeaking && (
                  <SpeakingIndicator />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && <TypingIndicator />}
      </div>

      {!completed && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={micDisabled}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-muted"
          >
            {voiceState === "processing" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : voiceState === "listening" ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 border border-border rounded-xl px-4 py-3 bg-card text-foreground"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-xl bg-primary text-primary-foreground"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <Send className="w-5 h-5 mx-auto" />}
          </button>
        </form>
      )}
    </div>
  );
}