"use client";

import { CatalogEntry } from "@/lib/doc-types";

const CATALOG: CatalogEntry[] = [
  {
    name: "Mutual Non-Disclosure Agreement",
    description: "Standard mutual NDA for protecting confidential information shared between two parties.",
    filename: "Mutual-NDA.md",
  },
  {
    name: "Mutual NDA Cover Page",
    description: "Cover page template for the Common Paper Mutual NDA, capturing the specific business terms.",
    filename: "Mutual-NDA-coverpage.md",
  },
  {
    name: "Cloud Service Agreement",
    description: "Standard agreement for selling and buying cloud software and SaaS products.",
    filename: "CSA.md",
  },
  {
    name: "Service Level Agreement",
    description: "Standard SLA defining uptime commitments, performance metrics, and remedies for service failures.",
    filename: "SLA.md",
  },
  {
    name: "Data Processing Agreement",
    description: "Standard agreement governing the processing of personal data, addressing GDPR requirements.",
    filename: "DPA.md",
  },
  {
    name: "Design Partner Agreement",
    description: "Agreement for early-stage design partner relationships during product development.",
    filename: "Design-Partner-Agreement.md",
  },
  {
    name: "Professional Services Agreement",
    description: "Standard agreement for professional services engagements covering deliverables and payment.",
    filename: "PSA.md",
  },
  {
    name: "Partnership Agreement",
    description: "Standard agreement establishing a formal partnership between technology vendors.",
    filename: "Partnership-Agreement.md",
  },
  {
    name: "Business Associate Agreement",
    description: "HIPAA-compliant agreement governing the handling of protected health information.",
    filename: "BAA.md",
  },
  {
    name: "Software License Agreement",
    description: "Standard agreement for licensing software products covering scope, restrictions, and payment.",
    filename: "Software-License-Agreement.md",
  },
  {
    name: "Pilot Agreement",
    description: "Short-term agreement for evaluating a product or service before a full commercial contract.",
    filename: "Pilot-Agreement.md",
  },
  {
    name: "AI Addendum",
    description: "Addendum addressing AI-specific terms covering model training, data usage, and output ownership.",
    filename: "AI-Addendum.md",
  },
];

interface Props {
  onSelect: (entry: CatalogEntry) => void;
}

export function DocumentCatalog({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-brand-navy">PreLegal</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI-powered legal agreement builder</p>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose a document type</h2>
        <p className="text-sm text-gray-500 mb-8">
          Select a legal agreement to draft. Our AI will guide you through the process with a short conversation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATALOG.map((entry) => (
            <button
              key={entry.filename}
              onClick={() => onSelect(entry)}
              className="text-left bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-primary hover:shadow-sm transition-all group"
            >
              <h3 className="font-semibold text-sm text-gray-900 group-hover:text-brand-primary mb-2 leading-snug">
                {entry.name}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">{entry.description}</p>
              <span className="mt-4 inline-block text-xs font-medium text-brand-primary">
                Start drafting →
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
