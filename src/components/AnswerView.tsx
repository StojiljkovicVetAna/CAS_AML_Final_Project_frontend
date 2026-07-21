import { Bot, Copy, UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";
import logo from "../assets/app-logo.png";

export type Message = {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
};

type AnswerViewProps = {
  messages: Message[];
  loading: boolean;
};

export function AnswerView({ messages, loading }: AnswerViewProps) {
  if (!messages.length && !loading) {
    return (
      <div className="relative flex min-h-[460px] items-start justify-center overflow-hidden px-5 pt-5 text-center sm:pt-6">
        <div
          aria-hidden
          className="pointer-events-none absolute top-32 h-72 w-72 overflow-hidden rounded-[64px] opacity-[0.24] blur-[0.5px] sm:top-28 sm:h-96 sm:w-96"
        >
          <img
            src={logo}
            alt=""
            className="h-full w-full scale-[1.08] object-cover object-[center_42%]"
          />
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-2xl font-black text-ink">Ask a research question</h2>
          <p className="mt-3 text-sm leading-relaxed text-graphite/75">
            I will search the scientific corpus and answer with supporting evidence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-5">
      {messages.map((message) => (
        <article className="space-y-4" key={message.id}>
          <div className="flex items-start justify-end gap-3">
            <div className="max-w-[82%] rounded-[24px] rounded-tr-md bg-accent px-5 py-3 text-white shadow-soft">
              <p className="leading-relaxed">{message.question}</p>
            </div>
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white">
              <UserRound size={18} aria-hidden />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <Bot size={18} aria-hidden />
            </div>
            <div className="group relative w-full rounded-[26px] rounded-tl-md border border-primary/15 bg-base-100 px-5 py-4 text-ink shadow-soft">
              <button
                className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3 opacity-0 transition group-hover:opacity-100"
                onClick={() => navigator.clipboard.writeText(message.answer)}
              >
                <Copy size={14} aria-label="Copy answer" />
              </button>
              <div className="pr-7 leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                    ul: ({ children }) => (
                      <ul className="mb-4 list-disc space-y-2 pl-5 last:mb-0">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 list-decimal space-y-2 pl-5 last:mb-0">{children}</ol>
                    ),
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                    strong: ({ children }) => (
                      <strong className="font-semibold text-ink">{children}</strong>
                    ),
                  }}
                >
                  {message.answer}
                </ReactMarkdown>
              </div>
              <div className="mt-3 text-xs text-graphite/70">{message.createdAt}</div>
            </div>
          </div>
        </article>
      ))}

      {loading && (
        <div className="flex w-fit items-center gap-3 rounded-full border border-base-300 bg-base-100 px-4 py-3 text-sm text-graphite shadow-soft">
          <span className="loading loading-spinner loading-sm text-primary" />
          Retrieving evidence and generating an answer...
        </div>
      )}
    </section>
  );
}
