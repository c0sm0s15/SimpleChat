import { useState } from "react"
import { ArrowUpRight, LoaderCircle, Radio, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getHello } from "@/features/hello/api"

type ConnectionState = "idle" | "loading" | "success" | "error"

export function App() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle")
  const [message, setMessage] = useState("")

  async function connectToPython() {
    setConnectionState("loading")
    setMessage("")

    try {
      const response = await getHello()
      setMessage(response.message)
      setConnectionState("success")
    } catch {
      setMessage("Could not reach the Python API. Make sure FastAPI is running on port 8000.")
      setConnectionState("error")
    }
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f8f8f6] px-5 py-12 text-[#20211e]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-40 -top-48 size-[28rem] rounded-full bg-[#dff1e9] blur-3xl" />
        <div className="absolute -bottom-56 -right-32 size-[34rem] rounded-full bg-[#f6e8d5] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#242620_0.65px,transparent_0.65px)] bg-[size:18px_18px] opacity-[0.07]" />
      </div>

      <section className="relative w-full max-w-2xl">
        <div className="mb-5 flex items-center justify-between">
          <a className="flex items-center gap-2.5 text-sm font-semibold tracking-tight" href="#top">
            <span className="flex size-8 items-center justify-center rounded-xl bg-[#253b32] text-white">
              <Sparkles className="size-4" />
            </span>
            Hello stack
          </a>
          <span className="rounded-full border border-[#e5e5df] bg-white/75 px-3 py-1.5 text-xs font-medium text-[#686a62] shadow-sm">
            React + FastAPI
          </span>
        </div>

        <div id="top" className="overflow-hidden rounded-[2rem] border border-[#e7e7e1] bg-white/90 shadow-[0_24px_80px_-40px_rgba(29,40,33,0.28)] backdrop-blur">
          <div className="p-7 sm:p-11">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#edf5ef] px-3 py-1.5 text-xs font-semibold text-[#345b45]">
              <span className="size-1.5 rounded-full bg-[#5a9a70]" />
              Your first full-stack connection
            </div>

            <h1 className="max-w-lg text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-7xl">
              A little hello,
              <span className="mt-1 block font-serif font-normal italic text-[#648272]">from Python.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#707169]">
              This page is React. Tap below and it will ask your FastAPI backend to say hello.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button
                className="h-11 rounded-full bg-[#263d33] px-6 text-sm text-white shadow-sm hover:bg-[#365746]"
                disabled={connectionState === "loading"}
                onClick={connectToPython}
              >
                {connectionState === "loading" ? "Connecting…" : "Say hello"}
                {connectionState === "loading" ? (
                  <LoaderCircle className="animate-spin" data-icon="inline-end" />
                ) : (
                  <ArrowUpRight data-icon="inline-end" />
                )}
              </Button>
              <span className="text-xs text-[#898a83]">GET&nbsp; /hello</span>
            </div>
          </div>

          <div className="border-t border-[#eeeee9] bg-[#fbfbf9] px-7 py-6 sm:px-11">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#85867f]">
                <Radio className="size-3.5" />
                API connection
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#73746e]">
                <span className={`size-2 rounded-full ${connectionState === "success" ? "bg-emerald-500" : connectionState === "error" ? "bg-red-500" : "bg-[#c9cbc4]"}`} />
                {connectionState === "success" ? "Connected" : connectionState === "error" ? "Offline" : "Waiting to connect"}
              </div>
            </div>
            <div
              aria-live="polite"
              className={`mt-4 min-h-14 rounded-2xl border px-4 py-3 font-mono text-sm leading-6 ${connectionState === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[#e9e9e3] bg-white text-[#3f5145]"}`}
            >
              {message ? (
                <span>{message}</span>
              ) : (
                <span className="text-[#aaaBA4]">The backend response will appear here.</span>
              )}
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-[#92938c]">A tiny page with a real trip to the Python backend.</p>
      </section>
    </main>
  )
}

export default App
