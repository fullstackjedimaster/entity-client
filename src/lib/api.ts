// src/lib/api.ts
import { settings } from "@/lib/settings";

declare global {
    interface Window {
        /**
         * Host app (ec-control / parent iframe) can set this once:
         *   window.__ENTITY_CORE_JWT__ = "<signed HS256 JWT>";
         *
         * ec-view will automatically send it as Authorization: Bearer <token>.
         */
        __ENTITY_CORE_JWT__?: string | null;
    }
}

/**
 * Frontend-level representation of an entity operation.
 * This will be translated into the backend's RequestEnvelope and POSTed
 * to /manage on ec-model.
 */
export interface EntityRequest {
    operation: string;                         // "create" | "read" | "update" | "delete" | "select" | ...
    entity_type: string;                       // e.g. "employee"
    id?: string | null;                        // primary key if applicable
    data?: Record<string, unknown>;            // payload for create/update
    options?: Record<string, unknown>;         // extra filters, pagination, etc.
}

/**
 * Normalized response contract that ec-view exposes to hooks/components.
 * Internally we adapt the backend's RequestResult shape into this.
 */
export interface EntityResponse {
    success: boolean;
    data?: unknown;
    message?: string;
    // Allow additional metadata if you decide to add it later.
    [key: string]: unknown;
}

// -----------------------------------------------------------------------------
// Token resolution
// -----------------------------------------------------------------------------

/**
 * Read the JWT that the host app injects into the global namespace.
 * This is set by the embed page or container app.
 */
function getGlobalJwt(): string | null {
    if (typeof window === "undefined") return null;
    const t = window.__ENTITY_CORE_JWT__;
    if (!t) return null;
    const trimmed = String(t).trim();
    return trimmed.length ? trimmed : null;
}

/**
 * Resolve the token we will actually send.
 *
 * Priority:
 *  1) Explicit override passed to apiFetchRaw / callManageEntity
 *  2) window.__ENTITY_CORE_JWT__
 *  3) settings.DEFAULT_JWT (dev-only)
 */
function resolveJwt(override?: string | null): string | null {
    if (override && override.trim()) {
        return override.trim();
    }
    const globalToken = getGlobalJwt();
    if (globalToken) {
        return globalToken;
    }
    if (settings.DEFAULT_JWT && settings.DEFAULT_JWT.trim()) {
        return settings.DEFAULT_JWT.trim();
    }
    return null;
}

// -----------------------------------------------------------------------------
// Low-level fetch helper
// -----------------------------------------------------------------------------

/**
 * Low-level fetch helper that talks to the ec-model (or proxy) server.
 *
 * - Prefixes all paths with settings.API_BASE_URL
 * - Adds Authorization: Bearer <token> if available via resolveJwt()
 * - Leaves JWT *validation* to the backend (shared HS256 secret).
 */
export async function apiFetchRaw(
    path: string,
    init: RequestInit = {},
    tokenOverride?: string | null,
): Promise<Response> {
    const base = settings.API_BASE_URL.replace(/\/+$/, "");
    const rel = path.startsWith("/") ? path : `/${path}`;
    const url = `${base}${rel}`;

    const headers = new Headers(init.headers || {});
    const token = resolveJwt(tokenOverride);

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    // If body is present and no Content-Type is set, default to JSON.
    if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const finalInit: RequestInit = {
        ...init,
        headers,
    };

    return fetch(url, finalInit);
}

// -----------------------------------------------------------------------------
// High-level manage_entity wrapper
// -----------------------------------------------------------------------------

/**
 * Call the unified /manage endpoint on ec-model.
 *
 * On the backend, /manage expects a RequestEnvelope:
 *   {
 *     "operation": "create" | "read" | "update" | "delete" | "select" | "execute",
 *     "target": "<entity or action name>",
 *     "id": "<row id or correlation id>",
 *     "args": { ... }
 *   }
 *
 * The backend responds with RequestResult:
 *   { "ok": true/false, "message"?: string, "result"?: any }
 *
 * We normalize this into EntityResponse for the UI.
 */
export async function callManageEntity(
    req: EntityRequest,
    tokenOverride?: string | null,
): Promise<EntityResponse> {
    const envelope = {
        operation: req.operation,
        target: req.entity_type,
        id: req.id ?? null,
        args: {
            ...(req.data || {}),
            ...(req.options || {}),
        },
    };

    const resp = await apiFetchRaw(
        "/manage",
        {
            method: "POST",
            body: JSON.stringify(envelope),
        },
        tokenOverride,
    );

    // Try to extract some error context
    if (!resp.ok) {
        let extra = "";
        try {
            const text = await resp.text();
            if (text) extra = ` - ${text}`;
        } catch {
            // ignore
        }
        throw new Error(
            `manage_entity failed: ${resp.status} ${resp.statusText}${extra}`,
        );
    }

    // Expected backend shape: { ok: boolean, message?: string, result?: any }
    const body = (await resp.json()) as {
        ok: boolean;
        message?: string;
        result?: unknown;
        [key: string]: unknown;
    };

    return {
        success: !!body.ok,
        data: body.result,
        message: body.message,
        ...body,
    };
}
