import { LoaderCircle, Sparkles, UserRound } from "lucide-react"
import { useEffect, useRef } from "react"

import type { ChatMessage } from "@/features/chat/types"

type MessageListProps = { messages: ChatMessage[]; isStreaming: boolean }

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 py-8 sm:px-8 sm:py-10" aria-live="polite" aria-relevant="additions text">
      {messages.map((message) => (
        <article key={message.id} className={`flex gap-3.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
          <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl ${message.role === "assistant" ? "bg-[#e8efe9] text-[#355342]" : "bg-[#f2eee7] text-[#64594b]"}`} aria-hidden="true">
            {message.role === "assistant" ? <Sparkles className="size-4" /> : <UserRound className="size-4" />}
          </span>
          <div className={`max-w-[min(85%,44rem)] rounded-2xl px-4 py-3 text-sm leading-7 sm:px-5 ${message.role === "user" ? "rounded-tr-md bg-[#eef1eb] text-[#343a33]" : "rounded-tl-md bg-white text-[#343a33] ring-1 ring-[#ecece6]"}`}>
            {message.content ? <p className="whitespace-pre-wrap break-words">{message.content}</p> : isStreaming && message.role === "assistant" ? <span className="inline-flex items-center gap-2 text-[#858c83]"><LoaderCircle className="size-4 animate-spin" />Thinking…</span> : <p className="text-[#92978f]">No response text was returned.</p>}
          </div>
        </article>
      ))}
      <div ref={endRef} />
    </div>
  )
}
