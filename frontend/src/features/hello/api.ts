import { getServerJson } from "@/lib/api-client"

export type HelloResponse = {
  message: string
}

export function getHello() {
  return getServerJson<HelloResponse>("/hello")
}
