'use client';

export default function LoadingOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        // Fully opaque — no bleed-through of partially loaded models
        background: '#0A0F1C',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      {/* RIBIT wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <svg width="36" height="36" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="28" height="28" rx="6" fill="#0A84FF"/>
          <path d="M4 18 Q14 8 24 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <circle cx="14" cy="12" r="2.5" fill="white"/>
        </svg>
        <span style={{ color: '#E8EDF5', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.01em' }}>
          RIBIT <span style={{ color: '#0A84FF' }}>Boats</span>
        </span>
      </div>

      {/* Spinner */}
      <div
        style={{
          width: '44px',
          height: '44px',
          border: '3px solid rgba(10, 132, 255, 0.15)',
          borderTop: '3px solid #0A84FF',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />

      <p style={{ color: '#8896A7', fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Loading model…
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
