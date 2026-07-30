"use client";

import useSWR from "swr";
import { useApiFetch } from "@/hooks/useApiFetch";

export type FieldMeta = {
    name: string;
    label?: string;
    type: string;
    required?: boolean;
    widget?: string;
};

export type FormMetadata = {
    entityName?: string;
    entity?: string;
    schema?: string;
    table?: string;
    primaryKey: string;
    fields: FieldMeta[];
};

export function useFormMetadata(entityName?: string) {
    const { apiFetch } = useApiFetch();

    const fetcher = async (url: string): Promise<FormMetadata> => {
        const response = await apiFetch(url);
        if (!response.ok) {
            const detail = await response.text().catch(() => "");
            throw new Error(
                `Failed to load form metadata: ${response.status} ${response.statusText}${detail ? ` — ${detail}` : ""}`,
            );
        }
        return response.json() as Promise<FormMetadata>;
    };

    const { data, error, isLoading, mutate } = useSWR<FormMetadata>(
        entityName ? `/entity/${encodeURIComponent(entityName)}/form_metadata` : null,
        fetcher,
    );

    return {
        metadata: data,
        isLoading,
        error: error instanceof Error ? error : null,
        refresh: mutate,
    };
}
