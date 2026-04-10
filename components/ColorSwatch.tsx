'use client';

import { ColorOption } from '@/lib/boatConfig';

interface ColorSwatchProps {
  colors: ColorOption[];
  selected: string;
  onChange: (id: string) => void;
  size?: 'sm' | 'md';
}

export default function ColorSwatch({ colors, selected, onChange, size = 'md' }: ColorSwatchProps) {
  const dim = size === 'sm' ? 28 : 34;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {colors.map((color) => {
        const isSelected = color.id === selected;
        return (
          <button
            key={color.id}
            title={color.label}
            onClick={() => onChange(color.id)}
            aria-label={color.label}
            aria-pressed={isSelected}
            style={{
              width: dim,
              height: dim,
              borderRadius: '50%',
              background: color.hex,
              // Always show a white ring so dark swatches are visible on dark bg
              boxShadow: isSelected
                ? `0 0 0 2px #ffffff, 0 0 0 4px #0A84FF`
                : `0 0 0 2px rgba(255,255,255,0.55), 0 1px 3px rgba(0,0,0,0.6)`,
              border: 'none',
              cursor: 'pointer',
              transition: 'box-shadow 0.15s ease, transform 0.1s ease',
              transform: isSelected ? 'scale(1.12)' : 'scale(1)',
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}
