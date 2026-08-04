"use client";

import { useEffect, useMemo, useState } from "react";

import EntityComponent from "@/components/EntityComponent";
import type { FormMetadata } from "@/hooks/useFormMetadata";
import { broadcastSelectedTarget } from "@/lib/dock/selection";
import { settings } from "@/lib/settings";

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

type RenderedEntity = {
    name: string;
    template: Record<string, unknown>;
    metadata: FormMetadata;
};

function title(name: string): string {
    return name
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) =>
            character.toUpperCase(),
        );
}

function fieldType(
    value: unknown,
): "string" | "number" | "boolean" | "array" {
    if (Array.isArray(value)) return "array";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    return "string";
}

function parseEntity(text: string): RenderedEntity {
    let parsed: unknown;

    try {
        parsed = JSON.parse(text);
    } catch (error: unknown) {
        throw new Error(
            error instanceof SyntaxError
                ? `Invalid JSON: ${error.message}`
                : "Invalid JSON.",
        );
    }

    if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
    ) {
        throw new Error("The JSON root must be an object.");
    }

    const entries = Object.entries(
        parsed as Record<string, unknown>,
    );

    if (!entries.length) {
        throw new Error(
            "The JSON root must contain at least one entity object.",
        );
    }

    const [name, value] = entries[0];

    if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
    ) {
        throw new Error(
            `The “${name}” value must be an object.`,
        );
    }

    const template = value as Record<string, unknown>;

    return {
        name,
        template,
        metadata: {
            entityName: name,
            schema: "demo",
            table: name,
            primaryKey: "id",
            fields: Object.entries(template).map(
                ([key, fieldValue]) => ({
                    name: key,
                    label: title(key),
                    type: fieldType(fieldValue),
                }),
            ),
        },
    };
}

function tryParseEntity(
    text: string,
): RenderedEntity | null {
    try {
        return parseEntity(text);
    } catch {
        return null;
    }
}

export default function EntityDemoPage() {
    const [jsonText, setJsonText] =
        useState(DEFAULT_JSON);
    const [rendered, setRendered] =
        useState<RenderedEntity | null>(null);
    const [error, setError] =
        useState<string | null>(null);
    const [submitted, setSubmitted] =
        useState<Record<string, unknown> | null>(null);

    const previewEntity = useMemo(
        () => tryParseEntity(jsonText),
        [jsonText],
    );

    const entity = rendered?.name ?? "";

    /*
     * Publish useful context immediately, before Render Form is clicked.
     *
     * This gives Modular RAG a valid target on first attachment while the
     * right-hand panel still correctly remains in its empty state.
     */
    useEffect(() => {
        if (!previewEntity) return;

        broadcastSelectedTarget({
            id: previewEntity.name,
            source: settings.HOST_APP_ID,
            attrs: {
                entity: previewEntity.name,
                schema:
                    previewEntity.metadata.schema ?? "demo",
                primaryKey:
                    previewEntity.metadata.primaryKey ?? "id",
                fieldCount:
                    previewEntity.metadata.fields.length,
                formRendered: false,
                formData: JSON.stringify(
                    previewEntity.template,
                ),
                jsonDefinition: jsonText,
            },
        });
    }, [jsonText, previewEntity]);

    function renderForm(): void {
        try {
            const next = parseEntity(jsonText);
            setRendered(next);
            setError(null);
            setSubmitted(null);
        } catch (caught: unknown) {
            setRendered(null);
            setSubmitted(null);
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Invalid JSON.",
            );
        }
    }

    return (
        <main className="page-shell">
            <div className="demo-grid">
                <section className="panel editor-panel">
                    <p className="eyebrow">
                        Entity JSON:
                    </p>

                    <label
                        className="form-field"
                        htmlFor="entity-json"
                    >
                        <textarea
                            id="entity-json"
                            value={jsonText}
                            onChange={(event) => {
                                setJsonText(
                                    event.target.value,
                                );
                                setRendered(null);
                                setSubmitted(null);
                                setError(null);
                            }}
                            spellCheck={false}
                        />
                    </label>

                    {error ? (
                        <p className="form-error">
                            {error}
                        </p>
                    ) : null}

                    <button
                        className="button button-primary"
                        type="button"
                        onClick={renderForm}
                    >
                        Render Form
                    </button>
                </section>

                <section className="panel">
                    {rendered ? (
                        <>
                            <EntityComponent
                                entity={entity}
                                metadataOverride={
                                    rendered.metadata
                                }
                                templateOverride={
                                    rendered.template
                                }
                                submitLabel="Preview Submission"
                                onSubmitOverride={async (
                                    values,
                                ) =>
                                    setSubmitted(values)
                                }
                            />

                            {submitted ? (
                                <div className="submission-preview">
                                    <p className="eyebrow">
                                        Latest submission
                                    </p>
                                    <pre>
                                        {JSON.stringify(
                                            submitted,
                                            null,
                                            2,
                                        )}
                                    </pre>
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <div className="entity-state">
                            <strong>
                                No form rendered.
                            </strong>
                            <span>
                                Enter a top-level entity
                                object and click Render
                                Form.
                            </span>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
