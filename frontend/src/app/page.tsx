"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { AuthScreen } from "@/components/AuthScreen";
import { DocumentCatalog } from "@/components/DocumentCatalog";
import { DocumentChat } from "@/components/DocumentChat";
import { DocumentPreview } from "@/components/DocumentPreview";
import { MyDocuments } from "@/components/MyDocuments";
import { CATALOG, CatalogEntry, DocFields, FieldDefinition, SavedDocument, docTypeFromFilename } from "@/lib/doc-types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function Home() {
  const { user, isLoading, setUser } = useAuth();

  const [selectedDoc, setSelectedDoc] = useState<CatalogEntry | null>(null);
  const [fields, setFields] = useState<DocFields>({});
  const [fieldDefs, setFieldDefs] = useState<FieldDefinition[]>([]);
  const [savedDocId, setSavedDocId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showMyDocs, setShowMyDocs] = useState(false);

  const docType = selectedDoc ? docTypeFromFilename(selectedDoc.filename) : null;

  function handleSelect(entry: CatalogEntry) {
    setFields({});
    setFieldDefs([]);
    setSavedDocId(null);
    setSelectedDoc(entry);
  }

  function handleNewDocument() {
    setSelectedDoc(null);
    setFields({});
    setFieldDefs([]);
    setSavedDocId(null);
  }

  function handleLoadDoc(doc: SavedDocument) {
    setShowMyDocs(false);
    const entry = CATALOG.find((c) => c.filename === doc.template_filename);
    if (!entry) return;
    setFields(doc.fields);
    setFieldDefs([]);
    setSavedDocId(doc.id);
    setSelectedDoc(entry);
  }

  useEffect(() => {
    if (!docType) return;
    fetch(`${API_BASE}/api/chat/config?doc_type=${encodeURIComponent(docType)}`)
      .then((r) => r.json())
      .then((body: { fields: FieldDefinition[] }) => setFieldDefs(body.fields ?? []))
      .catch(() => {});
  }, [docType]);

  async function handleSave() {
    if (!selectedDoc || !docType) return;
    setSaveStatus("saving");

    const docName = `${selectedDoc.name} – ${new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;

    try {
      if (savedDocId) {
        const res = await fetch(`${API_BASE}/api/documents/${savedDocId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ fields }),
        });
        if (!res.ok) throw new Error("save failed");
      } else {
        const res = await fetch(`${API_BASE}/api/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            doc_type: docType,
            doc_name: docName,
            template_filename: selectedDoc.filename,
            fields,
          }),
        });
        if (!res.ok) throw new Error("save failed");
        const data = await res.json();
        setSavedDocId(data.id);
      }
      setSaveStatus("saved");
    } catch {
      setSaveStatus("idle");
    }

    setTimeout(() => setSaveStatus("idle"), 2500);
  }

  const fieldLabels: Record<string, string> = Object.fromEntries(
    fieldDefs.map((f) => [f.name, f.label])
  );

  // Auth loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-400 animate-pulse">Loading…</div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <AuthScreen onAuth={setUser} />;
  }

  // Catalog view
  if (!selectedDoc || !docType) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader
          onMyDocuments={() => setShowMyDocs(true)}
        />
        <DocumentCatalog onSelect={handleSelect} />
        {showMyDocs && (
          <MyDocuments onLoad={handleLoadDoc} onClose={() => setShowMyDocs(false)} />
        )}
      </div>
    );
  }

  // Chat + preview view
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 print:h-auto print:overflow-visible">
      <AppHeader
        showBackToCatalog
        onBackToCatalog={handleNewDocument}
        onMyDocuments={() => setShowMyDocs(true)}
        onNewDocument={handleNewDocument}
      />

      <div className="flex flex-1 overflow-hidden print:h-auto print:overflow-visible print:flex-col">
        {/* Chat sidebar */}
        <aside className="print:hidden w-96 min-w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <h1 className="text-sm font-bold text-gray-900 leading-tight">{selectedDoc.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Chat with AI to generate your agreement</p>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <DocumentChat key={docType} docType={docType} fields={fields} onChange={setFields} />
          </div>

          <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 space-y-2">
            <button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className={`w-full font-medium py-2.5 px-4 rounded-lg text-sm transition-all ${
                saveStatus === "saved"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-brand-primary hover:opacity-90 disabled:opacity-50 text-white"
              }`}
            >
              {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : savedDocId ? "Save changes" : "Save document"}
            </button>
            <button
              onClick={() => window.print()}
              className="w-full bg-brand-secondary hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-opacity"
            >
              Download PDF
            </button>
            <p className="text-xs text-gray-400 text-center">Select &ldquo;Save as PDF&rdquo; in the print dialog</p>
          </div>
        </aside>

        {/* Preview panel */}
        <main className="flex-1 overflow-y-auto bg-white print:overflow-visible">
          <div className="print:hidden px-6 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">Live preview — updates as you chat</span>
            {savedDocId && <span className="text-xs text-green-600 font-medium">Saved</span>}
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

      {showMyDocs && (
        <MyDocuments onLoad={handleLoadDoc} onClose={() => setShowMyDocs(false)} />
      )}
    </div>
  );
}
