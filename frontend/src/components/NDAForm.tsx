"use client";

import { NDAFormData, PartyDetails } from "@/lib/nda-types";

interface Props {
  data: NDAFormData;
  onChange: (data: NDAFormData) => void;
}

function PartySection({
  label,
  party,
  onChange,
}: {
  label: string;
  party: PartyDetails;
  onChange: (p: PartyDetails) => void;
}) {
  const set = (field: keyof PartyDetails) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...party, [field]: e.target.value });

  return (
    <fieldset className="border border-gray-200 rounded-lg p-4">
      <legend className="text-sm font-semibold text-gray-700 px-1">{label}</legend>
      <div className="space-y-3 mt-1">
        <Field label="Company" value={party.company} onChange={set("company")} />
        <Field label="Print Name" value={party.printName} onChange={set("printName")} />
        <Field label="Title" value={party.title} onChange={set("title")} />
        <Field
          label="Notice Address (email or postal)"
          value={party.noticeAddress}
          onChange={set("noticeAddress")}
          multiline
        />
      </div>
    </fieldset>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
  type?: string;
}) {
  const base =
    "w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {multiline ? (
        <textarea className={`${base} resize-none`} rows={2} value={value} onChange={onChange} />
      ) : (
        <input className={base} type={type} value={value} onChange={onChange} />
      )}
    </div>
  );
}

export function NDAForm({ data, onChange }: Props) {
  const set = <K extends keyof NDAFormData>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange({ ...data, [field]: e.target.value });

  return (
    <div className="space-y-5 text-sm">
      <h2 className="text-base font-semibold text-gray-800">NDA Details</h2>

      {/* Purpose */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Purpose <span className="text-gray-400 font-normal">(How Confidential Information may be used)</span>
        </label>
        <textarea
          className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={2}
          value={data.purpose}
          onChange={set("purpose")}
        />
      </div>

      {/* Effective Date */}
      <Field label="Effective Date" value={data.effectiveDate} onChange={set("effectiveDate")} type="date" />

      {/* MNDA Term */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          MNDA Term <span className="text-gray-400 font-normal">(Length of this MNDA)</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mndaTermType"
              value="expires"
              checked={data.mndaTermType === "expires"}
              onChange={() => onChange({ ...data, mndaTermType: "expires" })}
              className="accent-blue-600"
            />
            <span>Expires after</span>
            <input
              type="number"
              min="1"
              className="w-16 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={data.mndaTermYears}
              onChange={set("mndaTermYears")}
              disabled={data.mndaTermType !== "expires"}
            />
            <span>year(s) from Effective Date</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mndaTermType"
              value="continues"
              checked={data.mndaTermType === "continues"}
              onChange={() => onChange({ ...data, mndaTermType: "continues" })}
              className="accent-blue-600"
            />
            <span>Continues until terminated</span>
          </label>
        </div>
      </div>

      {/* Term of Confidentiality */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Term of Confidentiality <span className="text-gray-400 font-normal">(How long info is protected)</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="confidentialityTermType"
              value="years"
              checked={data.confidentialityTermType === "years"}
              onChange={() => onChange({ ...data, confidentialityTermType: "years" })}
              className="accent-blue-600"
            />
            <input
              type="number"
              min="1"
              className="w-16 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={data.confidentialityTermYears}
              onChange={set("confidentialityTermYears")}
              disabled={data.confidentialityTermType !== "years"}
            />
            <span>year(s) from Effective Date (+ trade secret protection)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="confidentialityTermType"
              value="perpetuity"
              checked={data.confidentialityTermType === "perpetuity"}
              onChange={() => onChange({ ...data, confidentialityTermType: "perpetuity" })}
              className="accent-blue-600"
            />
            <span>In perpetuity</span>
          </label>
        </div>
      </div>

      {/* Governing Law */}
      <Field label="Governing Law (State)" value={data.governingLaw} onChange={set("governingLaw")} />

      {/* Jurisdiction */}
      <Field
        label="Jurisdiction (e.g. courts located in New Castle, DE)"
        value={data.jurisdiction}
        onChange={set("jurisdiction")}
      />

      {/* Modifications */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          MNDA Modifications <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          placeholder="List any modifications to the MNDA..."
          value={data.modifications}
          onChange={set("modifications")}
        />
      </div>

      {/* Parties */}
      <PartySection
        label="Party 1"
        party={data.party1}
        onChange={(p) => onChange({ ...data, party1: p })}
      />
      <PartySection
        label="Party 2"
        party={data.party2}
        onChange={(p) => onChange({ ...data, party2: p })}
      />
    </div>
  );
}
