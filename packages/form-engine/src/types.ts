export type FieldType = "text" | "short_text" | "long_text" | "name" | "email" | "phone" | "number" | "textarea" | "select" | "dropdown" | "radio" | "checkbox" | "date" | "file" | "rating" | "password" | "time" | "datetime" | "color" | "range" | "url" | "hidden" | "tel";

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
