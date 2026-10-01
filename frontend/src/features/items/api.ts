import { getJson } from "@/lib/api-client"

export type Item = Record<string, string>

export function getItems() {
  return getJson<{ items: Item[] }>("/items/")
}
