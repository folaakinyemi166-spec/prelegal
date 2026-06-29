export interface CatalogEntry {
  name: string;
  description: string;
  filename: string;
}

export interface FieldDefinition {
  name: string;
  label: string;
  description: string;
}

export type DocFields = Record<string, string | null>;

export interface SavedDocument {
  id: number;
  doc_type: string;
  doc_name: string;
  template_filename: string;
  fields: DocFields;
  created_at: string;
  updated_at: string;
}

export const CATALOG: CatalogEntry[] = [
  { name: "Mutual Non-Disclosure Agreement", description: "Standard mutual NDA for protecting confidential information shared between two parties.", filename: "Mutual-NDA.md" },
  { name: "Mutual NDA Cover Page", description: "Cover page template for the Common Paper Mutual NDA, capturing the specific business terms.", filename: "Mutual-NDA-coverpage.md" },
  { name: "Cloud Service Agreement", description: "Standard agreement for selling and buying cloud software and SaaS products.", filename: "CSA.md" },
  { name: "Service Level Agreement", description: "Standard SLA defining uptime commitments, performance metrics, and remedies for service failures.", filename: "SLA.md" },
  { name: "Data Processing Agreement", description: "Standard agreement governing the processing of personal data, addressing GDPR requirements.", filename: "DPA.md" },
  { name: "Design Partner Agreement", description: "Agreement for early-stage design partner relationships during product development.", filename: "Design-Partner-Agreement.md" },
  { name: "Professional Services Agreement", description: "Standard agreement for professional services engagements covering deliverables and payment.", filename: "PSA.md" },
  { name: "Partnership Agreement", description: "Standard agreement establishing a formal partnership between technology vendors.", filename: "Partnership-Agreement.md" },
  { name: "Business Associate Agreement", description: "HIPAA-compliant agreement governing the handling of protected health information.", filename: "BAA.md" },
  { name: "Software License Agreement", description: "Standard agreement for licensing software products covering scope, restrictions, and payment.", filename: "Software-License-Agreement.md" },
  { name: "Pilot Agreement", description: "Short-term agreement for evaluating a product or service before a full commercial contract.", filename: "Pilot-Agreement.md" },
  { name: "AI Addendum", description: "Addendum addressing AI-specific terms covering model training, data usage, and output ownership.", filename: "AI-Addendum.md" },
];

export function mergeDocFields(current: DocFields, incoming: Record<string, string | null | undefined>): DocFields {
  const merged = { ...current };
  for (const [key, value] of Object.entries(incoming)) {
    if (value != null) {
      merged[key] = value;
    }
  }
  return merged;
}

export function docTypeFromFilename(filename: string): string {
  return filename.replace(/\.md$/, "");
}
