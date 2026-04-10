// Boat configuration data — add new boats here only
// Each boat is a config object; the system is fully data-driven.

export interface ColorOption {
  id: string;
  label: string;
  hex: string;
}

export interface AccessoryOption {
  id: string;
  label: string;
  glb: string;
}

export interface BoatConfig {
  id: string;
  name: string;
  size: string;
  type: 'hybrid' | 'classic';
  description: string;
  hullGlb: string;
  specs: {
    length: string;
    beam: string;
    capacity: string;
    weight: string;
    maxHP: string;
  };
  defaultOptions: BuildOptions;
  availableConsoles: { id: string; label: string; glb: string }[];
}

export interface BuildOptions {
  boatId: string;
  consoleType: string;
  powderCoat: string;
  evaColor: string;
  engineType: string;
  engineColor: string;
  seatColorType: 'twoTone' | 'solid';
  insideSeatColor: string;
  outsideSeatColor: string;
  tubeColor: string;
  stripePattern: number; // 1-5
  stripeColor: string;
  accessories: string[];
}

export const POWDER_COAT_COLORS: ColorOption[] = [
  { id: 'white', label: 'White', hex: '#F5F5F5' },
  { id: 'black', label: 'Black', hex: '#1A1A1A' },
  { id: 'gray', label: 'Gray', hex: '#808080' },
  { id: 'navy', label: 'Navy', hex: '#1B2A4A' },
  { id: 'red', label: 'Red', hex: '#CC2222' },
];

export const EVA_COLORS: ColorOption[] = [
  { id: 'brownBlack', label: 'Brown / Black', hex: '#3D2B1F' },
  { id: 'gray', label: 'Gray', hex: '#9E9E9E' },
  { id: 'blue', label: 'Blue', hex: '#1E4080' },
];

export const ENGINE_COLORS: ColorOption[] = [
  { id: 'white', label: 'White', hex: '#F5F5F5' },
  { id: 'black', label: 'Black', hex: '#1A1A1A' },
  { id: 'gray', label: 'Gray', hex: '#808080' },
];

export const INSIDE_SEAT_COLORS: ColorOption[] = [
  { id: 'white', label: 'White', hex: '#F0EEE8' },
  { id: 'navy', label: 'Navy', hex: '#1B2A4A' },
  { id: 'gray', label: 'Gray', hex: '#9E9E9E' },
];

export const OUTSIDE_SEAT_COLORS: ColorOption[] = [
  { id: 'white', label: 'White', hex: '#F0EEE8' },
  { id: 'navy', label: 'Navy', hex: '#1B2A4A' },
  { id: 'deepNavy', label: 'Deep Navy', hex: '#0D1B35' },
];

export const TUBE_COLORS: ColorOption[] = [
  { id: 'white', label: 'White', hex: '#F5F5F5' },
  { id: 'gray', label: 'Gray', hex: '#9E9E9E' },
  { id: 'navy', label: 'Navy', hex: '#1B2A4A' },
  { id: 'black', label: 'Black', hex: '#1A1A1A' },
];

export const STRIPE_COLORS: ColorOption[] = [
  { id: 'deepNavy', label: 'Deep Navy', hex: '#0D1B35' },
  { id: 'white', label: 'White', hex: '#F5F5F5' },
  { id: 'red', label: 'Red', hex: '#CC2222' },
];

export const ACCESSORIES: AccessoryOption[] = [
  { id: 'lightBarArch', label: 'Light Bar Arch', glb: '/models/lightBarArch.glb' },
  { id: 'fishingRod', label: 'Fishing Rod Holder', glb: '/models/fishingRod.glb' },
  { id: 'telescopicLadder', label: 'Telescopic Ladder', glb: '/models/telescopicLadder.glb' },
  { id: 'fixedBimini', label: 'Fixed Bimini Top', glb: '/models/fixedBimini.glb' },
  { id: 'FoldingBimini', label: 'Folding Bimini Top', glb: '/models/FoldingBimini.glb' },
];

export const CONSOLES = [
  { id: 'centerConsoleClassic', label: 'Classic Center Console', glb: '/models/centerConsoleClassic.glb' },
  { id: 'centerConsoleClassicNoSide', label: 'Classic Center Console (No Side Seat)', glb: '/models/centerConsoleHybrid.glb' },
];

export const BOAT_CONFIGS: BoatConfig[] = [
  {
    id: 'H390',
    name: 'RIBIT H390',
    size: '13ft',
    type: 'hybrid',
    description: '13ft Hybrid RIB — nimble, versatile, built for coastal adventure.',
    hullGlb: '/models/boat390.glb',
    specs: {
      length: '13 ft (3.9m)',
      beam: '6.2 ft (1.9m)',
      capacity: '6 persons / 900 lbs',
      weight: '485 lbs (hull)',
      maxHP: '60 HP',
    },
    defaultOptions: {
      boatId: 'H390',
      consoleType: 'centerConsoleClassic',
      powderCoat: 'white',
      evaColor: 'gray',
      engineType: 'suzuki',
      engineColor: 'white',
      seatColorType: 'twoTone',
      insideSeatColor: 'white',
      outsideSeatColor: 'navy',
      tubeColor: 'gray',
      stripePattern: 1,
      stripeColor: 'deepNavy',
      accessories: [],
    },
    availableConsoles: CONSOLES,
  },
  {
    id: 'H420',
    name: 'RIBIT H420',
    size: '14ft',
    type: 'hybrid',
    description: '14ft Hybrid RIB — more room, more power, same precision handling.',
    hullGlb: '/models/boat420.glb',
    specs: {
      length: '14 ft (4.2m)',
      beam: '6.6 ft (2.0m)',
      capacity: '7 persons / 1100 lbs',
      weight: '540 lbs (hull)',
      maxHP: '90 HP',
    },
    defaultOptions: {
      boatId: 'H420',
      consoleType: 'centerConsoleClassic',
      powderCoat: 'white',
      evaColor: 'gray',
      engineType: 'suzuki',
      engineColor: 'white',
      seatColorType: 'twoTone',
      insideSeatColor: 'white',
      outsideSeatColor: 'navy',
      tubeColor: 'gray',
      stripePattern: 1,
      stripeColor: 'deepNavy',
      accessories: [],
    },
    availableConsoles: CONSOLES,
  },
];

export function getBoatConfig(id: string): BoatConfig | undefined {
  return BOAT_CONFIGS.find((b) => b.id === id);
}

export function getColorHex(colors: ColorOption[], id: string): string {
  return colors.find((c) => c.id === id)?.hex ?? '#808080';
}
