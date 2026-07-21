export type Source = {
  chunk_id: string;
  document_id: string;
  title: string;
  authors: string[];
  doi: string;
  journal: string;
  publication_date: string;
  section_type: string;
  heading: string;
  chunk_index: number;
  distance: number | null;
  rerank_score: number | null;
};

export type RetrievedChunk = Source & {
  text: string;
};

export type ChatResponse = {
  answer: string;
  sources: Source[];
  llm_provider: string;
  llm_model: string;
  embedding_provider: string;
  embedding_model: string;
  reranker_provider: string;
  timings_ms: Record<string, number> | null;
};

export type SearchResponse = {
  chunks: RetrievedChunk[];
  embedding_provider: string;
  embedding_model: string;
  reranker_provider: string;
  timings_ms: Record<string, number> | null;
};

export type HealthResponse = {
  status: string;
  service: string;
  config: Record<string, string | number | boolean | null>;
};

export type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY || "";

function headers(): HeadersInit {
  const base: HeadersInit = { "Content-Type": "application/json" };
  if (BACKEND_API_KEY) {
    base["X-API-Key"] = BACKEND_API_KEY;
  }
  return base;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...headers(),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const payload = await response.json();
      detail = payload.detail || detail;
    } catch {
      // Keep HTTP status text when the backend response is not JSON.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export async function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/health");
}

export async function checkBackendReady(timeoutMs = 12000): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    await request<HealthResponse>("/api/health", { signal: controller.signal });
    return true;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function askQuestion(
  query: string,
  conversationHistory: ConversationTurn[] = [],
): Promise<ChatResponse> {
  return request<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ query, conversation_history: conversationHistory }),
  });
}

export async function searchChunks(
  query: string,
  conversationHistory: ConversationTurn[] = [],
): Promise<SearchResponse> {
  return request<SearchResponse>("/api/search", {
    method: "POST",
    body: JSON.stringify({ query, conversation_history: conversationHistory }),
  });
}
