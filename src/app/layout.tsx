import "@/app/globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import EmbedHeightReporter from "@/components/EmbedHeightReporter";
import EmbedTokenListener from "@/components/EmbedTokenListener";
import { settings } from "@/lib/settings";

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
                    <div id="rag-dock" />
                </div>

                <script
                    src={settings.DOCK_SCRIPT_URL}
                    data-target="#rag-dock"
                    data-app={settings.HOST_APP_ID}
                    data-density={settings.HOST_DENSITY}
                    defer
                />

                <EmbedHeightReporter />
            </body>
        </html>
    );
}
