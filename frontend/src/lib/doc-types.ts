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
