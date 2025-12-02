// src/hooks/useAuthInfo.ts
"use client";

import { useEffect, useState } from "react";

export type AuthInfo = {
    schema: string | null;
    roles: string[];
    permissions: string[];
    claims: Record<string, unknown> | null;
    isReadOnly: boolean;
    canEdit: boolean;
    canDelete: boolean;
};

/**
 * Base64URL → JSON decoder for JWT payloads.
 * We don't verify the signature here; that's the backend's job.
 * This is strictly for UI convenience (showing roles, schema, etc.).
 */
function decodeJwt(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const padLen = (4 - (payload.length % 4)) % 4;
        const padded = payload + "=".repeat(padLen);

        const binary =
            typeof atob === "function"
                ? atob(padded)
                : Buffer.from(padded, "base64").toString("binary");

        const json = decodeURIComponent(
            Array.from(binary)
                .map((c) =>
                    "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
                )
                .join(""),
        );

        return JSON.parse(json) as Record<string, unknown>;
    } catch {
        return null;
    }
}

const DEFAULT_AUTH: AuthInfo = {
    schema: null,
    roles: [],
    permissions: [],
    claims: null,
    isReadOnly: true,
    canEdit: false,
    canDelete: false,
};

/**
 * Reads the same HS256 JWT ec-model is using (via window.__ENTITY_CORE_JWT__),
 * decodes it, and exposes schema/roles/permissions plus some convenience flags.
 *
 * Important: this is *not* a security boundary; it's purely for UI logic.
 * The real enforcement happens on ec-model using require_jwt().
 */
export function useAuthInfo(): AuthInfo {
    const [auth, setAuth] = useState<AuthInfo>(DEFAULT_AUTH);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const token = (window.__ENTITY_CORE_JWT__ || "").trim();
        if (!token) {
            setAuth(DEFAULT_AUTH);
            return;
        }

        const decoded = decodeJwt(token) || {};
        const claims = decoded as Record<string, unknown>;

        const schema =
            (claims["schema"] as string | undefined) ||
            (claims["org_id"] as string | undefined) ||
            (claims["https://fullstackjedi.dev/schema"] as string | undefined) ||
            null;

        const roles =
            (Array.isArray(claims["roles"])
                    ? (claims["roles"] as unknown[])
                    : []
            ).filter((r) => typeof r === "string") as string[];

        const permissions =
            (Array.isArray(claims["permissions"])
                    ? (claims["permissions"] as unknown[])
                    : []
            ).filter((p) => typeof p === "string") as string[];

        const canEdit =
            permissions.includes("crud:write") ||
            permissions.includes("crud:update") ||
            permissions.includes("crud:create");

        const canDelete =
            permissions.includes("crud:delete") ||
            permissions.includes("crud:write");

        const isReadOnly = !canEdit && !canDelete;

        setAuth({
            schema,
            roles,
            permissions,
            claims,
            isReadOnly,
            canEdit,
            canDelete,
        });
    }, []);

    return auth;
}
