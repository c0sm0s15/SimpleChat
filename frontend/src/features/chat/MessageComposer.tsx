import { ArrowUp, LoaderCircle } from "lucide-react"
import { type FormEvent, type KeyboardEvent } from "react"

import { Button } from "@/components/ui/button"

type MessageComposerProps = {
  draft: string
  disabled: boolean
  onDraftChange: (draft: string) => void
  onSend: () => void
}

export function MessageComposer({ draft, disabled, onDraftChange, onSend }: MessageComposerProps) {
  const canSend = draft.trim().length > 0 && !disabled

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (canSend) onSend()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      if (canSend) onSend()
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[1.5rem] border border-[#dedfd8] bg-white p-3 shadow-[0_12px_40px_-28px_rgba(34,48,39,0.45)] focus-within:border-[#91a99a] focus-within:ring-4 focus-within:ring-[#587563]/10">
      <label htmlFor="chat-draft" className="sr-only">Message the assistant</label>
      <textarea
        id="chat-draft"
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={8000}
        rows={3}
        disabled={disabled}
        placeholder="Message SimpleChat…"
        className="max-h-48 min-h-20 w-full resize-y bg-transparent px-2 py-1 text-sm leading-6 text-[#29332d] outline-none placeholder:text-[#a0a49d] disabled:opacity-60"
      />
      <div className="flex items-center justify-between gap-4 px-1 pt-2">
        <span className="text-xs text-[#969a92]" aria-live="polite">{draft.length.toLocaleString()} / 8,000</span>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-[#969a92] sm:inline">Enter to send · Shift+Enter for a new line</span>
          <Button type="submit" aria-label="Send message" disabled={!canSend} className="size-9 rounded-xl bg-[#284538] p-0 text-white hover:bg-[#365d49] focus-visible:ring-4 focus-visible:ring-[#587563]/25">
            {disabled ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </Button>
        </div>
      </div>
    </form>
  )
}
