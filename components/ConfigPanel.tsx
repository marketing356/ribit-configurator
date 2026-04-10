'use client';

import { useState } from 'react';
import {
  BOAT_CONFIGS,
  POWDER_COAT_COLORS,
  EVA_COLORS,
  ENGINE_COLORS,
  INSIDE_SEAT_COLORS,
  OUTSIDE_SEAT_COLORS,
  TUBE_COLORS,
  STRIPE_COLORS,
  ACCESSORIES,
  CONSOLES,
} from '@/lib/boatConfig';
import { useConfigStore } from '@/lib/store';
import ColorSwatch from './ColorSwatch';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #1E2D45' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'none',
          border: 'none',
          color: '#E8EDF5',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        <span>{title}</span>
        <span style={{ color: '#8896A7', fontSize: '16px' }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function OptionButton({ label, selected, onClick }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 12px',
        borderRadius: '8px',
        border: selected ? '1.5px solid #0A84FF' : '1.5px solid #1E2D45',
        background: selected ? 'rgba(10, 132, 255, 0.12)' : 'transparent',
        color: selected ? '#0A84FF' : '#8896A7',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: selected ? 600 : 400,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

interface StripePatternButtonProps {
  pattern: number;
  selected: boolean;
  onClick: () => void;
  color: string;
}

function StripePatternButton({ pattern, selected, onClick, color }: StripePatternButtonProps) {
  const patterns: Record<number, React.ReactNode> = {
    1: (
      <svg width="40" height="24" viewBox="0 0 40 24">
        <rect width="40" height="24" fill="#1E2D45" rx="3" />
        <rect y="10" width="40" height="4" fill={color} />
      </svg>
    ),
    2: (
      <svg width="40" height="24" viewBox="0 0 40 24">
        <rect width="40" height="24" fill="#1E2D45" rx="3" />
        <rect y="6" width="40" height="3" fill={color} />
        <rect y="15" width="40" height="3" fill={color} />
      </svg>
    ),
    3: (
      <svg width="40" height="24" viewBox="0 0 40 24">
        <rect width="40" height="24" fill="#1E2D45" rx="3" />
        <polygon points="0,24 40,0 40,8 0,24" fill={color} />
      </svg>
    ),
    4: (
      <svg width="40" height="24" viewBox="0 0 40 24">
        <rect width="40" height="24" fill="#1E2D45" rx="3" />
        <polygon points="0,24 40,8 40,16 0,24" fill={color} />
        <polygon points="0,24 40,0 40,8 0,24" fill={color} opacity="0.5" />
      </svg>
    ),
    5: (
      <svg width="40" height="24" viewBox="0 0 40 24">
        <rect width="40" height="24" fill="#1E2D45" rx="3" />
        <rect y="8" width="20" height="8" fill={color} />
        <rect x="20" y="8" width="20" height="8" fill={color} opacity="0.5" />
      </svg>
    ),
  };

  return (
    <button
      onClick={onClick}
      title={`Pattern ${pattern}`}
      style={{
        padding: '3px',
        borderRadius: '6px',
        border: selected ? '2px solid #0A84FF' : '2px solid transparent',
        background: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {patterns[pattern]}
    </button>
  );
}

export default function ConfigPanel() {
  const { build, setBuild, setBoat, toggleAccessory } = useConfigStore();

  const stripeColorHex = STRIPE_COLORS.find((c) => c.id === build.stripeColor)?.hex ?? '#0D1B35';

  return (
    <div
      style={{
        overflowY: 'auto',
        height: '100%',
        background: '#0D1525',
      }}
    >
      {/* Model Selection */}
      <Section title="Model">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {BOAT_CONFIGS.map((boat) => (
            <button
              key={boat.id}
              onClick={() => setBoat(boat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '10px',
                border: build.boatId === boat.id ? '1.5px solid #0A84FF' : '1.5px solid #1E2D45',
                background: build.boatId === boat.id ? 'rgba(10, 132, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                color: build.boatId === boat.id ? '#E8EDF5' : '#8896A7',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{boat.name}</div>
                <div style={{ fontSize: '12px', color: '#8896A7' }}>{boat.size} · {boat.description.split('—')[0].trim()}</div>
              </div>
              {build.boatId === boat.id && (
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#0A84FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* Console */}
      <Section title="Console Type">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {CONSOLES.map((console) => (
            <OptionButton
              key={console.id}
              label={console.label}
              selected={build.consoleType === console.id}
              onClick={() => setBuild({ consoleType: console.id })}
            />
          ))}
        </div>
      </Section>

      {/* Powder Coat */}
      <Section title="Frame / Powder Coat">
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8896A7' }}>
          {POWDER_COAT_COLORS.find((c) => c.id === build.powderCoat)?.label}
        </div>
        <ColorSwatch
          colors={POWDER_COAT_COLORS}
          selected={build.powderCoat}
          onChange={(v) => setBuild({ powderCoat: v })}
        />
      </Section>

      {/* Tube Color */}
      <Section title="Tube Color">
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8896A7' }}>
          {TUBE_COLORS.find((c) => c.id === build.tubeColor)?.label}
        </div>
        <ColorSwatch
          colors={TUBE_COLORS}
          selected={build.tubeColor}
          onChange={(v) => setBuild({ tubeColor: v })}
        />
      </Section>

      {/* EVA Floor */}
      <Section title="EVA Floor Color" defaultOpen={false}>
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8896A7' }}>
          {EVA_COLORS.find((c) => c.id === build.evaColor)?.label}
        </div>
        <ColorSwatch
          colors={EVA_COLORS}
          selected={build.evaColor}
          onChange={(v) => setBuild({ evaColor: v })}
        />
      </Section>

      {/* Seating */}
      <Section title="Seating" defaultOpen={false}>
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', color: '#8896A7', marginBottom: '6px' }}>Color Style</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <OptionButton
              label="Two-Tone"
              selected={build.seatColorType === 'twoTone'}
              onClick={() => setBuild({ seatColorType: 'twoTone' })}
            />
            <OptionButton
              label="Solid"
              selected={build.seatColorType === 'solid'}
              onClick={() => setBuild({ seatColorType: 'solid' })}
            />
          </div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', color: '#8896A7', marginBottom: '6px' }}>
            {build.seatColorType === 'twoTone' ? 'Inside Color' : 'Seat Color'}
          </div>
          <ColorSwatch
            colors={INSIDE_SEAT_COLORS}
            selected={build.insideSeatColor}
            onChange={(v) => setBuild({ insideSeatColor: v })}
            size="sm"
          />
        </div>

        {build.seatColorType === 'twoTone' && (
          <div>
            <div style={{ fontSize: '12px', color: '#8896A7', marginBottom: '6px' }}>Outside Color</div>
            <ColorSwatch
              colors={OUTSIDE_SEAT_COLORS}
              selected={build.outsideSeatColor}
              onChange={(v) => setBuild({ outsideSeatColor: v })}
              size="sm"
            />
          </div>
        )}
      </Section>

      {/* Engine */}
      <Section title="Engine" defaultOpen={false}>
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', color: '#8896A7', marginBottom: '6px' }}>Brand</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <OptionButton
              label="Suzuki"
              selected={build.engineType === 'suzuki'}
              onClick={() => setBuild({ engineType: 'suzuki' })}
            />
            <OptionButton
              label="Tohatsu"
              selected={build.engineType === 'tohatsu'}
              onClick={() => setBuild({ engineType: 'tohatsu' })}
            />
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#8896A7', marginBottom: '6px' }}>Engine Color</div>
          <ColorSwatch
            colors={ENGINE_COLORS}
            selected={build.engineColor}
            onChange={(v) => setBuild({ engineColor: v })}
            size="sm"
          />
        </div>
      </Section>

      {/* Stripe */}
      <Section title="Stripe" defaultOpen={false}>
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', color: '#8896A7', marginBottom: '6px' }}>Pattern</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map((p) => (
              <StripePatternButton
                key={p}
                pattern={p}
                selected={build.stripePattern === p}
                onClick={() => setBuild({ stripePattern: p })}
                color={stripeColorHex}
              />
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#8896A7', marginBottom: '6px' }}>Stripe Color</div>
          <ColorSwatch
            colors={STRIPE_COLORS}
            selected={build.stripeColor}
            onChange={(v) => setBuild({ stripeColor: v })}
            size="sm"
          />
        </div>
      </Section>

      {/* Accessories */}
      <Section title="Accessories" defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ACCESSORIES.map((acc) => {
            const checked = build.accessories.includes(acc.id);
            return (
              <button
                key={acc.id}
                onClick={() => toggleAccessory(acc.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: checked ? '1.5px solid #0A84FF' : '1.5px solid #1E2D45',
                  background: checked ? 'rgba(10, 132, 255, 0.08)' : 'transparent',
                  color: checked ? '#E8EDF5' : '#8896A7',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: checked ? '1.5px solid #0A84FF' : '1.5px solid #4A5568',
                    background: checked ? '#0A84FF' : 'transparent',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {checked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                {acc.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Spacer for bottom CTA */}
      <div style={{ height: '24px' }} />
    </div>
  );
}
