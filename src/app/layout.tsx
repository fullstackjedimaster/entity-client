import "@/app/globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import DockHost from "@/components/dock/DockHost";
import EmbedHeightReporter from "@/components/EmbedHeightReporter";
import EmbedTokenListener from "@/components/EmbedTokenListener";

export const metadata: Metadata = {
    title: "Entity Client Demo",
    description: "Dynamic entity forms with Modular RAG integration",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <EmbedTokenListener />
                <div id="entity-client-embed-content">
                    {children}
                    <DockHost />
                </div>
                <EmbedHeightReporter />
            </body>
        </html>
    );
}
