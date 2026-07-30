"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast, Toaster } from "sonner";

import { useFormMetadata, type FormMetadata } from "@/hooks/useFormMetadata";
import { useSaveEntity } from "@/hooks/useSaveEntity";
import { useAuthInfo } from "@/hooks/useAuthInfo";

type FormRecord = Record<string, unknown>;

type EntityComponentProps = {
    entity: string;
    metadataOverride?: FormMetadata;
    templateOverride?: FormRecord;
    onSubmitOverride?: (values: FormRecord) => void | Promise<void>;
    submitLabel?: string;
};

function cloneValue<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function humanize(value: string): string {
    return value
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function defaultValueForType(type: string): unknown {
    switch (type.toLowerCase()) {
        case "boolean":
        case "bool":
            return false;
        case "number":
        case "integer":
        case "int":
        case "float":
        case "decimal":
            return "";
        case "json":
        case "object":
            return {};
        case "array":
            return [];
        default:
            return "";
    }
}

function buildInitialValues(metadata: FormMetadata, template?: FormRecord): FormRecord {
    if (template) return cloneValue(template);

    return Object.fromEntries(
        metadata.fields.map((field) => [field.name, defaultValueForType(field.type)]),
    );
}

function getAtPath(root: unknown, path: Array<string | number>): unknown {
    return path.reduce<unknown>((current, part) => {
        if (current === null || current === undefined || typeof current !== "object") return undefined;
        return (current as Record<string | number, unknown>)[part];
    }, root);
}

function setAtPath(root: FormRecord, path: Array<string | number>, value: unknown): FormRecord {
    const copy = cloneValue(root);
    let cursor: Record<string | number, unknown> = copy;

    path.forEach((part, index) => {
        if (index === path.length - 1) {
            cursor[part] = value;
            return;
        }

        const nextPart = path[index + 1];
        const existing = cursor[part];
        if (existing === null || existing === undefined || typeof existing !== "object") {
            cursor[part] = typeof nextPart === "number" ? [] : {};
        }
        cursor = cursor[part] as Record<string | number, unknown>;
    });

    return copy;
}

export default function EntityComponent({
    entity,
    metadataOverride,
    templateOverride,
    onSubmitOverride,
    submitLabel = "Save Entity",
}: EntityComponentProps) {
    const remote = useFormMetadata(metadataOverride ? undefined : entity);
    const metadata = metadataOverride ?? remote.metadata;
    const { schema } = useAuthInfo();
    const [formValues, setFormValues] = useState<FormRecord>({});
    const [localSubmitting, setLocalSubmitting] = useState(false);

    const saver = useSaveEntity({
        entityName: entity,
        primaryKey: metadata?.primaryKey ?? "id",
    });

    const initialValues = useMemo(
        () => (metadata ? buildInitialValues(metadata, templateOverride) : null),
        [metadata, templateOverride],
    );

    useEffect(() => {
        if (initialValues) setFormValues(initialValues);
    }, [initialValues]);

    if (!metadataOverride && remote.isLoading) {
        return <div className="entity-state">Loading form schema…</div>;
    }

    if (!metadata) {
        return (
            <div className="entity-state entity-state-error">
                <strong>Unable to render the form.</strong>
                <span>{remote.error?.message ?? "No form metadata was returned."}</span>
            </div>
        );
    }

    const updateValue = (path: Array<string | number>, value: unknown) => {
        setFormValues((current) => setAtPath(current, path, value));
    };

    const renderValue = (
        key: string,
        templateValue: unknown,
        path: Array<string | number>,
        label?: string,
        required?: boolean,
    ): ReactNode => {
        const fullPath = [...path, key];
        const currentValue = getAtPath(formValues, fullPath);
        const fieldId = `field-${fullPath.join("-")}`;
        const displayLabel = label || humanize(key);

        if (Array.isArray(templateValue)) {
            const rowTemplate = templateValue[0] ?? {};
            const rows = Array.isArray(currentValue) ? currentValue : [];
            return (
                <fieldset className="entity-group" key={fieldId}>
                    <legend>{displayLabel}</legend>
                    <div className="array-list">
                        {rows.map((row, rowIndex) => (
                            <div className="array-row" key={`${fieldId}-${rowIndex}`}>
                                <div className="array-row-fields">
                                    {rowTemplate && typeof rowTemplate === "object"
                                        ? Object.entries(rowTemplate as FormRecord).map(([childKey, childValue]) =>
                                              renderValue(childKey, childValue, [...fullPath, rowIndex]),
                                          )
                                        : null}
                                </div>
                                <button
                                    type="button"
                                    className="button button-danger button-small"
                                    onClick={() => {
                                        const next = rows.filter((_, index) => index !== rowIndex);
                                        updateValue(fullPath, next);
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="button button-secondary button-small"
                        onClick={() => updateValue(fullPath, [...rows, cloneValue(rowTemplate)])}
                    >
                        Add {humanize(key).replace(/s$/, "")}
                    </button>
                </fieldset>
            );
        }

        if (templateValue !== null && typeof templateValue === "object") {
            return (
                <fieldset className="entity-group" key={fieldId}>
                    <legend>{displayLabel}</legend>
                    <div className="field-grid">
                        {Object.entries(templateValue as FormRecord).map(([childKey, childValue]) =>
                            renderValue(childKey, childValue, fullPath),
                        )}
                    </div>
                </fieldset>
            );
        }

        if (typeof templateValue === "boolean") {
            return (
                <label className="checkbox-field" key={fieldId} htmlFor={fieldId}>
                    <input
                        id={fieldId}
                        type="checkbox"
                        checked={Boolean(currentValue)}
                        onChange={(event) => updateValue(fullPath, event.target.checked)}
                    />
                    <span>{displayLabel}</span>
                </label>
            );
        }

        const isNumber = typeof templateValue === "number";
        const isDate =
            /date|dob/i.test(key) ||
            (typeof templateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(templateValue));

        return (
            <label className="form-field" key={fieldId} htmlFor={fieldId}>
                <span>
                    {displayLabel}
                    {required ? <em aria-label="required"> *</em> : null}
                </span>
                <input
                    id={fieldId}
                    type={isDate ? "date" : isNumber ? "number" : "text"}
                    required={required}
                    value={currentValue === null || currentValue === undefined ? "" : String(currentValue)}
                    onChange={(event) => {
                        const raw = event.target.value;
                        updateValue(fullPath, isNumber && raw !== "" ? Number(raw) : raw);
                    }}
                />
            </label>
        );
    };

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLocalSubmitting(true);

        try {
            const payload = schema ? { ...formValues, __schema: schema } : formValues;
            if (onSubmitOverride) {
                await onSubmitOverride(payload);
            } else {
                await saver.save(payload);
            }
            toast.success("Entity data accepted.");
        } catch (caught) {
            toast.error(caught instanceof Error ? caught.message : "The entity could not be saved.");
        } finally {
            setLocalSubmitting(false);
        }
    }

    const submitting = localSubmitting || saver.loading;

    return (
        <form className="entity-form" onSubmit={handleSubmit}>
            <Toaster position="bottom-center" richColors />
            <div className="entity-form-heading">
                <div>
                    <p className="eyebrow">Dynamic entity form</p>
                    <h2>New {humanize(entity)}</h2>
                </div>
                <span className="entity-badge">{metadata.schema ?? "default"}</span>
            </div>

            <div className="field-grid">
                {metadata.fields.map((field) => {
                    const templateValue = templateOverride?.[field.name] ?? defaultValueForType(field.type);
                    return renderValue(field.name, templateValue, [], field.label, field.required);
                })}
            </div>

            {saver.error ? <p className="form-error">{saver.error}</p> : null}

            <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={submitting}>
                    {submitting ? "Working…" : submitLabel}
                </button>
                <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => initialValues && setFormValues(cloneValue(initialValues))}
                    disabled={submitting}
                >
                    Reset
                </button>
            </div>
        </form>
    );
}
