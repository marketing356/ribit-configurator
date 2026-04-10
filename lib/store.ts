import { create } from 'zustand';
import { BuildOptions, BOAT_CONFIGS } from './boatConfig';

interface ConfiguratorState {
  build: BuildOptions;
  showQuoteModal: boolean;
  isLoadingModel: boolean;
  
  setBuild: (partial: Partial<BuildOptions>) => void;
  setBoat: (boatId: string) => void;
  toggleAccessory: (id: string) => void;
  setShowQuoteModal: (v: boolean) => void;
  setLoadingModel: (v: boolean) => void;
  resetBuild: () => void;
}

const defaultBuild = BOAT_CONFIGS[0].defaultOptions;

export const useConfigStore = create<ConfiguratorState>((set, get) => ({
  build: defaultBuild,
  showQuoteModal: false,
  isLoadingModel: false,

  setBuild: (partial) =>
    set((state) => ({ build: { ...state.build, ...partial } })),

  setBoat: (boatId) => {
    const config = BOAT_CONFIGS.find((b) => b.id === boatId);
    if (config) {
      set({ build: { ...config.defaultOptions } });
    }
  },

  toggleAccessory: (id) => {
    const { build } = get();
    const accessories = build.accessories.includes(id)
      ? build.accessories.filter((a) => a !== id)
      : [...build.accessories, id];
    set({ build: { ...build, accessories } });
  },

  setShowQuoteModal: (v) => set({ showQuoteModal: v }),
  setLoadingModel: (v) => set({ isLoadingModel: v }),
  
  resetBuild: () => {
    const config = BOAT_CONFIGS.find((b) => b.id === get().build.boatId);
    if (config) set({ build: { ...config.defaultOptions } });
  },
}));
