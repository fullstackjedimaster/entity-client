"use client";

import { useMemo, useState } from "react";
import EntityComponent from "@/components/EntityComponent";
import type { FormMetadata } from "@/hooks/useFormMetadata";

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

const LOCAL_EMPLOYEE_METADATA: FormMetadata = {
    entityName: "employee",
    schema: "demo",
    table: "employee",
    primaryKey: "id",
    fields: [
        { name: "first_name", label: "First Name", type: "string", required: true },
        { name: "last_name", label: "Last Name", type: "string", required: true },
        { name: "employee_number", label: "Employee Number", type: "string" },
        { name: "age", label: "Age", type: "number" },
        { name: "start_date", label: "Start Date", type: "string" },
        { name: "is_active", label: "Active Employee", type: "boolean" },
        { name: "addresses", label: "Addresses", type: "array" },
    ],
};

type DemoDocument = {
    employee: Record<string, unknown>;
};

function parseDemoJson(text: string): DemoDocument {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error('The root must be an object containing an "employee" object.');
    }

    const employee = (parsed as Record<string, unknown>).employee;
    if (!employee || typeof employee !== "object" || Array.isArray(employee)) {
        throw new Error('The JSON must contain an "employee" object.');
    }

    return { employee: employee as Record<string, unknown> };
}

export default function EntityDemoPage() {
    const [jsonText, setJsonText] = useState(DEFAULT_JSON);
    const [renderedJson, setRenderedJson] = useState<DemoDocument>(() => parseDemoJson(DEFAULT_JSON));
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null);

    const template = useMemo(() => renderedJson.employee, [renderedJson]);

    function renderForm() {
        try {
            setRenderedJson(parseDemoJson(jsonText));
            setError(null);
            setSubmitted(null);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Invalid JSON.");
        }
    }

    return (
        <main className="page-shell">
            <header className="hero">
                <p className="eyebrow">Dynamic Form Engine Demo</p>
                <p>
                    Enter JSON that defines an entity and the engine renders its CRUD form with datatype-driven elements including 1-to-many subforms for nested JSON columns.
                </p>
            </header>

            <div className="demo-grid">
                <section className="panel editor-panel">
                    <div className="panel-heading">
                        <div>
                            <p className="eyebrow">Enter JSON for an entity:</p>

                        </div>

                    </div>

                    <label className="form-field" htmlFor="entity-json">
                        <textarea
                            id="entity-json"
                            value={jsonText}
                            onChange={(event) => setJsonText(event.target.value)}
                            spellCheck={false}
                        />
                    </label>

                    {error ? <p className="form-error">{error}</p> : null}

                    <button className="button button-primary" type="button" onClick={renderForm}>
                        Render Form
                    </button>
                </section>

                <section className="panel">
                    <EntityComponent
                        entity="employee"
                        metadataOverride={LOCAL_EMPLOYEE_METADATA}
                        templateOverride={template}
                        submitLabel="Preview Submission"
                        onSubmitOverride={async (values) => setSubmitted(values)}
                    />

                    {submitted ? (
                        <div className="submission-preview">
                            <p className="eyebrow">Latest submission</p>
                            <pre>{JSON.stringify(submitted, null, 2)}</pre>
                        </div>
                    ) : null}
                </section>
            </div>
        </main>
    );
}
