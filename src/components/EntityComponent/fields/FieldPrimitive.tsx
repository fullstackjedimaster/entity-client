'use client';

import React from 'react';

export type PrimitiveValue = string | number | boolean | null | undefined;

export interface FieldPrimitiveProps {
    label: string;
    value: PrimitiveValue;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export default function FieldPrimitive({
                                           label,
                                           value,
                                           onChange,
                                           disabled,
                                       }: FieldPrimitiveProps) {
    return (
        <div className="flex flex-col space-y-1">
            <label className="font-medium">{label}</label>
            <input
                className="border rounded px-3 py-1"
                value={value != null ? String(value) : ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            />
        </div>
    );
}
