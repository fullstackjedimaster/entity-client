'use client';

import React from 'react';
import FieldPrimitive from './FieldPrimitive';
import FieldArray from './FieldArray';
import type { PrimitiveValue } from './FieldPrimitive';

export interface FieldObjectProps {
    shape: Record<string, unknown>;
    data: Record<string, unknown>;
    path: string[];
    updateField: (path: string[], value: unknown) => void;
    addArrayRow: (path: string[], templateRow: Record<string, unknown>) => void;
    removeArrayRow: (path: string[], index: number) => void;
}

export default function FieldObject({
                                        shape,
                                        data,
                                        path,
                                        updateField,
                                        addArrayRow,
                                        removeArrayRow,
                                    }: FieldObjectProps) {
    return (
        <div className="border p-3 rounded space-y-2 bg-gray-50">
            {Object.keys(shape).map((key: string) => {
                const val = shape[key as keyof typeof shape];
                const p = [...path, key];

                // Array subform
                if (Array.isArray(val)) {
                    const rowTemplate = (val[0] ?? {}) as Record<string, unknown>;
                    const rows = Array.isArray(data[key as keyof typeof data])
                        ? (data[key as keyof typeof data] as Record<string, unknown>[])
                        : [];

                    return (
                        <FieldArray
                            key={key}
                            label={key}
                            templateRow={rowTemplate}
                            rows={rows}
                            path={p}
                            updateField={updateField}
                            addArrayRow={addArrayRow}
                            removeArrayRow={removeArrayRow}
                        />
                    );
                }

                // Nested object
                if (val && typeof val === 'object') {
                    return (
                        <FieldObject
                            key={key}
                            shape={val as Record<string, unknown>}
                            data={(data[key as keyof typeof data] ??
                                {}) as Record<string, unknown>}
                            path={p}
                            updateField={updateField}
                            addArrayRow={addArrayRow}
                            removeArrayRow={removeArrayRow}
                        />
                    );
                }

                // Primitive
                const currentValue = data[key as keyof typeof data] as PrimitiveValue;

                return (
                    <FieldPrimitive
                        key={key}
                        label={key}
                        value={currentValue}
                        onChange={(v: string) => updateField(p, v)}
                    />
                );
            })}
        </div>
    );
}
