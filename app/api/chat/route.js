// EmpowerMSME — Knowledge Academy Chat Microservice
// Powered by LangChain + Gemini 1.5 Pro RAG Pipeline
// Architecture: User Query → Gemini Embeddings → Cosine Similarity Retrieval → Gemini 1.5 Pro Generation

import { generateRAGAnswer, isRAGAvailable, getRAGStatus } from "@/lib/rag-pipeline"
import { searchKnowledgeBase } from "@/lib/knowledge-base"

export async function POST(request) {
  try {
    const { message } = await request.json()

    if (!message?.trim()) {
      return Response.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      )
    }

    // ── Path A: Full RAG pipeline (LangChain + Gemini 1.5 Pro) ──────────────
    if (isRAGAvailable()) {
      try {
        // Step 1: Semantic retrieval + Step 2: Gemini 1.5 Pro generation (one call)
        const { answer, sources } = await generateRAGAnswer(message)

        return Response.json({
          success: true,
          answer,
          mode: "rag",
          sources: sources.map((s) => ({
            topic: s.topic,
            relevanceScore: s.score,
          })),
          model: "gemini-1.5-pro",
          pipeline: "LangChain RAG (Gemini embeddings → cosine similarity → Gemini 1.5 Pro generation)",
        })
      } catch (ragError) {
        console.error("[RAG] Pipeline error, falling back to keyword search:", ragError.message)
        // Fall through to keyword fallback below
      }
    }

    // ── Path B: Keyword fallback (when GEMINI_API_KEY not configured) ────────
    const results = searchKnowledgeBase(message)

    if (results.length === 0) {
      return Response.json({
        success: true,
        answer: `I don't have specific information about "${message}" yet. However, I can help you with:\n\n• **MUDRA & PMEGP loans** — Government micro-loan schemes\n• **Udyam Registration** — MSME registration process\n• **GST for MSMEs** — Tax compliance guide\n• **Credit score improvement** — Step-by-step tips\n• **Revenue-Based Financing** — Flexible repayment models\n• **SIDBI schemes** — Development bank programs\n• **Working capital** — Cash flow management\n\nTry asking about any of these topics!`,
        topic: "General Help",
        confidence: 0,
        mode: "keyword_fallback",
      })
    }

    const best = results[0]
    return Response.json({
      success: true,
      answer: best.answer,
      topic: best.topic,
      confidence: Math.min(Math.round(best.score * 15), 98),
      relatedTopics: results.slice(1).map((r) => r.topic),
      mode: "keyword_fallback",
    })
  } catch (err) {
    console.error("[Chat API] Error:", err)
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}

// ── Health check endpoint ─────────────────────────────────────────────────────
export async function GET() {
  return Response.json({
    service: "EmpowerMSME Knowledge Academy Chat",
    version: "2.0.0",
    pipeline: "LangChain RAG with Gemini 1.5 Pro",
    ragStatus: getRAGStatus(),
    endpoints: {
      POST: "Send { message: string } to get an AI-generated answer",
    },
  })
}
