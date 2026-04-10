'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { useConfigStore } from '@/lib/store';
import { BOAT_CONFIGS, CONSOLES } from '@/lib/boatConfig';
import ConfigPanel from '@/components/ConfigPanel';
import QuoteModal from '@/components/QuoteModal';
import LoadingOverlay from '@/components/LoadingOverlay';

// Dynamically import 3D viewer (no SSR)
const BoatViewer = dynamic(() => import('@/components/BoatViewer'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', background: '#0A0F1C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#8896A7', fontSize: '14px' }}>Initializing 3D viewer…</div>
    </div>
  ),
});

const ENGINE_GLBS: Record<string, string> = {
  suzuki: '/models/suzukiEngine.glb',
  tohatsu: '/models/tohatsuEngine.glb',
};

export default function ConfiguratorPage() {
  const { build, setShowQuoteModal } = useConfigStore();
  const [panelOpen, setPanelOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close panel by default on mobile
  useEffect(() => {
    if (isMobile) setPanelOpen(false);
  }, [isMobile]);

  // When we swap boat/console/engine, show loading again
  // The BoatViewer will call onLoadingChange(false) once assets resolve
  const [viewerKey, setViewerKey] = useState(`${build.boatId}-${build.consoleType}-${build.engineType}`);
  useEffect(() => {
    const k = `${build.boatId}-${build.consoleType}-${build.engineType}`;
    setViewerKey(k);
    setModelLoading(true);
  }, [build.boatId, build.consoleType, build.engineType]);

  const handleLoadingChange = useCallback((loading: boolean) => {
    if (!loading) setModelLoading(false);
  }, []);

  const boat = BOAT_CONFIGS.find((b) => b.id === build.boatId);
  const consoleEntry = CONSOLES.find((c) => c.id === build.consoleType) ?? CONSOLES[0];
  const engineGlb = ENGINE_GLBS[build.engineType] ?? ENGINE_GLBS.suzuki;
  const hullGlb = boat?.hullGlb ?? '/models/boat390.glb';

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          height: '100vh',
          overflow: 'hidden',
          background: '#0A0F1C',
        }}
      >
        {/* === TOP BAR === */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '10px 14px' : '14px 20px',
            background: 'linear-gradient(to bottom, rgba(10,15,28,0.95) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        >
          {/* Logo */}
          <div style={{ pointerEvents: 'all' }}>
            <a
              href="https://ribitboats.com"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="6" fill="#0A84FF"/>
                <path d="M4 18 Q14 8 24 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <circle cx="14" cy="12" r="2.5" fill="white"/>
              </svg>
              <span style={{ color: '#E8EDF5', fontWeight: 800, fontSize: isMobile ? '15px' : '17px', letterSpacing: '-0.01em' }}>
                RIBIT <span style={{ color: '#0A84FF' }}>Boats</span>
              </span>
            </a>
          </div>

          {/* Current model badge */}
          {!isMobile && (
            <div style={{
              background: 'rgba(10, 132, 255, 0.12)',
              border: '1px solid rgba(10, 132, 255, 0.25)',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '13px',
              color: '#0A84FF',
              fontWeight: 600,
              pointerEvents: 'none',
            }}>
              {boat?.name ?? 'RIBIT H390'} · {boat?.size}
            </div>
          )}

          {/* Mobile panel toggle */}
          {isMobile && (
            <button
              onClick={() => setPanelOpen((o) => !o)}
              style={{
                pointerEvents: 'all',
                background: panelOpen ? '#0A84FF' : 'rgba(30,45,69,0.9)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {panelOpen ? '✕ Close' : '⚙ Customize'}
            </button>
          )}
        </div>

        {/* === LEFT CONFIG PANEL === */}
        {(!isMobile || panelOpen) && (
          <div
            style={
              isMobile
                ? {
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '65vh',
                    zIndex: 100,
                    background: '#0D1525',
                    borderRadius: '16px 16px 0 0',
                    border: '1px solid #1E2D45',
                    borderBottom: 'none',
                    overflowY: 'auto',
                    animation: 'fadeIn 0.2s ease',
                  }
                : {
                    width: '300px',
                    minWidth: '280px',
                    height: '100vh',
                    overflowY: 'auto',
                    background: '#0D1525',
                    borderRight: '1px solid #1E2D45',
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: '60px',
                  }
            }
          >
            {isMobile && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px 4px',
                borderBottom: '1px solid #1E2D45',
              }}>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>Customize Your Boat</span>
                <button
                  onClick={() => setPanelOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#8896A7', cursor: 'pointer', fontSize: '18px' }}
                >✕</button>
              </div>
            )}
            <ConfigPanel />
          </div>
        )}

        {/* === 3D VIEWPORT === */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Loading overlay — rendered ABOVE the canvas, hidden once loaded */}
          {modelLoading && <LoadingOverlay />}

          <Suspense fallback={null}>
            <BoatViewer
              key={viewerKey}
              build={build}
              hullGlb={hullGlb}
              consoleGlb={consoleEntry.glb}
              engineGlb={engineGlb}
              onLoadingChange={handleLoadingChange}
            />
          </Suspense>

          {/* Hint text */}
          {!isMobile && (
            <div style={{
              position: 'absolute',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(6px)',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '11px',
              color: '#C8D4E4',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}>
              Drag to rotate · Scroll to zoom
            </div>
          )}

          {/* Boat specs panel */}
          {!isMobile && boat && (
            <div style={{
              position: 'absolute',
              top: '70px',
              right: '16px',
              background: '#0D1525',
              border: '1px solid #2A3D5A',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '12px',
              color: '#C8D4E4',
              lineHeight: 1.8,
              minWidth: '160px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}>
              <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
                {boat.name}
              </div>
              <div>Length: <span style={{ color: '#FFFFFF' }}>{boat.specs.length}</span></div>
              <div>Beam: <span style={{ color: '#FFFFFF' }}>{boat.specs.beam}</span></div>
              <div>Capacity: <span style={{ color: '#FFFFFF' }}>{boat.specs.capacity}</span></div>
              <div>Max HP: <span style={{ color: '#FFFFFF' }}>{boat.specs.maxHP}</span></div>
            </div>
          )}
        </div>

        {/* === BOTTOM CTA BAR === */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: isMobile ? 0 : 300,
            right: 0,
            padding: isMobile ? '12px 16px' : '14px 24px',
            background: 'linear-gradient(to top, rgba(10,15,28,1) 0%, rgba(10,15,28,0.95) 80%, transparent 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'center' : 'flex-end',
            gap: '12px',
            zIndex: panelOpen && isMobile ? 50 : 30,
          }}
        >
          {!isMobile && boat && (
            <span style={{ fontSize: '13px', color: '#8896A7' }}>
              {boat.name} — your custom build
            </span>
          )}
          <button
            onClick={() => setShowQuoteModal(true)}
            style={{
              padding: isMobile ? '14px 32px' : '12px 28px',
              borderRadius: '12px',
              background: '#0A84FF',
              border: 'none',
              color: 'white',
              fontSize: isMobile ? '15px' : '14px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              boxShadow: '0 4px 20px rgba(10, 132, 255, 0.35)',
              transition: 'all 0.15s ease',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            Get Your Quote →
          </button>
        </div>
      </div>

      <QuoteModal />
    </>
  );
}
