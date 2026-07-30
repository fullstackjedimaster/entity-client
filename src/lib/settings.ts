function required(name: string, value: string | undefined): string {
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export const settings = {
    API_BASE_URL:
        process.env.NEXT_PUBLIC_EC_API_BASE_URL ?? "/api",
    DEFAULT_JWT:
        process.env.NEXT_PUBLIC_EC_DEFAULT_JWT || null,
    RAG_DOCK_SCRIPT_URL: required(
        "NEXT_PUBLIC_RAG_DOCK_SCRIPT_URL",
        process.env.NEXT_PUBLIC_RAG_DOCK_SCRIPT_URL,
    ),
    HOST_APP_ID: required(
        "NEXT_PUBLIC_HOST_APP_ID",
        process.env.NEXT_PUBLIC_HOST_APP_ID,
    ),
    HOST_DENSITY: required(
        "NEXT_PUBLIC_HOST_DENSITY",
        process.env.NEXT_PUBLIC_HOST_DENSITY,
    ),
    EMBED_LOCK_ENABLED:
        process.env.NEXT_PUBLIC_EMBED_LOCK_ENABLED === "true",
} as const;

export default settings;
