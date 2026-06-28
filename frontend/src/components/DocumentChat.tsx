"use client";

import { useEffect, useRef, useState } from "react";
import { DocFields, mergeDocFields } from "@/lib/doc-types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  docType: string;
  fields: DocFields;
  onChange: (fields: DocFields) => void;
}

export function DocumentChat({ docType, fields, onChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch greeting on mount. Parent uses key={docType} so this component remounts on doc change.
  useEffect(() => {
    fetch(`${API_BASE}/api/chat/greeting?doc_type=${encodeURIComponent(docType)}`)
      .then((r) => r.json())
      .then((body: { message: string }) => {
        setMessages([{ role: "assistant", content: body.message }]);
      })
      .catch(() => {
        setMessages([{ role: "assistant", content: "Hi! I'm ready to help you draft this document. What would you like to start with?" }]);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_message: text,
          history: messages,
          doc_type: docType,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const body: { assistant_reply: string; doc_fields: Record<string, string | null> } = await res.json();
      setMessages([...nextMessages, { role: "assistant", content: body.assistant_reply }]);
      if (body.doc_fields) {
        onChange(mergeDocFields(fields, body.doc_fields));
      }
    } catch {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: "Sorry, I ran into an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-brand-primary text-white rounded-tr-sm"
                  : "bg-gray-100 text-gray-800 rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            aria-label="Chat message"
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary"
            rows={2}
            placeholder="Type your message… (Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 bg-brand-primary hover:opacity-90 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-xl transition-opacity"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
