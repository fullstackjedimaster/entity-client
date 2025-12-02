// src/hooks/useOptions.ts
"use client";
import useSWR from "swr";
import { useApiFetch } from "@/hooks/useApiFetch";

export type OptionItem = { value: string | number; label: string };

/**
 * useOptions(entity, valueCol, labelCol, filter)
 *  - entity: backend entity name (e.g. "employee")
 *  - valueCol: column used as <option value>
 *  - labelCol: column used as <option label>
 *  - filter: key/value pairs passed as query params for server-side filtering
 */
export function useOptions(
    entity: string,
    valueCol: string = "id",
    labelCol: string = "name",
    filter: Record<string, string | number | null | undefined> = {}
) {
    const { apiFetch } = useApiFetch();

    const params = new URLSearchParams();
    params.set("entity", entity);
    params.set("value_col", valueCol);
    params.set("label_col", labelCol);

    for (const [k, v] of Object.entries(filter)) {
        if (v !== undefined && v !== null && v !== "") {
            params.append(k, String(v));
        }
    }

    const url = `/api/options?${params.toString()}`;

    const fetcher = async (url: string): Promise<OptionItem[]> => {
        const res = await apiFetch(url);
        if (!res.ok) {
            throw new Error(`Failed to load options: ${res.status} ${res.statusText}`);
        }
        return res.json();
    };

    const { data, error, isLoading, mutate } = useSWR<OptionItem[]>(url, fetcher);

    return {
        options: data || [],
        isLoading,
        error,
        refresh: mutate,
    };
}
