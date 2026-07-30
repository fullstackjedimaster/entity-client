"use client";

import { useState } from "react";
import { useApiFetch } from "@/hooks/useApiFetch";

interface UseSaveEntityConfig {
    entityName: string;
    primaryKey: string;
}

export interface SaveResult {
    success: boolean;
    data?: unknown;
    message?: string;
    [key: string]: unknown;
}

export function useSaveEntity({ entityName, primaryKey }: UseSaveEntityConfig) {
    const { apiFetch } = useApiFetch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SaveResult | null>(null);

    async function save(data: Record<string, unknown>): Promise<SaveResult> {
        setLoading(true);
        setError(null);

        try {
            const id = data[primaryKey] ?? null;
            const operation = id ? "update" : "create";
            const response = await apiFetch("/manage", {
                method: "POST",
                body: JSON.stringify({
                    operation,
                    target: entityName,
                    id,
                    args: data,
                }),
            });

            if (!response.ok) {
                const detail = await response.text().catch(() => "");
                throw new Error(
                    `Save failed: ${response.status} ${response.statusText}${detail ? ` — ${detail}` : ""}`,
                );
            }

            const body = (await response.json()) as Record<string, unknown>;
            const normalized: SaveResult = {
                ...body,
                success: Boolean(body.success ?? body.ok),
                data: body.data ?? body.result,
                message: typeof body.message === "string" ? body.message : undefined,
            };
            setResult(normalized);
            return normalized;
        } catch (caught) {
            const message = caught instanceof Error ? caught.message : "Unknown save error";
            setError(message);
            throw caught;
        } finally {
            setLoading(false);
        }
    }

    return { save, loading, error, result };
}
