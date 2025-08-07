// client/src/store/appStore.ts
import { create } from "zustand";

interface AppState {
  selectedWarehouseId: number | null;
  setSelectedWarehouseId: (id: number) => void;
  selectedZoneId: number | null;
  setSelectedZoneId: (id: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedWarehouseId: null,
  setSelectedWarehouseId: (id) => set({ selectedWarehouseId: id }),

  selectedZoneId: null,
  setSelectedZoneId: (id) => set({ selectedZoneId: id }),
}));
