"use client";

import { useEffect, useState } from "react";
import { DocumentCatalog } from "@/components/DocumentCatalog";
import { DocumentChat } from "@/components/DocumentChat";
import { DocumentPreview } from "@/components/DocumentPreview";
import { CatalogEntry, DocFields, FieldDefinition, docTypeFromFilename } from "@/lib/doc-types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function Home() {
  const [selectedDoc, setSelectedDoc] = useState<CatalogEntry | null>(null);
  const [fields, setFields] = useState<DocFields>({});
  const [fieldDefs, setFieldDefs] = useState<FieldDefinition[]>([]);

  const docType = selectedDoc ? docTypeFromFilename(selectedDoc.filename) : null;

  function handleSelect(entry: CatalogEntry) {
    setFields({});
    setFieldDefs([]);
    setSelectedDoc(entry);
  }

  // Load field definitions when a document is selected
  useEffect(() => {
    if (!docType) return;
    fetch(`${API_BASE}/api/chat/config?doc_type=${encodeURIComponent(docType)}`)
      .then((r) => r.json())
      .then((body: { fields: FieldDefinition[] }) => setFieldDefs(body.fields ?? []))
      .catch(() => {});
  }, [docType]);

  const fieldLabels: Record<string, string> = Object.fromEntries(
    fieldDefs.map((f) => [f.name, f.label])
  );

  if (!selectedDoc || !docType) {
    return <DocumentCatalog onSelect={handleSelect} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 print:h-auto print:overflow-visible">
      {/* Chat panel */}
      <aside className="print:hidden w-96 min-w-80 border-r border-gray-200 bg-white flex flex-col">
        <header className="px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 mb-0.5">
            <button
              onClick={() => setSelectedDoc(null)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Back to catalog"
            >
              ← Back
            </button>
          </div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">{selectedDoc.name}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Chat with AI to generate your agreement</p>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          <DocumentChat key={docType} docType={docType} fields={fields} onChange={setFields} />
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={() => window.print()}
            className="w-full bg-brand-secondary text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
          >
            Download PDF
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Select &ldquo;Save as PDF&rdquo; in the print dialog
          </p>
        </div>
      </aside>

      {/* Preview panel */}
      <main className="flex-1 overflow-y-auto bg-white print:overflow-visible">
        <div className="print:hidden px-6 py-3 border-b border-gray-200 bg-gray-50">
          <span className="text-xs text-gray-500">Live preview — updates as you chat</span>
        </div>
        <div className="max-w-3xl mx-auto px-10 py-10 print:px-0 print:py-0 print:max-w-none">
          <DocumentPreview
            key={selectedDoc.filename}
            templateFilename={selectedDoc.filename}
            fields={fields}
            fieldLabels={fieldLabels}
          />
        </div>
      </main>
    </div>
  );
}
