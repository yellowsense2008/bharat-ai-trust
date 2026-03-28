import { useState, useRef, useCallback } from "react";
import type { VoiceState } from "./types";

export function useVoiceRecognition(lang: "en" | "hi") {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const start = useCallback((onResult?: (text: string) => void) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return false;

    const recognition = new SR();
    recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
      if (event.results[event.results.length - 1]?.isFinal) {
        onResult?.(text);
      }
    };

    recognition.onerror = () => {
      setVoiceState("idle");
    };

    recognition.onend = () => {
      if (voiceState === "listening") {
        setVoiceState("understood");
        setTimeout(() => setVoiceState("idle"), 1500);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setVoiceState("listening");
    setTranscript("");
    return true;
  }, [lang, voiceState]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    if (transcript) {
      setVoiceState("understood");
      setTimeout(() => setVoiceState("idle"), 1500);
    } else {
      setVoiceState("idle");
    }
  }, [transcript]);

  const reset = useCallback(() => {
    recognitionRef.current?.stop();
    setVoiceState("idle");
    setTranscript("");
  }, []);

  return { voiceState, transcript, start, stop, reset, setTranscript };
}
