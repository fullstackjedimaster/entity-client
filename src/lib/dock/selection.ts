"use client";

import { useEffect } from "react";

import type { Attrs, TargetSelectedMessage } from "@/lib/dock/messages";

export type SelectedTarget = {
    id: string;
    attrs: Attrs;
    source: string;
};

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

export function broadcastSelectedTarget(target: SelectedTarget): void {
    window.postMessage(
        createTargetSelectedMessage(target),
        window.location.origin,
    );
}

export function useBroadcastSelectedTarget(target: SelectedTarget): void {
    useEffect(() => {
        broadcastSelectedTarget(target);
    }, [target]);
}
