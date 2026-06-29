"use client";

import { useEffect, useState } from "react";
import { SavedDocument } from "@/lib/doc-types";

interface Props {
  onLoad: (doc: SavedDocument) => void;
  onClose: () => void;
}

export function MyDocuments({ onLoad, onClose }: Props) {
  const [docs, setDocs] = useState<SavedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/documents", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setDocs(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setDocs([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleDelete(id: number) {
    setDeleting(id);
    await fetch(`/api/documents/${id}`, { method: "DELETE", credentials: "include" });
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setDeleting(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">My Documents</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="px-6 py-10 text-center text-sm text-gray-400 animate-pulse">
              Loading documents…
            </div>
          ) : docs.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-400">No saved documents yet.</p>
              <p className="text-xs text-gray-300 mt-1">
                Draft a document and click &ldquo;Save&rdquo; to store it here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {docs.map((doc) => (
                <li key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.doc_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {doc.doc_type.replace(/-/g, " ")} &middot; Saved {formatDate(doc.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onLoad(doc)}
                      className="text-xs font-medium text-brand-primary hover:opacity-80 px-3 py-1.5 rounded-lg border border-brand-primary border-opacity-30 hover:bg-blue-50 transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      className="text-xs text-gray-400 hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                      aria-label="Delete"
                    >
                      {deleting === doc.id ? "…" : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
