'use client';

import { Suspense, useEffect, useMemo, useCallback, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { BuildOptions } from '@/lib/boatConfig';

// ─── Color resolution ────────────────────────────────────────────────────────

const HEX_MAP: Record<string, string> = {
  white:     '#F5F5F5',
  black:     '#1A1A1A',
  gray:      '#808080',
  navy:      '#1B2A4A',
  red:       '#CC2222',
  deepNavy:  '#0D1B35',
  brownBlack:'#3D2B1F',
  blue:      '#1E4080',
};

function resolveHex(color: string): string {
  return HEX_MAP[color] ?? color;
}

// ─── Material helpers ────────────────────────────────────────────────────────

function setMeshColor(mesh: THREE.Mesh, hex: string) {
  const applyToMat = (mat: THREE.Material) => {
    if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
      const m = mat as THREE.MeshStandardMaterial;
      m.color.set(hex);
      // Strip any baked textures that would fight the chosen color
      m.map = null;
      m.emissiveMap = null;
      m.emissive.set('#000000');
      m.needsUpdate = true;
    } else if ('color' in mat) {
      (mat as THREE.MeshStandardMaterial).color.set(hex);
      mat.needsUpdate = true;
    }
  };
  if (Array.isArray(mesh.material)) {
    mesh.material.forEach(applyToMat);
  } else {
    applyToMat(mesh.material);
  }
}

/**
 * Clone a scene AND deep-clone every material so mutations are isolated.
 */
function cloneSceneWithMaterials(scene: THREE.Object3D): THREE.Object3D {
  const clone = scene.clone();
  clone.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (Array.isArray(child.material)) {
        child.material = child.material.map((m) => m.clone());
      } else {
        child.material = child.material.clone();
      }
    }
  });
  return clone;
}

// ─── Bounding-box helpers ────────────────────────────────────────────────────

/** Compute a world-space Box3 for a cloned scene after it's been positioned. */
function getBox3(object: THREE.Object3D): THREE.Box3 {
  const box = new THREE.Box3();
  box.setFromObject(object);
  return box;
}

// ─── Keyword sets for mesh identification ────────────────────────────────────

const TUBE_KW     = ['tube', 'inflatable', 'collar', 'pontoon', 'fender', 'float', 'buoy'];
const EVA_KW      = ['eva', 'mat', 'foam', 'deck_pad', 'floor_pad', 'decking', 'traction'];
const SEAT_IN_KW  = ['seat_inner', 'cushion_inside', 'inside_seat', 'seat_in'];
const SEAT_OUT_KW = ['seat_outer', 'cushion_outside', 'outside_seat', 'seat_out'];
const SEAT_KW     = ['seat', 'cushion', 'bench', 'bolster'];

function matchesAny(name: string, keywords: string[]): boolean {
  return keywords.some((k) => name.includes(k));
}

/**
 * Apply all build colors to a scene object.
 * Hull powder coat is the default — applied to anything that doesn't match a
 * more specific category.
 */
function applyBuildColors(object: THREE.Object3D, build: BuildOptions) {
  const powderHex    = resolveHex(build.powderCoat);
  const tubeHex      = resolveHex(build.tubeColor);
  const evaHex       = resolveHex(build.evaColor);
  const innerSeatHex = resolveHex(build.insideSeatColor);
  const outerSeatHex = resolveHex(build.outsideSeatColor);

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const name = child.name.toLowerCase();

    if (matchesAny(name, TUBE_KW)) {
      setMeshColor(child, tubeHex);
    } else if (matchesAny(name, EVA_KW)) {
      setMeshColor(child, evaHex);
    } else if (build.seatColorType === 'twoTone' && matchesAny(name, SEAT_OUT_KW)) {
      setMeshColor(child, outerSeatHex);
    } else if (matchesAny(name, SEAT_KW)) {
      setMeshColor(child, innerSeatHex);
    } else {
      setMeshColor(child, powderHex);
    }
  });
}

// ─── Scene components ────────────────────────────────────────────────────────

function HullModel({
  glbPath,
  build,
  onBoundsReady,
}: {
  glbPath: string;
  build: BuildOptions;
  onBoundsReady: (box: THREE.Box3) => void;
}) {
  const { scene } = useGLTF(glbPath);

  const clonedScene = useMemo(
    () => cloneSceneWithMaterials(scene),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [glbPath, scene]
  );

  // Center the hull at origin on XZ and sit it on Y=0
  const centeredScene = useMemo(() => {
    const grp = new THREE.Group();
    grp.add(clonedScene.clone ? clonedScene.clone() : clonedScene);

    const raw = new THREE.Box3().setFromObject(grp);
    const center = new THREE.Vector3();
    raw.getCenter(center);
    // Shift so hull center is at X=0, Z=0, and bottom sits at Y=0
    grp.position.set(-center.x, -raw.min.y, -center.z);
    return grp;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clonedScene]);

  useEffect(() => {
    applyBuildColors(centeredScene, build);
  }, [centeredScene, build]);

  // Notify parent of final bounds after positioning
  const reported = useRef(false);
  useEffect(() => {
    if (!reported.current) {
      reported.current = true;
      const box = new THREE.Box3().setFromObject(centeredScene);
      onBoundsReady(box);
    }
  }, [centeredScene, onBoundsReady]);

  return <primitive object={centeredScene} />;
}

/**
 * Positions an accessory GLB relative to hull bounds.
 * offset is a fraction of hull size: [xFrac, yFrac, zFrac]
 * where 0.5 = center, negative z = bow, positive z = stern
 */
function PositionedModel({
  glbPath,
  hullBox,
  xFrac,
  yFrac,
  zFrac,
  scale,
  colorHex,
}: {
  glbPath: string;
  hullBox: THREE.Box3 | null;
  /** Fraction along hull X [-0.5 .. 0.5] (0 = center) */
  xFrac: number;
  /** Fraction along hull Y [0 .. 1] (0 = keel, 1 = top) */
  yFrac: number;
  /** Fraction along hull Z [-0.5 .. 0.5] (negative = bow, positive = stern) */
  zFrac: number;
  scale?: number;
  colorHex?: string;
}) {
  const { scene } = useGLTF(glbPath);

  const cloneWithMats = useMemo(() => cloneSceneWithMaterials(scene), [scene]);

  // Measure accessory own bounds and center it
  const centeredAccessory = useMemo(() => {
    const grp = new THREE.Group();
    const inner = cloneWithMats.clone ? cloneWithMats.clone() : cloneWithMats;
    grp.add(inner);
    if (scale && scale !== 1) grp.scale.setScalar(scale);
    const rawBox = new THREE.Box3().setFromObject(grp);
    const c = new THREE.Vector3();
    rawBox.getCenter(c);
    grp.position.set(-c.x, -rawBox.min.y, -c.z);
    return grp;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloneWithMats, scale]);

  useEffect(() => {
    if (colorHex) {
      centeredAccessory.traverse((child) => {
        if (child instanceof THREE.Mesh) setMeshColor(child, colorHex);
      });
    }
  }, [centeredAccessory, colorHex]);

  // Compute world position based on hull bounds
  const position = useMemo<[number, number, number]>(() => {
    if (!hullBox) return [0, 0, 0];
    const hullSize = new THREE.Vector3();
    hullBox.getSize(hullSize);
    const hullCenter = new THREE.Vector3();
    hullBox.getCenter(hullCenter);

    const x = hullCenter.x + xFrac * hullSize.x;
    const y = hullBox.min.y + yFrac * hullSize.y;
    const z = hullCenter.z + zFrac * hullSize.z;
    return [x, y, z];
  }, [hullBox, xFrac, yFrac, zFrac]);

  return (
    <group position={position}>
      <primitive object={centeredAccessory} />
    </group>
  );
}

function SceneCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(3.5, 2, 5);
    camera.lookAt(0, 0.5, 0);
  }, [camera]);
  return null;
}

function LoadingBridge({ onProgress }: { onProgress: (active: boolean) => void }) {
  const { active } = useProgress();
  useEffect(() => {
    onProgress(active);
  }, [active, onProgress]);
  return null;
}

// ─── Accessory mount offsets (fractions of hull size) ───────────────────────
//
// These are tuned for H390/H420. Adjust per-boat if needed.
//
// xFrac: 0 = centerline
// yFrac: 0 = keel, 1 = full height (deck)
// zFrac: 0 = center, -0.5 = bow tip, +0.5 = stern tip
//
// Engine goes BEHIND the stern — zFrac > 0.5 to place it outside/aft

interface MountPoint { xFrac: number; yFrac: number; zFrac: number; scale?: number; }

const MOUNT_POINTS: Record<string, MountPoint> = {
  engine:          { xFrac: 0,    yFrac: 0.15, zFrac:  0.62 },  // outside stern
  console:         { xFrac: 0,    yFrac: 0.45, zFrac: -0.05 },  // center/fwd of midship
  lightBarArch:    { xFrac: 0,    yFrac: 1.05, zFrac: -0.05 },  // over console
  fishingRod:      { xFrac: 0.3,  yFrac: 0.80, zFrac:  0.30 },  // port stern quarter
  telescopicLadder:{ xFrac: 0,    yFrac: 0.10, zFrac:  0.45 },  // transom exterior
  fixedBimini:     { xFrac: 0,    yFrac: 1.10, zFrac: -0.05 },  // above console
  FoldingBimini:   { xFrac: 0,    yFrac: 1.10, zFrac: -0.05 },
};

const ACCESSORY_GLBS: Record<string, string> = {
  lightBarArch:     '/models/lightBarArch.glb',
  fishingRod:       '/models/fishingRod.glb',
  telescopicLadder: '/models/telescopicLadder.glb',
  fixedBimini:      '/models/fixedBimini.glb',
  FoldingBimini:    '/models/FoldingBimini.glb',
};

// ─── Scene inner component (has access to hullBox state) ─────────────────────

function Scene({
  build,
  hullGlb,
  consoleGlb,
  engineGlb,
}: {
  build: BuildOptions;
  hullGlb: string;
  consoleGlb: string;
  engineGlb: string;
}) {
  const hullBoxRef = useRef<THREE.Box3 | null>(null);
  // Force re-render after hull bounds are set
  const [hullBox, setHullBox] = useState<THREE.Box3 | null>(null);

  const handleBoundsReady = useCallback((box: THREE.Box3) => {
    hullBoxRef.current = box;
    setHullBox(box);
  }, []);

  const engineColorHex = resolveHex(build.engineColor);

  const consoleMnt  = MOUNT_POINTS.console;
  const engineMnt   = MOUNT_POINTS.engine;

  return (
    <>
      <HullModel glbPath={hullGlb} build={build} onBoundsReady={handleBoundsReady} />

      {hullBox && (
        <>
          {/* Console */}
          <PositionedModel
            glbPath={consoleGlb}
            hullBox={hullBox}
            xFrac={consoleMnt.xFrac}
            yFrac={consoleMnt.yFrac}
            zFrac={consoleMnt.zFrac}
          />

          {/* Engine — mounts outside/aft of transom */}
          <PositionedModel
            glbPath={engineGlb}
            hullBox={hullBox}
            xFrac={engineMnt.xFrac}
            yFrac={engineMnt.yFrac}
            zFrac={engineMnt.zFrac}
            colorHex={engineColorHex}
          />

          {/* Accessories */}
          {build.accessories.map((accId) => {
            const glb = ACCESSORY_GLBS[accId];
            const mnt = MOUNT_POINTS[accId];
            if (!glb || !mnt) return null;
            return (
              <PositionedModel
                key={accId}
                glbPath={glb}
                hullBox={hullBox}
                xFrac={mnt.xFrac}
                yFrac={mnt.yFrac}
                zFrac={mnt.zFrac}
                scale={mnt.scale}
              />
            );
          })}
        </>
      )}
    </>
  );
}

// useState import is needed inside Scene — pull it to the top
import { useState } from 'react';

// ─── Main export ─────────────────────────────────────────────────────────────

interface BoatViewerProps {
  build: BuildOptions;
  hullGlb: string;
  consoleGlb: string;
  engineGlb: string;
  onLoadingChange?: (loading: boolean) => void;
}

export default function BoatViewer({ build, hullGlb, consoleGlb, engineGlb, onLoadingChange }: BoatViewerProps) {
  const handleProgress = useCallback(
    (active: boolean) => onLoadingChange?.(active),
    [onLoadingChange]
  );

  return (
    <div className="w-full h-full" style={{ background: '#0A0F1C' }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 45, near: 0.1, far: 100 }}
      >
        <SceneCamera />
        <LoadingBridge onProgress={handleProgress} />

        {/* ── Showroom lighting rig ───────────────────────────────────────── */}
        <ambientLight intensity={3.0} />
        <directionalLight
          position={[5, 8, 6]}
          intensity={5.0}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5}
          shadow-camera-far={30}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
        />
        <directionalLight position={[-6, 5, -4]} intensity={2.5} />
        <directionalLight position={[0, 4, -9]} intensity={2.0} />
        <directionalLight position={[0, 1, 9]} intensity={1.8} />
        <pointLight position={[0, 7, 0]} intensity={3.0} color="#ffffff" distance={20} />

        {/* ── Models ──────────────────────────────────────────────────────── */}
        <Suspense fallback={null}>
          <Scene
            build={build}
            hullGlb={hullGlb}
            consoleGlb={consoleGlb}
            engineGlb={engineGlb}
          />
        </Suspense>

        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.5}
          scale={12}
          blur={2.5}
          far={4}
          color="#000820"
        />

        <OrbitControls
          enablePan={false}
          minDistance={2.5}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={0.2}
          target={[0, 0.3, 0]}
          makeDefault
        />
      </Canvas>
    </div>
  );
}

export function preloadBoatModels(paths: string[]) {
  paths.forEach((path) => useGLTF.preload(path));
}
