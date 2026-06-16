import { create } from 'zustand';

export type FieldType = 'short_text' | 'long_text' | 'email' | 'phone' | 'number' | 'dropdown' | 'radio' | 'checkbox' | 'date' | 'file' | 'rating';

export interface FormElement {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  width: 'half' | 'full';
  options?: string[]; // For choice fields
  minValue?: number;  // For number fields
  maxValue?: number;  // For number fields
  ratingMax?: number; // For rating fields (default 5)
  acceptedFiles?: string; // For file fields e.g. ".pdf,.png"
}

interface FormBuilderState {
  fields: FormElement[];
  activeElementId: string | null;
  addField: (type: FieldType, index?: number, initialProps?: Partial<Omit<FormElement, 'id' | 'type'>>) => void;
  removeField: (id: string) => void;
  duplicateField: (id: string) => void;
  updateFieldProps: (id: string, updates: Partial<FormElement>) => void;
  reorderFields: (activeId: string, overId: string) => void;
  setActiveField: (id: string | null) => void;
  setFields: (fields: FormElement[]) => void;
}

const genId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `field-${Math.random().toString(36).substr(2, 9)}`;

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  fields: [],
  activeElementId: null,

  addField: (type, index, initialProps) => {
    const newField: FormElement = {
      id: genId(),
      type,
      label: 'New Field',
      required: false,
      width: 'full',
      placeholder: 'Enter a value...',
      options: ['dropdown', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      ratingMax: type === 'rating' ? 5 : undefined,
      ...initialProps,
    };
    set((state) => {
      const newFields = [...state.fields];
      if (index !== undefined) {
        newFields.splice(index, 0, newField);
      } else {
        newFields.push(newField);
      }
      return { fields: newFields, activeElementId: newField.id };
    });
  },

  removeField: (id) =>
    set((state) => ({
      fields: state.fields.filter((f) => f.id !== id),
      activeElementId: state.activeElementId === id ? null : state.activeElementId,
    })),

  duplicateField: (id) =>
    set((state) => {
      const index = state.fields.findIndex((f) => f.id === id);
      if (index === -1) return state;
      const original = state.fields[index]!;
      const clone: FormElement = {
        ...original,
        id: genId(),
        label: `${original.label} (copy)`,
      };
      const newFields = [...state.fields];
      newFields.splice(index + 1, 0, clone);
      return { fields: newFields, activeElementId: clone.id };
    }),

  updateFieldProps: (id, updates) =>
    set((state) => ({
      fields: state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  reorderFields: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.fields.findIndex((f) => f.id === activeId);
      const newIndex = state.fields.findIndex((f) => f.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      const newFields = [...state.fields];
      const [moved] = newFields.splice(oldIndex, 1);
      if (moved) newFields.splice(newIndex, 0, moved);
      return { fields: newFields };
    }),

  setActiveField: (id) => set({ activeElementId: id }),
  setFields: (fields) => set({ fields, activeElementId: null }),
}));
