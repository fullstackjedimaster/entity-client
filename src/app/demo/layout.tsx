import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Entity Client Demo",
    description: "Read-only Entity Client portfolio demonstration",
};

export default function DemoLayout({ children }: { children: ReactNode }) {
    return children;
}
