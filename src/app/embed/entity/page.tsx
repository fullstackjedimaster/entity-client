// src/app/embed/entity/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EntityComponent from "@/components/EntityComponent/EntityComponent";
import { apiFetchRaw } from "@/lib/api";

interface ManageResultPayload {
    // This mirrors ec-model /manage → adapter.manage_entity -> {"result": <row or list>}
    result?: unknown;
}

interface ManageResponse {
    ok: boolean;
    result?: ManageResultPayload;
    message?: string;
}

/**
 * Iframe embed for ec-view:
 * - Query params: ?entity=employee&id=<uuid>&token=<jwt>&schema=<schema>
 * - OR waits for ENTITY_FORM_SET_TOKEN to set window.__ENTITY_CORE_JWT__
 * - If id is present, loads the row first, then renders EntityComponent in edit mode.
 * - If no id, renders EntityComponent in create mode.
 */
export default function EmbedEntityPage() {
    const searchParams = useSearchParams();

    const entity = searchParams.get("entity") ?? "";
    const id = searchParams.get("id") ?? "";

    const qsToken = searchParams.get("token");
    const qsSchema = searchParams.get("schema");

    const [tokenReceived, setTokenReceived] = useState(false);
    const [initialValues, setInitialValues] = useState<Record<string, unknown> | null>(null);
    const [loadingRow, setLoadingRow] = useState(false);
    const [rowError, setRowError] = useState<string | null>(null);

    // ---------------------------------------------------------------------
    // 1) Announce to host that we are ready
    // ---------------------------------------------------------------------
    useEffect(() => {
        if (typeof window === "undefined") return;

        const t = setTimeout(() => {
            window.parent.postMessage({ type: "ENTITY_FORM_EMBED_READY" }, "*");
        }, 0);

        return () => clearTimeout(t);
    }, []);

    // ---------------------------------------------------------------------
    // 2) If token/schema are provided via querystring, use them
    // ---------------------------------------------------------------------
    useEffect(() => {
        if (typeof window === "undefined") return;

        if (qsToken && qsToken.trim()) {
            window.__ENTITY_CORE_JWT__ = qsToken.trim();
            if (qsSchema && qsSchema.trim()) {
                (window as any).__ENTITY_CORE_SCHEMA__ = qsSchema.trim();
            }
            setTokenReceived(true);
        }
    }, [qsToken, qsSchema]);

    // ---------------------------------------------------------------------
    // 3) Listen for ENTITY_FORM_SET_TOKEN from host app
    // ---------------------------------------------------------------------
    useEffect(() => {
        if (typeof window === "undefined") return;

        function handleMessage(event: MessageEvent) {
            const data = event.data as { type?: string; token?: string; schema?: string } | null;

            if (!data || data.type !== "ENTITY_FORM_SET_TOKEN") {
                return;
            }

            if (typeof data.token !== "string" || !data.token) {
                console.warn("[embed/entity] Received ENTITY_FORM_SET_TOKEN without token");
                return;
            }

            const token = data.token.trim();
            if (!token) {
                console.warn("[embed/entity] Received empty token in ENTITY_FORM_SET_TOKEN");
                return;
            }

            // Stash JWT globally so apiFetchRaw can attach it
            window.__ENTITY_CORE_JWT__ = token;

            if (typeof data.schema === "string" && data.schema.trim()) {
                (window as any).__ENTITY_CORE_SCHEMA__ = data.schema.trim();
            }

            setTokenReceived(true);
        }

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    // ---------------------------------------------------------------------
    // 4) If we have an id (edit mode) and a token, load the existing row
    // ---------------------------------------------------------------------
    useEffect(() => {
        if (!entity || !id) return;
        if (!tokenReceived) return;

        let cancelled = false;

        (async () => {
            setLoadingRow(true);
            setRowError(null);

            try {
                const resp = await apiFetchRaw("/manage", {
                    method: "POST",
                    body: JSON.stringify({
                        operation: "read",
                        target: entity,
                        id,
                        args: {},
                        meta: { source: "embed/entity" },
                    }),
                });

                if (!resp.ok) {
                    const text = await resp.text();
                    throw new Error(
                        `manage read failed: ${resp.status} ${resp.statusText}${
                            text ? ` - ${text}` : ""
                        }`,
                    );
                }

                const json = (await resp.json()) as ManageResponse;

                if (!json.ok) {
                    throw new Error(json.message || "manage returned !ok");
                }

                const inner = json.result ?? {};
                const row = (inner.result ?? null) as Record<string, unknown> | null;

                if (!cancelled) {
                    setInitialValues(row);
                }
            } catch (err: unknown) {
                console.error("[embed/entity] Failed to load row:", err);
                if (!cancelled) {
                    setRowError(
                        err instanceof Error ? err.message : "Unknown error loading entity",
                    );
                    setInitialValues(null);
                }
            } finally {
                if (!cancelled) {
                    setLoadingRow(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [entity, id, tokenReceived]);

    // ---------------------------------------------------------------------
    // 5) Render
    // ---------------------------------------------------------------------

    if (!entity) {
        return (
            <div className="p-4 text-sm">
                <h1 className="text-lg font-semibold mb-2">Entity form</h1>
                <p className="text-gray-600">
                    Missing <code>entity</code> query parameter.
                </p>
            </div>
        );
    }

    if (!tokenReceived) {
        return (
            <div className="p-4 text-sm">
                <h1 className="text-lg font-semibold mb-2">Entity form</h1>
                <p className="text-gray-600">
                    Waiting for authentication from host application…
                </p>
            </div>
        );
    }

    if (id && loadingRow) {
        return (
            <div className="p-4 text-sm">
                <h1 className="text-lg font-semibold mb-2">Edit {entity}</h1>
                <p className="text-gray-600">Loading existing record…</p>
            </div>
        );
    }

    if (id && rowError) {
        return (
            <div className="p-4 text-sm">
                <h1 className="text-lg font-semibold mb-2">Edit {entity}</h1>
                <p className="text-red-600 mb-2">
                    Could not load existing record: {rowError}
                </p>
                <p className="text-gray-600">
                    Please retry from the host application or contact support.
                </p>
            </div>
        );
    }

    const effectiveInitial =
        id && initialValues && Object.keys(initialValues).length > 0
            ? initialValues
            : null;

    return (
        <div className="p-4">
            <EntityComponent entity={entity} initialValues={effectiveInitial ?? undefined} />
        </div>
    );
}
