export type FieldType = "text" | "email" | "phone" | "number" | "textarea" | "select" | "radio" | "checkbox" | "date" | "file" | "rating";

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  customErrorMessage?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  placeholder?: string;
  width?: "full" | "half";
  validation?: FieldValidation;
}

export interface FormSettings {
  closeAfterResponses?: number;
  successMessage?: string;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
}

export type FormMode = "normal" | "chat" | "terminal" | "one-by-one" | "swipe" | "story" | "slide";
