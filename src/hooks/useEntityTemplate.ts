"use client";

import { useEffect, useState } from "react";
import { useApiFetch } from "@/hooks/useApiFetch";

export interface EntityTemplateState {
    template: any | null;
    loading: boolean;
    error: string | null;
}

/**
 * useEntityTemplate(entityName)
 *  - fetches JSON template for a given entity from /api/template/{entity}
 *  - template is expected to be an object keyed by entity name
 */
export function useEntityTemplate(entityName?: string | null): EntityTemplateState {
    const { apiFetch } = useApiFetch();
    const [template, setTemplate] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(!!entityName);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!entityName) return;

        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await apiFetch(`/api/template/${entityName}`);
                if (!res.ok) {
                    throw new Error(`Failed to load template: ${res.status} ${res.statusText}`);
                }
                const data = await res.json();
                if (!cancelled) {
                    setTemplate(data);
                }
            } catch (e: any) {
                if (!cancelled) setError(e.message || "Unknown error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [entityName, apiFetch]);

    return { template, loading, error };
}
