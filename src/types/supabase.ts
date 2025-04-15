
import { Json } from "@/integrations/supabase/types";

export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

export function parseJsonObject<T>(json: Json | undefined | null): T {
  if (!json) return {} as T;
  if (typeof json === 'object') return json as T;
  try {
    return JSON.parse(json as string) as T;
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return {} as T;
  }
}

export function parseJsonArray<T>(json: Json | undefined | null): T[] {
  if (!json) return [] as T[];
  if (Array.isArray(json)) return json as T[];
  try {
    return JSON.parse(json as string) as T[];
  } catch (e) {
    console.error("Error parsing JSON array:", e);
    return [] as T[];
  }
}
