"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { DocFields } from "@/lib/doc-types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

interface FieldRow {
  label: string;
  value: string | null;
}

interface Props {
  templateFilename: string;
  fields: DocFields;
  fieldLabels: Record<string, string>;
}

export function DocumentPreview({ templateFilename, fields, fieldLabels }: Props) {
  const [templateContent, setTemplateContent] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState(false);

  // Fetch template on mount. Parent uses key={templateFilename} so this component remounts on template change.
  useEffect(() => {
    fetch(`${API_BASE}/api/templates/${encodeURIComponent(templateFilename)}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.text();
      })
      .then((text) => setTemplateContent(text))
      .catch(() => setTemplateError(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fieldRows: FieldRow[] = Object.entries(fields).map(([name, value]) => ({
    label: fieldLabels[name] ?? name,
    value,
  }));

  const hasAnyField = fieldRows.some((r) => r.value);

  return (
    <div id="document-preview" className="font-serif text-gray-900 text-sm leading-relaxed">
      {/* Disclaimer */}
      <div className="print:block mb-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 leading-relaxed">
        <strong>Draft document — for review purposes only.</strong> This agreement was generated with AI assistance
        and has not been reviewed by an attorney. It should not be used as a final legal document without review
        by a qualified legal professional.
      </div>

      {/* Key Terms cover page */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-1">Key Terms</h2>
        <p className="text-xs text-gray-500 mb-4">
          These terms are gathered through the AI chat and will be incorporated into the agreement below.
        </p>

        {hasAnyField ? (
          <table className="w-full border-collapse text-sm">
            <tbody>
              {fieldRows.map(({ label, value }) =>
                value ? (
                  <tr key={label} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-600 w-2/5 align-top text-xs">{label}</td>
                    <td className="py-2 text-gray-900 align-top">{value}</td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 italic text-sm">
            No information gathered yet. Start chatting on the left to fill in the key terms.
          </p>
        )}
      </div>

      <div className="border-t-2 border-gray-300 pt-6">
        <h2 className="text-lg font-bold mb-4">Standard Terms</h2>

        {templateContent ? (
          <div data-testid="template-content" className="prose prose-sm max-w-none text-gray-800 [&_span]:text-blue-800 [&_span]:font-medium">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{templateContent}</ReactMarkdown>
          </div>
        ) : templateError ? (
          <p className="text-gray-400 italic text-sm">Standard terms could not be loaded.</p>
        ) : (
          <p className="text-gray-400 italic text-sm animate-pulse">Loading standard terms…</p>
        )}
      </div>
    </div>
  );
}
