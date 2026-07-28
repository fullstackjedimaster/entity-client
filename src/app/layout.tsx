// ui-daq/src/app/layout.tsx
import "@/app/globals.css";

import type { ReactNode } from "react";

import DockHost from "@/components/dock/DockHost";
import EmbedHeightReporter from "@/components/EmbedHeightReporter";


type RootLayoutProps = {
    children: ReactNode;
};

export default function RootLayout({
    children,
}: RootLayoutProps) {
    return (
        <html lang="en">
            <body>
                    <DockHost />
                    <div id="entity-client-embed-content">

                        {children}

                    </div>

                    <EmbedHeightReporter />

            </body>
        </html>
    );
}