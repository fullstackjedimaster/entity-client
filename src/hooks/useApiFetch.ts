// src/hooks/useApiFetch.ts
import { apiFetchRaw } from "@/lib/api";

/**
 * React-safe wrapper that delegates to apiFetchRaw.
 * No AuthContext here — JWT comes from window.__ENTITY_CORE_JWT__.
 */
export function useApiFetch() {
    const call = async (
        path: string,
        options: RequestInit = {}
    ): Promise<Response> => {
        return apiFetchRaw(path, options);
    };

    return { apiFetch: call };
}
