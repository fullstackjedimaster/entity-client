// src/app/page.tsx
"use client";

import EntityComponent from "@/components/EntityComponent/EntityComponent";

export default function HomePage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 text-gray-800">
            <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-4">EntityCore View Demo</h1>
                <p className="mb-4 text-sm text-gray-600">
                    This page renders the generic{" "}
                    <code>EntityComponent</code> for the{" "}
                    <strong>"employee"</strong> entity. Adjust the entity name as
                    needed to try different forms against your ec-model backend.
                </p>
                <EntityComponent entity="employee" />
            </div>
        </main>
    );
}
