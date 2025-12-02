// src/components/EntityComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useFormMetadata } from "@/hooks/useFormMetadata";
import { useEntityTemplate } from "@/hooks/useEntityTemplate";
import { useSaveEntity } from "@/hooks/useSaveEntity";
import { useHierarchicalOptions } from "@/hooks/useHierarchicalOptions";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { Toaster } from "sonner";

type FormValues = Record<string, any>;

type OptionItem = { value: any; label: string };

type OptionsProviderResult = {
    options: OptionItem[];
    loading: boolean;
    error?: string | null;
};

type OptionsProviderFn = (params: {
    entity: string;
    field: string;
    levelIndex: number;
    selectedValues: Record<string, string | null>;
}) => OptionsProviderResult;

type EntityComponentProps = {
    entity: string;

    /**
     * Optional template override.
     * If provided, this will be used instead of the template fetched by useEntityTemplate().
     * Expected shape:
     * {
     *   "<entityName>": { ...structure... }
     * }
     */
    templateOverride?: any;

    /**
     * Optional metadata override.
     * If provided, this will be used instead of the metadata fetched by useFormMetadata().
     */
    metadata?: any;

    /**
     * Optional submit handler override.
     * If provided, EntityComponent will NOT call useSaveEntity()/manage_entity;
     * instead it will call onSubmit(values).
     */
    onSubmit?: (values: any) => Promise<void> | void;

    /**
     * Optional hierarchical / foreign-key options provider.
     * If provided, EntityComponent will NOT use useHierarchicalOptions
     * and will instead call this function for each _hierN field.
     */
    optionsProvider?: OptionsProviderFn;

    /**
     * Optional initial values for edit mode.
     * When provided, the form will initialize using these values
     * instead of constructing an empty state from the template/metadata.
     */
    initialValues?: FormValues | null;
};

export default function EntityComponent({
                                            entity,
                                            templateOverride,
                                            metadata: metadataOverride,
                                            onSubmit,
                                            optionsProvider,
                                            initialValues,
                                        }: EntityComponentProps) {
    // ---------------------------------------------------------------------
    // Metadata & Template: prefer overrides, otherwise use hooks
    // ---------------------------------------------------------------------

    // If metadataOverride is provided, don't fetch via hook (pass undefined)
    const entityForMetaHook = metadataOverride ? undefined : entity;
    const {
        metadata: fetchedMetadata,
        isLoading: metaLoadingHook,
    } = useFormMetadata(entityForMetaHook);

    const metadata = metadataOverride ?? fetchedMetadata;
    const metaLoading = metadataOverride ? false : metaLoadingHook;

    // If templateOverride is provided, don't fetch via hook (pass undefined)
    const entityForTemplateHook = templateOverride ? undefined : entity;
    const {
        template: fetchedTemplate,
        loading: tmplLoadingHook,
    } = useEntityTemplate(entityForTemplateHook);

    const effectiveTemplate = templateOverride ?? fetchedTemplate;
    const tmplLoading = templateOverride ? false : tmplLoadingHook;

    const [formValues, setFormValues] = useState<FormValues>({});
    const [addButtonEnabled, setAddButtonEnabled] = useState<Record<string, boolean>>({});

    const { schema, isReadOnly } = useAuthInfo();

    // Tracks whether we've already chosen an initial state
    const [initialized, setInitialized] = useState(false);

    // ---------------------------------------------------------------------
    // Save logic: prefer onSubmit override, else useSaveEntity (manage_entity)
    // ---------------------------------------------------------------------
    const { save: saveToServer, loading: saveLoading } = useSaveEntity({
        entity,
        primaryKey: metadata?.primaryKey ?? "id",
    });

    const saving = onSubmit ? false : saveLoading;

    // ---------------------------------------------------------------------
    // Hierarchical fields & options
    // ---------------------------------------------------------------------
    const hierarchyFields =
        metadata?.fields
            ?.map((f: any) => f.name)
            .filter((n: string) => /_hier\d+$/.test(n)) ?? [];

    // Local state for hierarchy selections when optionsProvider is used
    const [selectedValues, setSelectedValues] = useState<Record<string, string | null>>({});

    // If an external optionsProvider is given, do NOT fetch via useHierarchicalOptions
    const defaultHier = useHierarchicalOptions(
        entity,
        optionsProvider ? [] : hierarchyFields, // empty list → no network / no-op
        "id",
        "name"
    );

    const hier = optionsProvider
        ? {
            hooks: hierarchyFields.map((field: string, index: number) => {
                const res = optionsProvider({
                    entity,
                    field,
                    levelIndex: index,
                    selectedValues,
                });
                return {
                    field,
                    options: res.options,
                    isLoading: res.loading,
                    error: res.error ?? null,
                };
            }),
            onChange: (field: string, value: string | null) => {
                setSelectedValues((prev) => {
                    const next: Record<string, string | null> = { ...prev, [field]: value };
                    const idx = hierarchyFields.indexOf(field);
                    // clear downstream
                    for (let i = idx + 1; i < hierarchyFields.length; i++) {
                        next[hierarchyFields[i]] = null;
                    }
                    return next;
                });
            },
        }
        : defaultHier;

    // ---------------------------------------------------------------------
    // Determine data shape
    // ---------------------------------------------------------------------

    const shape = effectiveTemplate
        ? effectiveTemplate[entity] // template (override or fetched) first
        : buildShapeFromMetadata(metadata); // fallback shape

    // ---------------------------------------------------------------------
    // Initial form state: either existing row (edit mode) or blank from shape
    // ---------------------------------------------------------------------
    useEffect(() => {
        if (initialized) return;

        // 1. If we have initialValues (edit mode), prefer those
        if (initialValues && typeof initialValues === "object") {
            setFormValues(initialValues);
            setInitialized(true);
            return;
        }

        // 2. Otherwise, if we have a shape, build the default blank state
        if (shape) {
            setFormValues(buildInitialState(shape));
            setInitialized(true);
        }
    }, [initialValues, shape, initialized]);

    if (metaLoading || tmplLoading) return <div>Loading form schema…</div>;
    if (!shape) return <div>No metadata or template available.</div>;

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    function buildShapeFromMetadata(meta?: any) {
        if (!meta?.fields) return null;
        const obj: any = {};
        meta.fields.forEach((f: any) => {
            obj[f.name] = fieldDefaultValue(f.type);
        });
        return obj;
    }

    function fieldDefaultValue(type: string): any {
        if (type === "boolean") return false;
        if (type === "number") return 0;
        return ""; // string fallback
    }

    function buildInitialState(structure: any): any {
        if (Array.isArray(structure)) return [];
        if (typeof structure === "object" && structure !== null) {
            const out: any = {};
            for (const [k, v] of Object.entries(structure)) {
                if (Array.isArray(v)) out[k] = [];
                else if (typeof v === "object" && v !== null) out[k] = buildInitialState(v);
                else out[k] = typeof v === "boolean" ? false : "";
            }
            return out;
        }
        return "";
    }

    const setNestedValue = (path: string[], value: any) => {
        setFormValues((prev) => {
            const updated: any = { ...prev };
            let ref: any = updated;
            for (let i = 0; i < path.length - 1; i++) {
                ref[path[i]] = { ...(ref[path[i]] || {}) };
                ref = ref[path[i]];
            }
            ref[path[path.length - 1]] = value;
            return updated;
        });
    };

    const getNestedValue = (path: string[]) =>
        path.reduce(
            (acc: any, key: string) =>
                acc && acc[key] !== undefined ? acc[key] : "",
            formValues
        );

    const handleInputChange = (
        path: string[],
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const target = e.target;
        const value =
            target instanceof HTMLInputElement && target.type === "checkbox"
                ? target.checked
                : target.value;
        setNestedValue(path, value);
    };

    const handleAddRow = (path: string[]) => {
        const current = (getNestedValue(path) as any[]) || [];
        setNestedValue(path, [...current, {}]);
        setAddButtonEnabled((prev) => ({ ...prev, [path.join(".")]: false }));
    };

    const handleDeleteRow = (path: string[], index: number) => {
        const current = [...((getNestedValue(path) as any[]) || [])];
        current.splice(index, 1);
        setNestedValue(path, current);
    };

    const handleBlurRow = (row: Record<string, any>, path: string[]) => {
        const allFilled = Object.values(row).every((val) => val !== "");
        setAddButtonEnabled((prev) => ({ ...prev, [path.join(".")]: allFilled }));
    };

    // ---------------------------------------------------------------------
    // Renderers
    // ---------------------------------------------------------------------

    const renderField = (key: string, structure: any, path: string[] = []) => {
        const fullPath = [...path, key];
        const fieldName = fullPath.join(".");

        const value = getNestedValue(fullPath);

        // Arrays
        if (Array.isArray(structure)) {
            const rows = value || [{}];
            const cols = structure[0] || {};

            return (
                <div key={fieldName}>
                    <h3 className="font-bold">{key.replace(/_/g, " ").toUpperCase()}</h3>
                    <table className="table-auto border border-gray-300 mb-2 w-full text-sm">
                        <thead>
                        <tr>
                            {Object.keys(cols).map((col) => (
                                <th key={col} className="px-2 py-1 border border-gray-200">
                                    {col}
                                </th>
                            ))}
                            {!isReadOnly && <th>Actions</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((row: any, index: number) => (
                            <tr key={index}>
                                {Object.keys(cols).map((col) => (
                                    <td key={col} className="px-2 py-1 border border-gray-200">
                                        <input
                                            type="text"
                                            className="w-full border rounded p-1"
                                            value={row[col] || ""}
                                            onChange={(e) =>
                                                setNestedValue(
                                                    [...fullPath, index.toString(), col],
                                                    e.target.value
                                                )
                                            }
                                            onBlur={() => handleBlurRow(row, fullPath)}
                                            disabled={saving || isReadOnly}
                                        />
                                    </td>
                                ))}
                                {!isReadOnly && (
                                    <td className="px-2 py-1 text-center">
                                        {rows.length > 1 && (
                                            <button
                                                type="button"
                                                className="text-red-500"
                                                onClick={() =>
                                                    handleDeleteRow(fullPath, index)
                                                }
                                            >
                                                −
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {!isReadOnly && (
                        <button
                            type="button"
                            className="text-green-600 text-sm"
                            onClick={() => handleAddRow(fullPath)}
                            disabled={!addButtonEnabled[fieldName] || saving}
                        >
                            + Add Row
                        </button>
                    )}
                </div>
            );
        }

        // Objects
        if (typeof structure === "object" && structure !== null) {
            return (
                <fieldset
                    key={fieldName}
                    className="border border-gray-300 p-3 rounded mt-3 space-y-2"
                >
                    <legend className="text-sm font-medium">
                        {key.replace(/_/g, " ")}
                    </legend>
                    {Object.entries(structure).map(([childKey, childStruct]) =>
                        renderField(childKey as string, childStruct, fullPath)
                    )}
                </fieldset>
            );
        }

        // Boolean
        if (typeof structure === "boolean") {
            return (
                <label key={fieldName} className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => handleInputChange(fullPath, e)}
                        disabled={saving || isReadOnly}
                    />
                    {key.replace(/_/g, " ")}
                </label>
            );
        }

        // Date
        if (
            key.toLowerCase().includes("date") ||
            key.toLowerCase().includes("dob") ||
            (typeof structure === "string" &&
                /^\d{4}-\d{2}-\d{2}$/.test(structure))
        ) {
            return (
                <label key={fieldName} className="block">
                    <span className="font-medium">{key.replace(/_/g, " ")}</span>
                    <input
                        type="date"
                        value={value != null ? String(value) : ""}
                        onChange={(e) => handleInputChange(fullPath, e)}
                        className="w-full border rounded p-1 mt-1"
                        disabled={saving || isReadOnly}
                    />
                </label>
            );
        }

        // Number
        if (typeof structure === "number") {
            return (
                <label key={fieldName} className="block">
                    <span className="font-medium">{key.replace(/_/g, " ")}</span>
                    <input
                        type="number"
                        value={value != null ? String(value) : ""}
                        onChange={(e) => handleInputChange(fullPath, e)}
                        className="w-full border rounded p-1 mt-1"
                        disabled={saving || isReadOnly}
                    />
                </label>
            );
        }

        // Cascading dropdowns
        if (hierarchyFields.includes(key)) {
            const h = (hier as any).hooks.find((h: any) => h.field === key);
            return (
                <label key={fieldName} className="block">
                    <span className="font-medium">{key.replace(/_/g, " ")}</span>
                    <select
                        name={key}
                        value={value != null ? String(value) : ""}
                        onChange={(e) => (hier as any).onChange(key, e.target.value || null)}
                        className="w-full border rounded p-1 mt-1"
                        disabled={h?.isLoading || saving || isReadOnly}
                    >
                        <option value="">Select...</option>
                        {h?.options?.map((opt: OptionItem) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </label>
            );
        }

        // Default string input
        return (
            <label key={fieldName} className="block">
                <span className="font-medium">{key.replace(/_/g, " ")}</span>
                <input
                    type="text"
                    value={value != null ? String(value) : ""}
                    onChange={(e) => handleInputChange(fullPath, e)}
                    className="w-full border rounded p-1 mt-1"
                    disabled={saving || isReadOnly}
                />
            </label>
        );
    };

    // ---------------------------------------------------------------------
    // Submit
    // ---------------------------------------------------------------------

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // UI-level guard; backend will still enforce auth.
        if (isReadOnly) {
            return;
        }

        const fullData = schema ? { ...formValues, __schema: schema } : formValues;

        if (onSubmit) {
            await onSubmit(fullData);
        } else {
            await saveToServer(fullData);
        }
    }

    // ---------------------------------------------------------------------
    // Render Form
    // ---------------------------------------------------------------------

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <Toaster position="bottom-center" richColors />
            <h2 className="text-lg font-bold">
                {initialValues ? "Edit" : "New"} {entity}
            </h2>

            {isReadOnly && (
                <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    You have read-only access to this entity. Fields are locked and saving is
                    disabled. Any write attempts will also be rejected by the server.
                </div>
            )}

            {Object.entries(shape).map(([k, v]) => renderField(k as string, v))}

            {!isReadOnly && (
                <button
                    type="submit"
                    className={`mt-4 px-4 py-2 rounded text-white ${
                        saving ? "bg-gray-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save"}
                </button>
            )}
        </form>
    );
}
