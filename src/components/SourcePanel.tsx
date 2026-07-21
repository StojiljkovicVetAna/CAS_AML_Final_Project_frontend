import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  FileText,
  Hash,
  Layers,
} from "lucide-react";
import type { RetrievedChunk, Source } from "../lib/api";

type SourcePanelProps = {
  sources: Source[];
  chunks: RetrievedChunk[];
};

function score(value: number | null | undefined, digits = 3) {
  if (value === null || value === undefined) return "n/a";
  return value.toFixed(digits);
}

function authors(source: Source) {
  if (!source.authors?.length) return "Unknown authors";
  return source.authors.slice(0, 3).join(", ");
}

function doiUrl(doi: string) {
  const clean = doi.replace(/^https?:\/\/doi\.org\//, "");
  return `https://doi.org/${clean}`;
}

export function SourcePanel({ sources, chunks }: SourcePanelProps) {
  const sourceCount = sources.length || chunks.length;

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[26px] border border-white/65 bg-white/62 shadow-soft backdrop-blur-xl">
      <div className="border-b border-white/70 p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-ink">Evidence</h2>
            <p className="mt-1 text-xs leading-relaxed text-graphite/75">
              {sourceCount ? `${sourceCount} retrieved passages` : "Sources appear after a question"}
            </p>
          </div>
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <Layers size={22} aria-hidden />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-5 pb-2 pt-4">
        <BookOpen size={18} className="text-primary" aria-hidden />
        <h2 className="text-sm font-semibold text-ink">Retrieved Papers</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {chunks.length === 0 && sources.length === 0 ? (
          <div className="mx-2 rounded-3xl bg-white/50 p-5 text-sm leading-relaxed text-graphite/80">
            Ask a question and this panel will show the passages used to support the answer.
          </div>
        ) : (
          <div className="space-y-2">
            {(chunks.length ? chunks : sources).map((source, index) => (
              <details
                className="group rounded-3xl bg-white/46 px-1 open:bg-white/85 open:shadow-soft"
                key={`${source.chunk_id}-${index}`}
                open={index < 2}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-primary">
                      <FileText size={14} aria-hidden />
                      Source {index + 1}
                    </div>
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
                      {source.title || source.document_id || "Untitled paper"}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-graphite/75">{authors(source)}</p>
                  </div>
                  <ChevronDown
                    size={18}
                    className="mt-1 shrink-0 text-graphite/70 transition group-open:rotate-180"
                    aria-hidden
                  />
                </summary>

                <div className="space-y-3 px-3 pb-3 pt-1">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="badge badge-outline rounded-full gap-1">
                      <Hash size={12} aria-hidden />
                      {source.heading || source.section_type || "section"}
                    </span>
                    {source.distance !== null && (
                      <span className="badge badge-outline rounded-full">
                        distance {score(source.distance)}
                      </span>
                    )}
                    {source.rerank_score !== null && (
                      <span className="badge badge-primary badge-outline rounded-full">
                        score {score(source.rerank_score, 4)}
                      </span>
                    )}
                  </div>

                  {"text" in source && typeof source.text === "string" && source.text && (
                    <p className="max-h-44 overflow-y-auto rounded-2xl bg-skywash/45 p-3 text-sm leading-relaxed text-ink">
                      {source.text}
                    </p>
                  )}

                  {source.doi && (
                    <a
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent"
                      href={doiUrl(source.doi)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      DOI <ExternalLink size={12} aria-hidden />
                    </a>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
