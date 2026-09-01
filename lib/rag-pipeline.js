// EmpowerMSME — Agentic RAG Pipeline
// LangChain + Google Gemini 1.5 Pro + Custom In-Memory Vector Store
// Architecture: Embed documents → Cosine similarity retrieval → LLM generation

import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { RunnableSequence } from "@langchain/core/runnables"
import { knowledgeBase } from "./knowledge-base.js"

// ─── Singleton vector store ───────────────────────────────────────────────────
let embeddedDocs = null   // Array of { metadata, embedding }
let ragChain = null
let initPromise = null

// ─── Cosine similarity between two vectors ────────────────────────────────────
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10)
}

// ─── Get Gemini embeddings model (text-embedding-004) ────────────────────────
function getEmbeddingsModel() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    throw new Error("GEMINI_API_KEY is not configured. Add your key to .env")
  }
  return new GoogleGenerativeAIEmbeddings({
    apiKey,
    model: "text-embedding-004",  // 768-dimensional embeddings
  })
}

// ─── Get Gemini 1.5 Pro LLM ──────────────────────────────────────────────────
function getLLM() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    throw new Error("GEMINI_API_KEY is not configured")
  }
  return new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-1.5-pro",
    temperature: 0.3,
    maxOutputTokens: 1024,
  })
}

// ─── RAG system prompt ────────────────────────────────────────────────────────
const RAG_PROMPT = ChatPromptTemplate.fromTemplate(`
You are EmpowerMSME's expert financial advisor specializing in Indian MSME financing,
government schemes, credit assessment, and business growth strategies.

Use ONLY the following retrieved context to answer the question.
If the context doesn't contain enough information, say so and suggest related topics.

Retrieved Context:
{context}

User Question: {question}

Instructions:
- Answer in clear, structured markdown (bold, bullets, tables where helpful)
- Be specific and actionable — give real numbers, percentages, and steps
- If mentioning government schemes, include eligibility and how to apply
- End with 1-2 related follow-up topics the user might find useful
- Keep the tone professional yet accessible for small business owners

Answer:
`)

// ─── Build document corpus from knowledge base ────────────────────────────────
function buildCorpus() {
  return knowledgeBase.map((entry) => ({
    id: entry.id,
    topic: entry.topic,
    keywords: entry.keywords.join(", "),
    content: `Topic: ${entry.topic}\n\n${entry.answer}`,
    embedding: null,
  }))
}

// ─── Lazy initializer (runs once per server process) ─────────────────────────
async function initializeRAG() {
  if (embeddedDocs && ragChain) return { embeddedDocs, ragChain }
  if (initPromise) return initPromise

  initPromise = (async () => {
    console.log("[RAG] Initializing — embedding knowledge base with Gemini text-embedding-004...")
    const embeddings = getEmbeddingsModel()
    const corpus = buildCorpus()

    // Embed all documents in parallel
    const contents = corpus.map((doc) => doc.content)
    const vectors = await embeddings.embedDocuments(contents)

    embeddedDocs = corpus.map((doc, i) => ({
      ...doc,
      embedding: vectors[i],
    }))

    console.log(`[RAG] Vector store ready — ${embeddedDocs.length} documents embedded (768 dims each)`)

    // Build Gemini 1.5 Pro RAG chain via LangChain LCEL
    const llm = getLLM()
    ragChain = RunnableSequence.from([
      RAG_PROMPT,
      llm,
      new StringOutputParser(),
    ])

    console.log("[RAG] Gemini 1.5 Pro RAG chain ready")
    return { embeddedDocs, ragChain }
  })()

  return initPromise
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Perform semantic similarity search over the embedded knowledge base.
 * Uses cosine similarity between Gemini query embedding and stored document embeddings.
 */
export async function semanticSearch(query, k = 3) {
  const { embeddedDocs } = await initializeRAG()
  const embeddings = getEmbeddingsModel()

  // Embed the query
  const queryVector = await embeddings.embedQuery(query)

  // Compute cosine similarity for each document
  const scored = embeddedDocs.map((doc) => ({
    ...doc,
    score: cosineSimilarity(queryVector, doc.embedding),
  }))

  // Sort by similarity descending, return top-k
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, k).map(({ id, topic, keywords, score, content }) => ({
    id,
    topic,
    keywords,
    score: Math.round(score * 1000) / 1000,
    snippet: content.slice(0, 200) + "...",
  }))
}

/**
 * Full RAG pipeline: retrieve semantically relevant context → Gemini 1.5 Pro generates answer.
 */
export async function generateRAGAnswer(question) {
  const { ragChain } = await initializeRAG()

  // Step 1: Retrieve top-3 relevant docs
  const relevantDocs = await semanticSearch(question, 3)
  const context = relevantDocs
    .map((doc, i) => `--- Source ${i + 1}: ${doc.topic} ---\n${doc.snippet}`)
    .join("\n\n")

  // Step 2: Generate answer with Gemini 1.5 Pro using retrieved context
  const answer = await ragChain.invoke({ context, question })
  return { answer, sources: relevantDocs }
}

/**
 * Check if RAG pipeline is available (API key configured).
 */
export function isRAGAvailable() {
  const apiKey = process.env.GEMINI_API_KEY
  return !!(apiKey && apiKey !== "your-gemini-api-key-here")
}

/**
 * Get pipeline initialization and configuration status.
 */
export function getRAGStatus() {
  return {
    initialized: !!(embeddedDocs && ragChain),
    documentsEmbedded: embeddedDocs ? embeddedDocs.length : 0,
    llmModel: "gemini-1.5-pro",
    embeddingModel: "text-embedding-004",
    embeddingDimensions: 768,
    vectorStore: "Custom in-memory (cosine similarity)",
    retrieval: "Top-3 semantic similarity",
    framework: "LangChain LCEL (LangChain Expression Language)",
    available: isRAGAvailable(),
  }
}
