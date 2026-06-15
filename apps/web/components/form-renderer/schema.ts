export type FieldType = "text" | "email" | "phone" | "number" | "textarea" | "select" | "radio" | "checkbox" | "date" | "file" | "rating";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  placeholder?: string;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  settings: {
    closeAfterResponses?: number;
    successMessage?: string;
  };
}

export const DUMMY_FORM_SCHEMA: FormSchema = {
  id: "form_123abc",
  title: "Customer Feedback Form",
  description: "Please fill out this short survey to help us improve our services.",
  fields: [
    {
      id: "f_1",
      type: "text",
      label: "Full Name",
      placeholder: "e.g. Jane Doe",
      required: true,
    },
    {
      id: "f_2",
      type: "email",
      label: "Email Address",
      placeholder: "jane@example.com",
      required: true,
    },
    {
      id: "f_3",
      type: "radio",
      label: "How satisfied are you?",
      required: true,
      options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
    },
    {
      id: "f_4",
      type: "textarea",
      label: "Message",
      placeholder: "Tell us more about your experience...",
      required: false,
    },
    {
      id: "f_5",
      type: "checkbox",
      label: "Did you face any issues?",
      required: false,
      options: ["Slow performance", "Poor UI", "Missing features", "Bugs/Errors"],
    },
    {
      id: "f_6",
      type: "rating",
      label: "Overall Rating",
      required: true,
    }
  ],
  settings: {
    successMessage: "Thank you for your valuable feedback!",
  }
};
