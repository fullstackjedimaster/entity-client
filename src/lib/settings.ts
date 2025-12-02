// /src/lib/settings.ts
// Lightweight, Auth0-free config for ec-view.
// The host app (ec-control or any other controller) is responsible for
// issuing a valid HS256 JWT and setting API base URL via env.

export interface AppSettings {
    /**
     * Base URL for the ec-model (or proxy) backend.
     * Example: "https://ec-model.fullstackjedi.dev" or "http://localhost:8000"
     */
    API_BASE_URL: string;

    /**
     * Optional default JWT for local/dev usage.
     * In production, the host app should set window.__ENTITY_CORE_JWT__
     * and/or inject a token via props/context instead.
     */
    DEFAULT_JWT: string | null;
}

// -----------------------------------------------------------------------------
// Settings
// -----------------------------------------------------------------------------

export const settings: AppSettings = {
    // Prefer a dedicated ec-model env var, but fall back to the older name.
    API_BASE_URL:
        process.env.NEXT_PUBLIC_EC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:8000",

    // Optional dev-only static token; for production, rely on the host app.
    DEFAULT_JWT:
        process.env.NEXT_PUBLIC_EC_DEFAULT_JWT !== undefined
            ? process.env.NEXT_PUBLIC_EC_DEFAULT_JWT || null
            : null,
};

// Optional one-line export for convenience in imports
export default settings;
