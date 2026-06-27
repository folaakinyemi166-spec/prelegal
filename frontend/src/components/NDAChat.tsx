"use client";

import { useEffect, useRef, useState } from "react";
import { NDAFormData } from "@/lib/nda-types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface NdaFields {
  assistant_reply: string;
  purpose?: string | null;
  effective_date?: string | null;
  mnda_term_type?: "expires" | "continues" | null;
  mnda_term_years?: string | null;
  confidentiality_term_type?: "years" | "perpetuity" | null;
  confidentiality_term_years?: string | null;
  governing_law?: string | null;
  jurisdiction?: string | null;
  modifications?: string | null;
  party1_company?: string | null;
  party1_print_name?: string | null;
  party1_title?: string | null;
  party1_notice_address?: string | null;
  party2_company?: string | null;
  party2_print_name?: string | null;
  party2_title?: string | null;
  party2_notice_address?: string | null;
}

function mergeFields(current: NDAFormData, fields: NdaFields): NDAFormData {
  return {
    purpose: fields.purpose ?? current.purpose,
    effectiveDate: fields.effective_date ?? current.effectiveDate,
    mndaTermType: fields.mnda_term_type ?? current.mndaTermType,
    mndaTermYears: fields.mnda_term_years ?? current.mndaTermYears,
    confidentialityTermType: fields.confidentiality_term_type ?? current.confidentialityTermType,
    confidentialityTermYears: fields.confidentiality_term_years ?? current.confidentialityTermYears,
    governingLaw: fields.governing_law ?? current.governingLaw,
    jurisdiction: fields.jurisdiction ?? current.jurisdiction,
    modifications: fields.modifications ?? current.modifications,
    party1: {
      company: fields.party1_company ?? current.party1.company,
      printName: fields.party1_print_name ?? current.party1.printName,
      title: fields.party1_title ?? current.party1.title,
      noticeAddress: fields.party1_notice_address ?? current.party1.noticeAddress,
    },
    party2: {
      company: fields.party2_company ?? current.party2.company,
      printName: fields.party2_print_name ?? current.party2.printName,
      title: fields.party2_title ?? current.party2.title,
      noticeAddress: fields.party2_notice_address ?? current.party2.noticeAddress,
    },
  };
}

interface Props {
  data: NDAFormData;
  onChange: (data: NDAFormData) => void;
}

export function NDAChat({ data, onChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch AI greeting on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/chat/greeting`)
      .then((r) => r.json())
      .then((body: { message: string }) => {
        setMessages([{ role: "assistant", content: body.message }]);
      })
      .catch(() => {
        setMessages([{ role: "assistant", content: "Hi! I'm ready to help you create a Mutual NDA. What's the purpose of this agreement?" }]);
      });
  }, []);

  // Scroll to bottom when messages change
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
          history: messages, // send history before the new message
        }),
      });

      if (!res.ok) throw new Error("API error");

      const body: { assistant_reply: string; nda_fields: NdaFields } = await res.json();
      setMessages([...nextMessages, { role: "assistant", content: body.assistant_reply }]);
      if (body.nda_fields) {
        onChange(mergeFields(data, body.nda_fields));
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
      {/* Message list */}
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

      {/* Input */}
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
