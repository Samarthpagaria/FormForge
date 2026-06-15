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
}

interface FormBuilderState {
  fields: FormElement[];
  activeElementId: string | null;
  addField: (type: FieldType, index?: number) => void;
  removeField: (id: string) => void;
  updateFieldProps: (id: string, updates: Partial<FormElement>) => void;
  reorderFields: (activeId: string, overId: string) => void;
  setActiveField: (id: string | null) => void;
}

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  fields: [],
  activeElementId: null,
  
  addField: (type, index) => {
    const newField: FormElement = {
      id: crypto.randomUUID(),
      type,
      label: 'New Field',
      required: false,
      width: 'full',
      placeholder: 'Enter a value...',
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
  
  removeField: (id) => set((state) => ({ 
    fields: state.fields.filter(f => f.id !== id),
    activeElementId: state.activeElementId === id ? null : state.activeElementId
  })),
  
  updateFieldProps: (id, updates) => set((state) => ({
    fields: state.fields.map(f => f.id === id ? { ...f, ...updates } : f)
  })),
  
  reorderFields: (activeId, overId) => set((state) => {
    const oldIndex = state.fields.findIndex(f => f.id === activeId);
    const newIndex = state.fields.findIndex(f => f.id === overId);
    if (oldIndex === -1 || newIndex === -1) return state;
    
    const newFields = [...state.fields];
    const [moved] = newFields.splice(oldIndex, 1);
    if (moved) {
      newFields.splice(newIndex, 0, moved);
    }
    return { fields: newFields };
  }),
  
  setActiveField: (id) => set({ activeElementId: id }),
}));
