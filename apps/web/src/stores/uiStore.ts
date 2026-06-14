import {create} from "zustand"

interface UIStore {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;

    activeModal: string | null;
    openModal: (modal: string) => void;
    closeModal: () => void;

}


export const useUIStore = create<UIStore>((set) => ({
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

    activeModal: null,
    openModal: (modal: string) => set({ activeModal: modal }),
    closeModal: () => set({ activeModal: null }),
}));