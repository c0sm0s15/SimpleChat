import { ArrowRight, Leaf, MessageSquarePlus, Sparkles } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { MessageComposer } from "@/features/chat/MessageComposer"
import { MessageList } from "@/features/chat/MessageList"
import { streamChat } from "@/features/chat/api"
import type { ChatMessage } from "@/features/chat/types"

const starterPrompts = ["Draft a message", "Explain a topic", "Brainstorm"]

function makeMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: crypto.randomUUID(), role, content }
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)
  const requestId = useRef(0)

  function startNewChat() {
    requestId.current += 1
    activeRequest.current?.abort()
    activeRequest.current = null
    setMessages([])
    setDraft("")
    setError(null)
    setIsStreaming(false)
  }

  async function runTurn(nextMessages: ChatMessage[], userMessageId: string, clearDraft: boolean) {
    const thisRequest = ++requestId.current
    const controller = new AbortController()
    activeRequest.current?.abort()
    activeRequest.current = controller
    const assistant = makeMessage("assistant", "")
    const transcript = nextMessages.filter((message) => message.content.trim()).slice(-20)
    setMessages([...transcript, assistant])
    setError(null)
    setIsStreaming(true)
    if (clearDraft) setDraft("")

    try {
      await streamChat(
        transcript.map(({ role, content }) => ({ role, content })),
        {
          signal: controller.signal,
          onDelta: (text) => {
            if (requestId.current !== thisRequest) return
            setMessages((current) => current.map((message) => message.id === assistant.id ? { ...message, content: message.content + text } : message))
          },
        },
      )
      if (requestId.current === thisRequest) setError(null)
    } catch (cause) {
      if (controller.signal.aborted || requestId.current !== thisRequest) return
      setMessages((current) => current.filter((message) => message.id !== assistant.id))
      setError(cause instanceof Error ? cause.message : "The assistant connection was interrupted. Please retry.")
      setDraft((current) => current || (clearDraft ? nextMessages.find((message) => message.id === userMessageId)?.content ?? "" : current))
    } finally {
      if (requestId.current === thisRequest) {
        activeRequest.current = null
        setIsStreaming(false)
      }
    }
  }

  function sendMessage(text = draft) {
    const content = text.trim()
    if (!content || isStreaming || content.length > 8000) return
    const userMessage = makeMessage("user", content)
    const nextMessages = [...messages, userMessage]
    void runTurn(nextMessages, userMessage.id, true)
  }

  function retryTurn() {
    if (isStreaming) return
    const userMessage = [...messages].reverse().find((message) => message.role === "user")
    if (!userMessage) return
    void runTurn(messages, userMessage.id, false)
  }

  return (
    <main className="min-h-svh bg-[#f8f8f5] text-[#252a26]">
      <div className="mx-auto flex min-h-svh w-full max-w-[1440px] flex-col md:flex-row">
        <aside className="flex shrink-0 flex-col gap-4 border-b border-[#e9e9e2] bg-[#f3f4f0] px-4 py-4 md:min-h-svh md:w-64 md:border-b-0 md:border-r md:px-5 md:py-6">
          <a href="#chat" className="flex items-center gap-2.5 px-2 text-sm font-semibold tracking-tight text-[#293b30]">
            <span className="flex size-8 items-center justify-center rounded-xl bg-[#2d4939] text-white"><Leaf className="size-4" /></span>
            SimpleChat
          </a>
          <Button type="button" variant="outline" onClick={startNewChat} className="h-10 justify-start gap-2 rounded-xl border-[#e0e2dc] bg-white px-3 text-[#414940] hover:bg-[#f9faf7]">
            <MessageSquarePlus className="size-4" /> New chat
          </Button>
          <div className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            <p className="hidden px-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#969a92] md:block">Try asking</p>
            {starterPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={isStreaming} className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm text-[#666d65] transition hover:border-[#e4e6df] hover:bg-white hover:text-[#293b30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#668574] disabled:opacity-50">
                {prompt}<ArrowRight className="size-3.5 opacity-50" />
              </button>
            ))}
          </div>
          <div className="mt-auto hidden items-start gap-2 rounded-xl bg-white/70 p-3 text-xs leading-5 text-[#878d84] md:flex"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-[#718e79]" />Your conversation stays in this page’s memory and clears when you start over or refresh.</div>
        </aside>

        <section id="chat" className="flex min-h-[70svh] min-w-0 flex-1 flex-col md:min-h-svh">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#ecece7] px-5 sm:px-8">
            <p className="text-sm font-medium text-[#444b44]">New conversation</p>
            <span className="rounded-full border border-[#e5e8e1] bg-white px-2.5 py-1 text-[11px] font-medium text-[#758075]">AI assistant</span>
          </header>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center">
                <span className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-[#e9f0e9] text-[#45654f]"><Sparkles className="size-5" /></span>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#869184]">A fresh start</p>
                <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-[#2e3931] sm:text-4xl">What would you like to work on?</h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#858b83]">Ask a question, shape an idea, or get a first draft. Your conversation is temporary.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {starterPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={isStreaming} className="rounded-full border border-[#e2e5de] bg-white px-4 py-2 text-xs font-medium text-[#59665b] transition hover:border-[#b9c9bb] hover:bg-[#f9fbf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#668574] disabled:opacity-50">{prompt}</button>)}
                </div>
              </div>
            ) : <MessageList messages={messages} isStreaming={isStreaming} />}
          </div>
          <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-2 sm:px-8 sm:pb-6">
            {error && (
              <div role="alert" className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ecd9d4] bg-[#fff8f5] px-4 py-3 text-sm text-[#8c5145]">
                <span>{error}</span>
                <button type="button" onClick={retryTurn} className="shrink-0 font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ab796e]">Retry</button>
              </div>
            )}
            <MessageComposer draft={draft} disabled={isStreaming} onDraftChange={setDraft} onSend={() => sendMessage()} />
            <p className="mt-3 text-center text-[11px] leading-4 text-[#969a92]">Messages are sent to OpenAI to generate replies. SimpleChat doesn’t save your conversation. OpenAI’s data controls still apply.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
