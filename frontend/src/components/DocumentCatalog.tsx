"use client";

import { CATALOG, CatalogEntry } from "@/lib/doc-types";

interface Props {
  onSelect: (entry: CatalogEntry) => void;
}

export function DocumentCatalog({ onSelect }: Props) {
  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-brand-navy mb-1.5">Choose a document type</h2>
        <p className="text-sm text-gray-500">
          Select a legal agreement to draft. Our AI will guide you through the process with a short conversation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATALOG.map((entry) => (
          <button
            key={entry.filename}
            onClick={() => onSelect(entry)}
            className="text-left bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-primary hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm text-gray-900 group-hover:text-brand-primary leading-snug">
                {entry.name}
              </h3>
              <span className="text-gray-300 group-hover:text-brand-primary transition-colors flex-shrink-0 text-base leading-none mt-0.5">
                →
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{entry.description}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
