
import * as React from "react";

interface Props {
    hex?: string | null;
    label?: string | null;
    size?: number;
    className?: string;
}

export default function ColorChip({ hex, label, size = 18, className = '' }: Props) {
    const safeHex = typeof hex === 'string' && hex ? hex : undefined;
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div
                aria-hidden
                className="rounded-md border border-border"
                style={{
                    width: size,
                    height: size,
                    background: safeHex || 'transparent'
                }}
            />
            {label ? <span className="text-sm text-foreground">{label}</span> : null}
        </div>
    );
}
