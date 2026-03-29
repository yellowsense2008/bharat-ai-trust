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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex justify-start"
    >
      <div className="bg-muted rounded-2xl rounded-bl-md px-5 py-3.5 flex items-center gap-1.5 shadow-sm">
        <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/60" style={{ animationDelay: "0ms" }} />
        <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/60" style={{ animationDelay: "150ms" }} />
        <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/60" style={{ animationDelay: "300ms" }} />
      </div>
    </motion.div>
  );
}

function SpeakingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-1.5 text-xs font-medium text-primary ml-2 mt-1"
    >
      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
      <span>Speaking...</span>
      <span className="flex gap-0.5">
        <span className="waveform-bar w-0.5 h-3 bg-primary/70 rounded-full" style={{ animationDelay: "0ms" }} />
        <span className="waveform-bar w-0.5 h-3 bg-primary/70 rounded-full" style={{ animationDelay: "100ms" }} />
        <span className="waveform-bar w-0.5 h-3 bg-primary/70 rounded-full" style={{ animationDelay: "200ms" }} />
        <span className="waveform-bar w-0.5 h-3 bg-primary/70 rounded-full" style={{ animationDelay: "300ms" }} />
        <span className="waveform-bar w-0.5 h-3 bg-primary/70 rounded-full" style={{ animationDelay: "400ms" }} />
      </span>
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // When voice recognition completes, send the transcript
  useEffect(() => {
    if (voiceState === "understood" && transcript) {
      sendMessage(transcript);
      reset();
    }
  }, [voiceState]);

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

      // Brief delay for realism
      await new Promise((r) => setTimeout(r, 400));

      setMessages((prev) => [...prev, botMsg]);

      // Brief speaking indicator
      setShowSpeaking(true);
      setTimeout(() => setShowSpeaking(false), 2000);

      if (data.completed) {
        setCompleted(true);
        setComplaint({
          category: data.category || data.complaint?.category || "",
          subcategory: data.subcategory || data.complaint?.subcategory || "",
          amount: data.amount || data.complaint?.amount || "",
          description: data.description || data.complaint?.description || "",
        });
        setShowSuccess(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: "bot", content: "Something went wrong. Please try again." },
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
    if (voiceState === "listening") {
      stop();
    } else if (voiceState === "idle") {
      start();
    }
  };

  const micDisabled = loading || voiceState === "processing" || completed;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4 min-h-0 px-1">
        {messages.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-10 text-muted-foreground"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mic className="w-7 h-7 text-primary" />
            </div>
            <p className={easyMode ? "text-lg" : "text-sm"}>
              {language === "hi"
                ? "अपनी शिकायत दर्ज करने के लिए टाइप करें या माइक्रोफोन का उपयोग करें।"
                : "Type a message or use the microphone to start filing your complaint."}
            </p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex flex-col max-w-[80%]">
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm transition-shadow ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md shadow-primary/10"
                      : "bg-muted text-foreground rounded-bl-md shadow-muted-foreground/5"
                  } ${easyMode ? "text-lg" : "text-sm"}`}
                >
                  {msg.content}
                </div>
                {/* Speaking indicator on the latest bot message */}
                <AnimatePresence>
                  {msg.role === "bot" && idx === messages.length - 1 && showSpeaking && (
                    <SpeakingIndicator />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>{loading && <TypingIndicator />}</AnimatePresence>

        {/* Voice transcript preview */}
        <AnimatePresence>
          {voiceState === "listening" && transcript && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex justify-end"
            >
              <div className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 bg-primary/10 text-primary border border-primary/20 text-sm italic">
                🎙️ {transcript}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {completed && complaint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card border border-border rounded-xl p-5 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <span className="font-bold text-success">
                {language === "hi" ? "शिकायत तैयार" : "Complaint Ready"}
              </span>
            </div>
            <div className="space-y-3">
              {complaint.category && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {language === "hi" ? "श्रेणी" : "Category"}
                  </p>
                  <p className="font-medium">{complaint.category}</p>
                </div>
              )}
              {complaint.subcategory && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {language === "hi" ? "उप-श्रेणी" : "Subcategory"}
                  </p>
                  <p className="font-medium">{complaint.subcategory}</p>
                </div>
              )}
              {complaint.amount && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {language === "hi" ? "राशि" : "Amount"}
                  </p>
                  <p className="font-medium">{complaint.amount}</p>
                </div>
              )}
              {complaint.description && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {language === "hi" ? "विवरण" : "Description"}
                  </p>
                  <p className="font-medium">{complaint.description}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {!completed && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3 border-t border-border">
          {/* Mic button */}
          <button
            type="button"
            onClick={handleMicClick}
            disabled={micDisabled}
            className={`relative flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-40 active:scale-90 ${
              voiceState === "listening"
                ? "bg-destructive text-destructive-foreground mic-pulse-ring"
                : voiceState === "processing"
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
            aria-label={voiceState === "listening" ? "Stop recording" : "Start recording"}
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
            placeholder={
              voiceState === "listening"
                ? language === "hi" ? "सुन रहे हैं..." : "Listening..."
                : language === "hi" ? "अपना संदेश लिखें..." : "Type your message..."
            }
            disabled={loading}
            className={`flex-1 border border-border rounded-xl px-4 py-3 bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none disabled:opacity-50 transition-all ${easyMode ? "text-lg" : ""}`}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-ring active:scale-90"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <Send className="w-5 h-5 mx-auto" />
            )}
          </button>
        </form>
      )}
    </div>
  );
}
