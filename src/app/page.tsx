"use client";

import EntityComponent from "@/components/EntityComponent";

export default function HomePage() {
    return (
        <main className="page-shell">
            <header className="hero">
                <p className="eyebrow">Entity Client</p>
                <h1>EntityCore Form</h1>
                <p>This view loads employee form metadata from the Entity Server through the same-origin API proxy.</p>
            </header>
            <section className="panel single-panel">
                <EntityComponent entity="employee" />
            </section>
        </main>
    );
}
