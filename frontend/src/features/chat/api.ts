import { apiUrl } from "@/lib/api-client"
import type { ChatMessage } from "@/features/chat/types"

type ChatInputMessage = Pick<ChatMessage, "role" | "content">

type StreamOptions = {
  signal: AbortSignal
  onDelta: (text: string) => void
}

type StreamFrame = {
  event: string
  data: string
}

function readFrame(frame: string): StreamFrame | null {
  let event = "message"
  const data: string[] = []

  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim()
    } else if (line.startsWith("data:")) {
      data.push(line.slice("data:".length).trimStart())
    }
  }

  if (data.length === 0) return null
  return { event, data: data.join("\n") }
}

function parsePayload(data: string): unknown {
  try {
    return JSON.parse(data) as unknown
  } catch {
    throw new Error("The assistant returned an invalid response. Please retry.")
  }
}

function handleFrame(frame: string, onDelta: (text: string) => void): boolean {
  const parsed = readFrame(frame)
  if (!parsed) return false

  const payload = parsePayload(parsed.data)
  if (parsed.event === "delta") {
    if (
      typeof payload !== "object" ||
      payload === null ||
      !("text" in payload) ||
      typeof payload.text !== "string"
    ) {
      throw new Error("The assistant returned an invalid response. Please retry.")
    }
    onDelta(payload.text)
    return false
  }

  if (parsed.event === "done") return true

  if (parsed.event === "error") {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "The assistant connection was interrupted. Please retry."
    throw new Error(message)
  }

  throw new Error("The assistant returned an unexpected event. Please retry.")
}

async function readError(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json()
    if (
      typeof payload === "object" &&
      payload !== null &&
      "detail" in payload &&
      typeof payload.detail === "string"
    ) {
      return payload.detail
    }
  } catch {
    // Use a generic status message for non-JSON upstream responses.
  }

  return `The chat request failed (HTTP ${response.status}). Please retry.`
}

export async function streamChat(
  messages: ChatInputMessage[],
  options: StreamOptions,
): Promise<void> {
  const response = await fetch(apiUrl("/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal: options.signal,
  })

  if (!response.ok) {
    throw new Error(await readError(response))
  }
  if (!response.body) {
    throw new Error("The assistant did not return a stream. Please retry.")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let receivedDone = false

  try {
    while (true) {
      const { value, done } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })

      let boundary = buffer.search(/\r?\n\r?\n/)
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary)
        const separator = buffer.slice(boundary).match(/^\r?\n\r?\n/)?.[0]
        if (!separator) break
        buffer = buffer.slice(boundary + separator.length)

        if (handleFrame(frame, options.onDelta)) {
          receivedDone = true
          return
        }
        boundary = buffer.search(/\r?\n\r?\n/)
      }

      if (done) break
    }
  } finally {
    await reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }

  if (buffer.trim()) {
    throw new Error("The assistant response ended unexpectedly. Please retry.")
  }
  if (!receivedDone) {
    throw new Error("The assistant response ended unexpectedly. Please retry.")
  }
}
