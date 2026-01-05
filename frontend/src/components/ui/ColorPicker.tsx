import * as React from "react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  return (
    <input
      type="color"
      value={value || "#ffffff"}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: disabled ? 'not-allowed' : 'pointer' }}
      aria-label="Escolher cor personalizada"
    />
  );
}
