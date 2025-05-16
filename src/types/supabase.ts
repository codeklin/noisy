
import { Json } from "@/integrations/supabase/types";

export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

export function parseJsonObject<T>(json: Json | undefined | null): T {
  if (!json) {
    console.log("parseJsonObject: json is null or undefined, returning empty object");
    return {} as T;
  }

  if (typeof json === 'object' && !Array.isArray(json)) {
    console.log("parseJsonObject: json is already an object, returning as is");
    return json as T;
  }

  if (typeof json === 'string') {
    try {
      console.log("parseJsonObject: parsing json string");
      const parsed = JSON.parse(json) as T;
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        console.error("parseJsonObject: parsed result is not an object", parsed);
        return {} as T;
      }
      return parsed;
    } catch (e) {
      console.error("Error parsing JSON object:", e);
      return {} as T;
    }
  }

  console.error("parseJsonObject: json is not an object or string", json);
  return {} as T;
}

export function parseJsonArray<T>(json: Json | undefined | null): T[] {
  if (!json) {
    console.log("parseJsonArray: json is null or undefined, returning empty array");
    return [] as T[];
  }

  if (Array.isArray(json)) {
    console.log("parseJsonArray: json is already an array, returning as is");
    return json as T[];
  }

  if (typeof json === 'string') {
    try {
      console.log("parseJsonArray: parsing json string");
      const parsed = JSON.parse(json) as T[];
      if (!Array.isArray(parsed)) {
        console.error("parseJsonArray: parsed result is not an array", parsed);
        return [] as T[];
      }
      return parsed;
    } catch (e) {
      console.error("Error parsing JSON array:", e);
      return [] as T[];
    }
  }

  console.error("parseJsonArray: json is not an array or string", json);
  return [] as T[];
}
