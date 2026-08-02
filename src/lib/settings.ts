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
} as const;

export default settings;
