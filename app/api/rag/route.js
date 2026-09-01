// EmpowerMSME — RAG Pipeline Status & Health Check Endpoint
// GET /api/rag — Returns pipeline status, model info, and initialization state

import { getRAGStatus, isRAGAvailable } from "@/lib/rag-pipeline"

export async function GET() {
  const status = getRAGStatus()
  return Response.json({
    service: "EmpowerMSME Agentic RAG Pipeline",
    version: "2.0.0",
    stack: {
      framework: "LangChain (LCEL — LangChain Expression Language)",
      llm: "Google Gemini 1.5 Pro",
      embeddingModel: "Google text-embedding-004 (768 dimensions)",
      vectorStore: "MemoryVectorStore (cosine similarity)",
      retrieval: "Top-K semantic similarity search (k=3)",
    },
    status,
    ready: isRAGAvailable() && status.initialized,
    message: isRAGAvailable()
      ? "RAG pipeline is configured and ready for semantic search + generation."
      : "GEMINI_API_KEY not set. Running in keyword-fallback mode. Add your key to .env to enable full RAG.",
  })
}
