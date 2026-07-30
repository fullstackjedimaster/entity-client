// /src/lib/settings.ts


export const settings = {
  API_BASE_URL:
    process.env.NEXT_PUBLIC_EC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "/api",

  DEFAULT_JWT:
    process.env.NEXT_PUBLIC_EC_DEFAULT_JWT !== undefined
      ? process.env.NEXT_PUBLIC_EC_DEFAULT_JWT || null
      : null,

  RAG_CORE_BASE:
    process.env.NEXT_PUBLIC_RAG_CORE_BASE ||
     "https://ai-core.fullstackjedi.dev",

  RAG_API_BASE:
    process.env.NEXT_PUBLIC_RAG_API_BASE ||
     "https://rag.fullstackjedi.dev",


  RAG_CLIENT_NAME:
     process.env.NEXT_PUBLIC_RAG_CLIENT_NAME ||
      "entity-client",

  DOCK_ORIGIN:
     process.env.NEXT_PUBLIC_DOCK_ORIGIN ||
      "https://rag.fullstackjedi.dev",


  DOCK_FRAME_ID:
     process.env.NEXT_PUBLIC_DOCK_FRAME_ID ||
      "entity-client-dock",

  EMBED_LOCK_ENABLED:
      process.env.NEXT_PUBLIC_EMBED_LOCK_ENABLED === "true",
};

export default settings;
