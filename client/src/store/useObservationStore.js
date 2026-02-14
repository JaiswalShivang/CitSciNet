import { create } from 'zustand';

const useObservationStore = create((set, get) => ({
    observations: [],
    selectedObservation: null,
    isConnected: false,
    clientCount: 0,

    setObservations: (observations) => set({ observations }),

    addObservation: (observation) =>
        set((state) => ({
            observations: [observation, ...state.observations],
        })),

    removeObservation: (id) =>
        set((state) => ({
            observations: state.observations.filter((o) => o.id !== id),
            selectedObservation:
                state.selectedObservation?.id === id ? null : state.selectedObservation,
        })),

    setSelectedObservation: (observation) =>
        set({ selectedObservation: observation }),

    setConnected: (isConnected) => set({ isConnected }),

    setClientCount: (clientCount) => set({ clientCount }),
}));

export default useObservationStore;
