"use client";

import { useEffect } from "react";

import type {
    Attrs,
    TargetSelectedMessage,
} from "@/lib/dock/messages";

export type SelectedTarget = {
    id: string;
    attrs: Attrs;
    source: string;
};

declare global {
    interface Window {
        __FSJ_RAG_SELECTED_TARGET__?:
            TargetSelectedMessage;
    }
}

export function createTargetSelectedMessage(
    target: SelectedTarget,
): TargetSelectedMessage {
    return {
        type: "TARGET_SELECTED",
        id: target.id,
        attrs: target.attrs,
        source: target.source,
    };
}

export function broadcastSelectedTarget(
    target: SelectedTarget,
): void {
    const message =
        createTargetSelectedMessage(target);

    /*
     * Retain the latest selection in the host window.
     *
     * The Modular RAG loader may initialize after the page publishes its
     * first target. Keeping the value here lets the loader recover and replay
     * that target as soon as the assistant iframe is ready.
     */
    window.__FSJ_RAG_SELECTED_TARGET__ = message;

    window.postMessage(
        message,
        window.location.origin,
    );
}

export function useBroadcastSelectedTarget(
    target: SelectedTarget,
): void {
    useEffect(() => {
        broadcastSelectedTarget(target);
    }, [target]);
}
