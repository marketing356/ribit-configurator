'use client';

import { Suspense, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { BuildOptions } from '@/lib/boatConfig';

// ─── Color resolution ────────────────────────────────────────────────────────

const HEX_MAP: Record<string, string> = {
  white: '#F5F5F5',
  black: '#1A1A1A',
  gray: '#808080',
  navy: '#1B2A4A',
  red: '#CC2222',
  deepNavy: '#0D1B35',
  brownBlack: '#3D2B1F',
  blue: '#1E4080',
};

function resolveHex(color: string): string {
  return HEX_MAP[color] ?? color;
}

// ─── Material helpers ────────────────────────────────────────────────────────

/** Set color on any material that has a .color property */
function setMeshColor(mesh: THREE.Mesh, hex: string) {
  const applyToMat = (mat: THREE.Material) => {
    if ('color' in mat) {
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
 * Without this, multiple components share the same material instances and
 * color changes on one affect the others.
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

// ─── Keyword sets for mesh identification ────────────────────────────────────

const TUBE_KW    = ['tube', 'inflatable', 'collar', 'pontoon', 'fender', 'float', 'buoy'];
const EVA_KW     = ['eva', 'mat', 'foam', 'deck_pad', 'floor_pad', 'decking', 'traction'];
const SEAT_IN_KW = ['seat_inner', 'cushion_inside', 'inside_seat', 'seat_in'];
const SEAT_OUT_KW= ['seat_outer', 'cushion_outside', 'outside_seat', 'seat_out'];
const SEAT_KW    = ['seat', 'cushion', 'bench', 'bolster'];

function matchesAny(name: string, keywords: string[]): boolean {
  return keywords.some((k) => name.includes(k));
}

/**
 * Apply all build colors to a scene object.
 * Strategy: hull powder coat is the DEFAULT — applied to anything that doesn't
 * match a more specific category.  This guarantees the boat always has color
 * even if the GLB mesh names don't follow any naming convention.
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
      // Default: apply hull/frame powder coat color to everything else
      setMeshColor(child, powderHex);
    }
  });
}

// ─── Scene components ────────────────────────────────────────────────────────

function HullModel({ glbPath, build }: { glbPath: string; build: BuildOptions }) {
  const { scene } = useGLTF(glbPath);

  // Deep-clone once per GLB load so our color mutations are isolated
  const clonedScene = useMemo(
    () => cloneSceneWithMaterials(scene),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [glbPath, scene]
  );

  // Re-apply colors whenever the build changes
  useEffect(() => {
    applyBuildColors(clonedScene, build);
  }, [clonedScene, build]);

  return <primitive object={clonedScene} />;
}

function AccessoryModel({ glbPath, position }: { glbPath: string; position?: [number, number, number] }) {
  const { scene } = useGLTF(glbPath);
  const clone = useMemo(() => scene.clone(), [scene]);
  return (
    <group position={position ?? [0, 0, 0]}>
      <primitive object={clone} />
    </group>
  );
}

function EngineModel({ glbPath, color }: { glbPath: string; color: string }) {
  const { scene } = useGLTF(glbPath);
  const clone = useMemo(() => cloneSceneWithMaterials(scene), [scene]);

  useEffect(() => {
    const hex = resolveHex(color);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) setMeshColor(child, hex);
    });
  }, [clone, color]);

  return <primitive object={clone} />;
}

function ConsoleModel({ glbPath }: { glbPath: string }) {
  const { scene } = useGLTF(glbPath);
  const clone = useMemo(() => scene.clone(), [scene]);
  return <primitive object={clone} />;
}

function SceneCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(3.5, 2, 5);
    camera.lookAt(0, 0.5, 0);
  }, [camera]);
  return null;
}

/**
 * Bridges THREE.DefaultLoadingManager progress into React state.
 * Must live OUTSIDE <Suspense> so it renders even while assets are loading.
 */
function LoadingBridge({ onProgress }: { onProgress: (active: boolean) => void }) {
  const { active } = useProgress();
  useEffect(() => {
    onProgress(active);
  }, [active, onProgress]);
  return null;
}

// ─── Accessory registry ──────────────────────────────────────────────────────

const ACCESSORY_GLBS: Record<string, string> = {
  lightBarArch:     '/models/lightBarArch.glb',
  fishingRod:       '/models/fishingRod.glb',
  telescopicLadder: '/models/telescopicLadder.glb',
  fixedBimini:      '/models/fixedBimini.glb',
  FoldingBimini:    '/models/FoldingBimini.glb',
};

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

        {/* Loading tracker — outside Suspense so it fires during asset fetch */}
        <LoadingBridge onProgress={handleProgress} />

        {/* ── Showroom lighting rig ───────────────────────────────────────── */}
        {/* Strong ambient so no face is pure black */}
        <ambientLight intensity={3.0} />
        {/* Key light — top-front-right */}
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
        {/* Fill light — top-left-rear */}
        <directionalLight position={[-6, 5, -4]} intensity={2.5} />
        {/* Rim / back light */}
        <directionalLight position={[0, 4, -9]} intensity={2.0} />
        {/* Front fill — eye-level */}
        <directionalLight position={[0, 1, 9]} intensity={1.8} />
        {/* Overhead point for top surfaces */}
        <pointLight position={[0, 7, 0]} intensity={3.0} color="#ffffff" distance={20} />

        {/* ── 3D Models ──────────────────────────────────────────────────── */}
        <Suspense fallback={null}>
          <HullModel glbPath={hullGlb} build={build} />
          <ConsoleModel glbPath={consoleGlb} />
          <EngineModel glbPath={engineGlb} color={build.engineColor} />
          {build.accessories.map((accId) => {
            const glb = ACCESSORY_GLBS[accId];
            return glb ? <AccessoryModel key={accId} glbPath={glb} /> : null;
          })}
        </Suspense>

        {/* Subtle shadow under the boat */}
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
