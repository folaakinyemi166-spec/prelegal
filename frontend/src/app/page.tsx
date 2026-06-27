"use client";

import { useState } from "react";
import { NDAForm } from "@/components/NDAForm";
import { NDAPreview } from "@/components/NDAPreview";
import { defaultFormData, NDAFormData } from "@/lib/nda-types";

export default function Home() {
  const [data, setData] = useState<NDAFormData>(defaultFormData);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 print:h-auto print:overflow-visible">
      {/* Form panel — hidden on print */}
      <aside className="print:hidden w-96 min-w-80 border-r border-gray-200 bg-white flex flex-col">
        <header className="px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-lg font-bold text-gray-900">Mutual NDA Generator</h1>
          <p className="text-xs text-gray-500 mt-0.5">Fill in the details to generate your agreement</p>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <NDAForm data={data} onChange={setData} />
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
          <span className="text-xs text-gray-500">Live preview — updates as you type</span>
        </div>
        <div className="max-w-3xl mx-auto px-10 py-10 print:px-0 print:py-0 print:max-w-none">
          <NDAPreview data={data} />
        </div>
      </main>
    </div>
  );
}
