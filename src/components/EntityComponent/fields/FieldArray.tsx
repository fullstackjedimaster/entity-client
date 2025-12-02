'use client';

import React from 'react';
import FieldObject from './FieldObject';

export interface FieldArrayProps {
    label: string;
    templateRow: Record<string, unknown>;
    rows: Record<string, unknown>[];
    path: string[];
    updateField: (path: string[], value: unknown) => void;
    addArrayRow: (path: string[], templateRow: Record<string, unknown>) => void;
    removeArrayRow: (path: string[], index: number) => void;
}

export default function FieldArray({
                                       label,
                                       templateRow,
                                       rows,
                                       path,
                                       updateField,
                                       addArrayRow,
                                       removeArrayRow,
                                   }: FieldArrayProps) {
    const columns = Object.keys(templateRow);

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="font-medium">{label}</h3>
                <button
                    type="button"
                    className="px-2 py-1 text-sm bg-green-600 text-white rounded"
                    onClick={() => addArrayRow(path, templateRow)}
                >
                    + Add
                </button>
            </div>

            {rows.map((row, index) => (
                <div
                    key={index}
                    className="border p-2 rounded bg-gray-100 space-y-2 relative"
                >
                    <button
                        type="button"
                        className="absolute top-1 right-1 px-2 py-1 text-xs bg-red-600 text-white rounded"
                        onClick={() => removeArrayRow(path, index)}
                    >
                        Delete
                    </button>

                    <FieldObject
                        shape={templateRow}
                        data={row}
                        path={[...path, String(index)]}
                        updateField={updateField}
                        addArrayRow={addArrayRow}
                        removeArrayRow={removeArrayRow}
                    />
                </div>
            ))}
        </div>
    );
}
