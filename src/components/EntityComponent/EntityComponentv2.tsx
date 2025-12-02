// // src/components/EntityComponentV2.tsx
// "use client";
//
// import React, { useEffect, useMemo, useState } from "react";
// import { Toaster } from "sonner";
//
// import { useFormMetadata } from "@/hooks/useFormMetadata";
// import { useSaveEntity } from "@/hooks/useSaveEntity";
// import { useHierarchicalOptions } from "@/hooks/useHierarchicalOptions";
// import { useAuthInfo } from "@/hooks/useAuthInfo";
// import { useEntityDefinition } from "@/hooks/useEntityDefinition";
//
// import FieldObject from "./EntityCore/FieldObject";
// import type { SelectOption } from "./EntityCore/FieldPrimitive";
//
// type FormValues = Record<string, any>;
//
// interface EntityComponentV2Props {
//     entity: string;
// }
//
// export default function EntityComponentV2({ entity }: EntityComponentV2Props) {
//     const { metadata, isLoading: loadingMeta } = useFormMetadata(entity);
//     const { schema } = useAuthInfo();
//
//     const [formValues, setFormValues] = useState<FormValues>({});
//     const [initialized, setInitialized] = useState(false);
//
//     // entity_json from EntityCore (/api/entity/{entity})
//     const {
//         definition,
//         load: loadDefinition,
//         loading: loadingDefinition,
//         error: definitionError,
//     } = useEntityDefinition(entity);
//
//     // save hook (still using your manage_entity backend)
//     const { save, loading: saving } = useSaveEntity({
//         entity,
//         primaryKey: metadata?.primaryKey ?? "id",
//     });
//
//     // hierarchy fields from metadata
//     const hierarchyFields: string[] =
//         metadata?.fields
//             .map((f) => f.name)
//             .filter((n) => /_hier\d+$/.test(n)) ?? [];
//
//     const hier = useHierarchicalOptions(entity, hierarchyFields, "id", "name");
//
//     // ---------------------------------------------------------------------------
//     // Helpers for nested state
//     // ---------------------------------------------------------------------------
//
//     const setNestedValue = (path: string[], value: any) => {
//         setFormValues((prev) => {
//             const updated: any = { ...prev };
//             let ref = updated;
//             for (let i = 0; i < path.length - 1; i++) {
//                 const key = path[i];
//                 ref[key] = { ...(ref[key] || {}) };
//                 ref = ref[key];
//             }
//             ref[path[path.length - 1]] = value;
//             return updated;
//         });
//     };
//
//     const getNestedValue = (path: string[]): any =>
//         path.reduce(
//             (acc: any, key: string) =>
//                 acc && Object.prototype.hasOwnProperty.call(acc, key)
//                     ? acc[key]
//                     : undefined,
//             formValues
//         );
//
//     const addArrayRow = (path: string[]) => {
//         const current = (getNestedValue(path) as any[]) || [];
//         const next = [...current, {}];
//         setNestedValue(path, next);
//     };
//
//     const removeArrayRow = (path: string[], index: number) => {
//         const current = (getNestedValue(path) as any[]) || [];
//         const next = [...current];
//         next.splice(index, 1);
//         setNestedValue(path, next);
//     };
//
//     // ---------------------------------------------------------------------------
//     // Initial load: entity_json is our shape
//     // ---------------------------------------------------------------------------
//
//     useEffect(() => {
//         (async () => {
//             if (initialized) return;
//             await loadDefinition();
//             setInitialized(true);
//         })();
//     }, [initialized, loadDefinition]);
//
//     useEffect(() => {
//         // once we have entity_json and we haven't manually edited yet, seed form
//         if (definition?.entity_json && Object.keys(formValues).length === 0) {
//             setFormValues(definition.entity_json);
//         }
//     }, [definition, formValues]);
//
//     // ---------------------------------------------------------------------------
//     // Hierarchy options integration
//     // ---------------------------------------------------------------------------
//
//     const getHierarchyOptions = (fieldName: string): {
//         loading: boolean;
//         options: SelectOption[];
//     } => {
//         const h = hier.hooks.find((h) => h.field === fieldName);
//         if (!h) return { loading: false, options: [] };
//         return {
//             loading: h.isLoading,
//             options: (h.options || []).map((opt) => ({
//                 value: opt.value,
//                 label: opt.label,
//             })),
//         };
//     };
//
//     // ---------------------------------------------------------------------------
//     // Submit
//     // ---------------------------------------------------------------------------
//
//     async function handleSubmit(e: React.FormEvent) {
//         e.preventDefault();
//         const payload = schema ? { ...formValues, __schema: schema } : formValues;
//         await save(payload);
//     }
//
//     // ---------------------------------------------------------------------------
//     // Render
//     // ---------------------------------------------------------------------------
//
//     if (loadingMeta || loadingDefinition) {
//         return <div className="p-4">Loading form schema…</div>;
//     }
//
//     if (!metadata) {
//         return <div className="p-4 text-red-600">No metadata found for {entity}.</div>;
//     }
//
//     if (!definition?.entity_json) {
//         return (
//             <div className="p-4">
//                 <p className="text-red-600 mb-2">
//                     No EntityCore definition (entity_json) found for <b>{entity}</b>.
//                 </p>
//                 {definitionError && (
//                     <p className="text-sm text-gray-600">Error: {definitionError}</p>
//                 )}
//                 <p className="text-sm text-gray-600">
//                     Create one in <code>/entity-core/new</code> and try again.
//                 </p>
//             </div>
//         );
//     }
//
//     return (
//         <form onSubmit={handleSubmit} className="grid gap-4">
//             <Toaster position="bottom-center" richColors />
//             <h2 className="text-lg font-bold">New {entity}</h2>
//
//             <FieldObject
//                 shape={definition.entity_json}
//                 data={formValues}
//                 path={[]}
//                 updateField={setNestedValue}
//                 addArrayRow={addArrayRow}
//                 removeArrayRow={removeArrayRow}
//                 disabled={saving}
//                 hierarchyFields={hierarchyFields}
//                 getHierarchyOptions={getHierarchyOptions}
//             />
//
//             <button
//                 type="submit"
//                 className={`mt-4 px-4 py-2 rounded text-white ${
//                     saving ? "bg-gray-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
//                 }`}
//                 disabled={saving}
//             >
//                 {saving ? "Saving..." : "Save"}
//             </button>
//         </form>
//     );
// }
// aaaaa