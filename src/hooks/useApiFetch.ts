"use client";

import { useCallback } from "react";
import { apiFetchRaw } from "@/lib/api";

export function useApiFetch() {
    const apiFetch = useCallback(
        (path: string, options: RequestInit = {}): Promise<Response> =>
            apiFetchRaw(path, options),
        [],
    );

    return { apiFetch };
}
