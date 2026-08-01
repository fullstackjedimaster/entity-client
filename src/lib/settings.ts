function required(name: string, value: string | undefined): string {
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export const settings = {
    API_BASE_URL:
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
    DEFAULT_JWT:
        process.env.NEXT_PUBLIC_DEFAULT_JWT || null,
    DOCK_SCRIPT_URL:
        'https://rag.fullstackjedi.dev/dock-host.js',

    HOST_APP_ID:
        'entity-client',

    HOST_DENSITY:
        'compact',

    EMBED_LOCK_ENABLED:
        process.env.NEXT_PUBLIC_EMBED_LOCK_ENABLED,
} as const;

export default settings;
