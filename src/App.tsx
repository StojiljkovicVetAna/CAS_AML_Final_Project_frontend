import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowUp, CheckCircle2, MessageCircle } from "lucide-react";
import logo from "./assets/dog-chat-logo-westie.png";
import { AnswerView, type Message } from "./components/AnswerView";
import { SourcePanel } from "./components/SourcePanel";
import {
  askQuestion,
  checkBackendReady,
  searchChunks,
  type ChatResponse,
  type ConversationTurn,
  type RetrievedChunk,
} from "./lib/api";

type BackendStatus = "checking" | "ready" | "waking" | "unavailable";

const WAKE_ATTEMPTS = 50;
const WAKE_RETRY_DELAY_MS = 3000;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function timestamp() {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function recentConversationTurns(messages: Message[], maxPairs = 3): ConversationTurn[] {
  return messages.slice(-maxPairs).flatMap((message) => [
    { role: "user", content: message.question } satisfies ConversationTurn,
    { role: "assistant", content: message.answer } satisfies ConversationTurn,
  ]);
}

function DogPawIcon() {
  return (
    <svg
      aria-hidden
      className="relative h-[17px] w-[17px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.45"
    >
      <g transform="rotate(38 12 12)">
        <ellipse cx="6.9" cy="7.7" rx="1.85" ry="2.55" />
        <ellipse cx="10.8" cy="5.8" rx="1.85" ry="2.55" />
        <ellipse cx="14.8" cy="5.8" rx="1.85" ry="2.55" />
        <ellipse cx="18.7" cy="7.7" rx="1.85" ry="2.55" />
        <path d="M6.3 17.4c0-3.5 2.7-6.3 6.7-6.3s6.7 2.8 6.7 6.3c0 2.2-1.3 3.5-3.2 3.5-1.2 0-2.2-.45-3.5-.45s-2.3.45-3.5.45c-1.9 0-3.2-1.3-3.2-3.5Z" />
      </g>
    </svg>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [latestMeta, setLatestMeta] = useState<ChatResponse | null>(null);
  const [chunks, setChunks] = useState<RetrievedChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const mountedRef = useRef(false);
  const wakeRunRef = useRef(0);

  const isBackendReady = backendStatus === "ready";
  const statusLabel = isBackendReady ? "Ready" : "App waking up...";

  const ensureBackendReady = useCallback(async () => {
    const runId = wakeRunRef.current + 1;
    wakeRunRef.current = runId;
    if (!mountedRef.current) return false;
    setBackendStatus((current) => (current === "ready" ? current : "waking"));

    for (let attempt = 0; attempt < WAKE_ATTEMPTS; attempt += 1) {
      try {
        await checkBackendReady();
        if (mountedRef.current && wakeRunRef.current === runId) {
          setBackendStatus("ready");
        }
        return true;
      } catch {
        if (!mountedRef.current) return false;
        if (wakeRunRef.current === runId) {
          setBackendStatus("waking");
        }
        await sleep(WAKE_RETRY_DELAY_MS);
      }
    }

    if (mountedRef.current && wakeRunRef.current === runId) {
      setBackendStatus("unavailable");
    }
    return false;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const wakeTimer = window.setTimeout(() => {
      ensureBackendReady();
    }, 0);

    return () => {
      window.clearTimeout(wakeTimer);
      mountedRef.current = false;
      wakeRunRef.current += 1;
    };
  }, [ensureBackendReady]);

  const latestSources = useMemo(() => latestMeta?.sources || [], [latestMeta]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError("");

    try {
      if (backendStatus !== "ready") {
        setLoading(false);
        const ready = await ensureBackendReady();
        if (!ready) return;
        setLoading(true);
      }

      const conversationHistory = recentConversationTurns(messages);
      const [chat, search] = await Promise.all([
        askQuestion(trimmed, conversationHistory),
        searchChunks(trimmed, conversationHistory),
      ]);

      setLatestMeta(chat);
      setChunks(search.chunks);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          question: trimmed,
          answer: chat.answer,
          createdAt: timestamp(),
        },
      ]);
      setQuery("");
    } catch (exc) {
      const message = exc instanceof Error ? exc.message : "The request failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#d9edf7_0%,#eef8fb_42%,#f8fbf8_100%)] text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 py-5 lg:px-8">
        <header className="mb-5 flex flex-col gap-3 px-1 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Canine research assistant logo"
              className="h-16 w-16 rounded-3xl object-cover shadow-soft ring-4 ring-white/65"
            />
            <div>
              <h1 className="text-2xl font-black leading-tight text-ink md:text-3xl">
                Canine Research Assistant
              </h1>
              <p className="text-sm font-medium text-graphite/80">
                Scientific answers grounded in dog behaviour papers
              </p>
            </div>
          </div>
          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-soft backdrop-blur ${
              isBackendReady
                ? "border-emerald-200 bg-emerald-50/85 text-emerald-700"
                : "border-primary/20 bg-white/70 text-primary"
            }`}
            aria-live="polite"
          >
            {isBackendReady ? (
              <CheckCircle2 size={17} aria-hidden />
            ) : (
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute h-5 w-5 animate-ping rounded-full bg-primary/20" />
                <DogPawIcon />
              </span>
            )}
            <span>{statusLabel}</span>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,820px)_360px] lg:justify-center">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/65 bg-white/66 shadow-chat backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-white/70 bg-white/35 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageCircle size={21} aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">Research Chat</h2>
                <p className="text-xs font-medium text-graphite/75">
                  Ask one question at a time; answers include retrieved evidence.
                </p>
              </div>
            </div>

            <section className="min-h-0 flex-1 overflow-y-auto bg-skywash/55 px-4 py-5 sm:px-6">
              <AnswerView messages={messages} loading={loading} />
            </section>

            {error && (
              <div className="alert alert-error mx-4 my-3 rounded-2xl sm:mx-6">
                <AlertCircle size={18} aria-hidden />
                <span>{error}</span>
              </div>
            )}

            <form
              className="border-t border-white/70 bg-white/72 px-4 py-4 backdrop-blur sm:px-5"
              onSubmit={submit}
            >
              <div className="flex items-end gap-2">
                <label className="sr-only" htmlFor="query">
                  Research question
                </label>
                <textarea
                  id="query"
                  className="textarea textarea-bordered min-h-20 flex-1 resize-none rounded-3xl bg-shell px-5 py-4 text-base leading-relaxed focus:outline-primary"
                  placeholder="Ask about dog behaviour, cognition, welfare, training, or assessment methods..."
                  value={query}
                  disabled={loading}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
                <button
                  className="btn btn-primary h-14 w-14 shrink-0 rounded-full"
                  type="submit"
                  disabled={
                    !query.trim() ||
                    loading ||
                    backendStatus === "checking" ||
                    backendStatus === "waking"
                  }
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <ArrowUp size={22} aria-label="Ask" />
                  )}
                </button>
              </div>
            </form>
          </section>

          <aside className="flex min-h-0 flex-col">
            <SourcePanel sources={latestSources} chunks={chunks} />
          </aside>
        </div>
      </div>
    </main>
  );
}
