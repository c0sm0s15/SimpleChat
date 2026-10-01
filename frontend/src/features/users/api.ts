import { getJson } from "@/lib/api-client"

export type User = Record<string, string>

export function getUsers() {
  return getJson<{ users: User[] }>("/users/")
}
