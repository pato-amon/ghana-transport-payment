// frontend/src/store/paymentStore.js
import { create } from 'zustand';

const usePaymentStore = create((set) => ({
    currentTrip: null,
    pendingPayment: null,
    recentTrips: [],

    setCurrentTrip: (trip) => set({ currentTrip: trip }),

    setPendingPayment: (payment) => set({ pendingPayment: payment }),

    addTrip: (trip) => set((state) => ({
        recentTrips: [trip, ...state.recentTrips].slice(0, 50)
    })),

    clearPending: () => set({ pendingPayment: null, currentTrip: null }),
}));

export default usePaymentStore;