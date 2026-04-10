'use client';

import { useState } from 'react';
import { useConfigStore } from '@/lib/store';
import {
  BOAT_CONFIGS,
  POWDER_COAT_COLORS,
  TUBE_COLORS,
  EVA_COLORS,
  ENGINE_COLORS,
  INSIDE_SEAT_COLORS,
  OUTSIDE_SEAT_COLORS,
  STRIPE_COLORS,
  ACCESSORIES,
  CONSOLES,
} from '@/lib/boatConfig';

interface FormData {
  name: string;
  email: string;
  phone: string;
  zip: string;
  dealerArea: string;
  notes: string;
}

function buildSummary(build: ReturnType<typeof useConfigStore.getState>['build']): string {
  const boat = BOAT_CONFIGS.find((b) => b.id === build.boatId);
  const console_ = CONSOLES.find((c) => c.id === build.consoleType);
  const accessories = build.accessories
    .map((id) => ACCESSORIES.find((a) => a.id === id)?.label)
    .filter(Boolean)
    .join(', ');

  const lines = [
    `Model: ${boat?.name ?? build.boatId}`,
    `Console: ${console_?.label ?? build.consoleType}`,
    `Frame / Powder Coat: ${POWDER_COAT_COLORS.find((c) => c.id === build.powderCoat)?.label}`,
    `Tube Color: ${TUBE_COLORS.find((c) => c.id === build.tubeColor)?.label}`,
    `EVA Floor: ${EVA_COLORS.find((c) => c.id === build.evaColor)?.label}`,
    `Engine: ${build.engineType === 'suzuki' ? 'Suzuki' : 'Tohatsu'} — ${ENGINE_COLORS.find((c) => c.id === build.engineColor)?.label}`,
    `Seat Style: ${build.seatColorType === 'twoTone' ? 'Two-Tone' : 'Solid'}`,
    build.seatColorType === 'twoTone'
      ? `Seat Colors: Inside — ${INSIDE_SEAT_COLORS.find((c) => c.id === build.insideSeatColor)?.label}, Outside — ${OUTSIDE_SEAT_COLORS.find((c) => c.id === build.outsideSeatColor)?.label}`
      : `Seat Color: ${INSIDE_SEAT_COLORS.find((c) => c.id === build.insideSeatColor)?.label}`,
    `Stripe: Pattern ${build.stripePattern}, ${STRIPE_COLORS.find((c) => c.id === build.stripeColor)?.label}`,
    accessories ? `Accessories: ${accessories}` : 'Accessories: None',
  ];

  return lines.join('\n');
}

export default function QuoteModal() {
  const { showQuoteModal, setShowQuoteModal, build } = useConfigStore();
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    zip: '',
    dealerArea: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!showQuoteModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          buildSummary: buildSummary(build),
          build,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1.5px solid #1E2D45',
    background: 'rgba(255,255,255,0.04)',
    color: '#E8EDF5',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '12px',
    color: '#8896A7',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowQuoteModal(false);
      }}
    >
      <div
        style={{
          background: '#111827',
          borderRadius: '16px',
          border: '1px solid #1E2D45',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px 24px',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(48, 209, 88, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                <path d="M2 10L8.5 17L22 2" stroke="#30D158" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#E8EDF5' }}>
              Quote Request Sent!
            </h2>
            <p style={{ color: '#8896A7', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              Thanks, {form.name.split(' ')[0]}! We've received your build details and will be in touch within 1–2 business days.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setShowQuoteModal(false);
              }}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                background: 'rgba(10, 132, 255, 0.15)',
                border: '1.5px solid #0A84FF',
                color: '#0A84FF',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Back to Configurator
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Get Your Quote</h2>
              <p style={{ fontSize: '13px', color: '#8896A7' }}>
                We'll send your full build spec to a RIBIT dealer near you.
              </p>
            </div>

            {/* Build summary preview */}
            <div style={{
              background: 'rgba(10, 132, 255, 0.06)',
              border: '1px solid rgba(10, 132, 255, 0.2)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#8896A7',
              whiteSpace: 'pre-line',
              lineHeight: 1.7,
            }}>
              <div style={{ color: '#0A84FF', fontWeight: 700, fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Build
              </div>
              {buildSummary(build)}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    style={inputStyle}
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    style={inputStyle}
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Phone *</label>
                    <input
                      style={inputStyle}
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="(555) 000-0000"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Zip Code *</label>
                    <input
                      style={inputStyle}
                      required
                      value={form.zip}
                      onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
                      placeholder="10001"
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Preferred Dealer Area</label>
                  <input
                    style={inputStyle}
                    value={form.dealerArea}
                    onChange={(e) => setForm((f) => ({ ...f, dealerArea: e.target.value }))}
                    placeholder="City, State or Region"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Notes (optional)</label>
                  <textarea
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Any questions or special requests?"
                  />
                </div>
              </div>

              {error && (
                <div style={{ marginTop: '12px', color: '#FF453A', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1.5px solid #1E2D45',
                    background: 'transparent',
                    color: '#8896A7',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '10px',
                    background: submitting ? '#1E3A5F' : '#0A84FF',
                    border: 'none',
                    color: 'white',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 700,
                    transition: 'background 0.15s ease',
                  }}
                >
                  {submitting ? 'Sending...' : 'Send My Quote Request'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
