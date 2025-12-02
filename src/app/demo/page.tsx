// src/app/demo/page.tsx
"use client";

import React, { useState } from "react";
import EntityComponent from "@/components/EntityComponent/EntityComponent";
import EmbedHeightReporter from "@/components/EmbedHeightReporter";

const DEFAULT_JSON = `{
  "employee": {
    "first_name": "",
    "last_name": "",
    "employee_number": "",
    "age": 30,
    "start_date": "2024-01-01",
    "is_active": true,
    "addresses": [
      {
        "street": "",
        "city": "",
        "state": "",
        "zip": ""
      }
    ]
  }
}`;

// Minimal local metadata to give nicer labels and a primaryKey.
// This is NOT fetched from ec-model – it's just for the demo.
const LOCAL_EMPLOYEE_METADATA = {
    entity: "employee",
    schema: "demo",
    table: "employee",
    primaryKey: "id",
    fields: [
        { name: "first_name",      label: "First Name",      type: "string",  required: true },
        { name: "last_name",       label: "Last Name",       type: "string",  required: true },
        { name: "employee_number", label: "Employee Number", type: "string",  required: false },
        { name: "age",             label: "Age",             type: "number",  required: false },
        { name: "start_date",      label: "Start Date",      type: "string",  required: false },
        { name: "is_active",       label: "Is Active",       type: "boolean", required: false },
        { name: "addresses",       label: "Addresses",       type: "json",    required: false },
    ],
};

export default function EntityDemoPage() {
    const [jsonText, setJsonText] = useState<string>(DEFAULT_JSON);
    const [templateOverride, setTemplateOverride] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    function handleRenderClick() {
        setError(null);

        try {
            const parsed = JSON.parse(jsonText);

            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                throw new Error('Root JSON must be an object like { "employee": { ... } }.');
            }

            if (!parsed.employee || typeof parsed.employee !== "object") {
                throw new Error('Demo expects a top-level "employee" key with an object value.');
            }

            setTemplateOverride(parsed);
        } catch (e: any) {
            setError(e.message || "Invalid JSON");
            setTemplateOverride(null);
        }
    }

    async function handleSubmit(values: any) {
        // For this demo we just log the values; no server call to ec-model.
        // eslint-disable-next-line no-console
        console.log("EntityComponent demo submitted values:", values);
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 text-gray-800">
            {/* This reports height to the hosting portfolio iframe */}
            <EmbedHeightReporter />

            <div className="w-full max-w-5xl p-6 space-y-6">
                <h1 className="text-2xl font-bold">EntityComponent JSON Template Demo</h1>
                <p className="text-sm text-gray-600">
                    Edit the JSON template below and click <strong>Render Form</strong> to see the
                    real <code className="mx-1">EntityComponent</code> render a dynamic form for the
                    <strong> "employee"</strong> entity. This demo does not talk to{" "}
                    <code>ec-model</code>; it just uses the JSON and local metadata.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Left: JSON editor */}
                    <section className="flex flex-col h-full">
                        <h2 className="text-lg font-semibold mb-2">Template JSON</h2>
                        <textarea
                            className="flex-1 w-full border rounded p-2 font-mono text-xs min-h-[260px]"
                            value={jsonText}
                            onChange={(e) => setJsonText(e.target.value)}
                        />
                        {error && (
                            <p className="mt-2 text-xs text-red-600">
                                {error}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={handleRenderClick}
                            className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                        >
                            Render Form
                        </button>
                    </section>

                    {/* Right: actual EntityComponent driven by the JSON */}
                    <section className="border rounded p-4 bg-white shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Rendered EntityComponent</h2>
                        {templateOverride ? (
                            <EntityComponent
                                entity="employee"
                                templateOverride={templateOverride}
                                metadata={LOCAL_EMPLOYEE_METADATA}
                                onSubmit={handleSubmit}
                            />
                        ) : (
                            <p className="text-sm text-gray-500">
                                Enter JSON and click <strong>Render Form</strong> to see the form.
                            </p>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
