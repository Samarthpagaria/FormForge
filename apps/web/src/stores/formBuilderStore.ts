import { create } from "zustand";

export interface FormField {
  id: string;
  key: string;
  type: "text" | "email" | "tel" | "number" | "textarea" | "select" | "checkbox" | "radio" | "date" | "file";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormBuilderStore {
  fields: FormField[];
  selectedFieldId: string | null;

  addField: (field: FormField) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  reorderFields: (fromIndex: number, toIndex: number) => void;
  setSelectedField: (id: string | null) => void;
  clearFields: () => void;
}

export const useFormBuilderStore = create<FormBuilderStore>((set) => ({
  fields: [],
  selectedFieldId: null,

  addField: (field) =>
    set((state) => ({ fields: [...state.fields, field] })),

  removeField: (id) =>
    set((state) => ({ fields: state.fields.filter((f) => f.id !== id) })),

  updateField: (id, updates) =>
    set((state) => ({
      fields: state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  reorderFields: (fromIndex, toIndex) =>
    set((state) => {
      const fields = [...state.fields];
      const [moved] = fields.splice(fromIndex, 1);
      if (moved) {
        fields.splice(toIndex, 0, moved);
      }
      return { fields };
    }),

  setSelectedField: (id) => set({ selectedFieldId: id }),

  clearFields: () => set({ fields: [], selectedFieldId: null }),
}));