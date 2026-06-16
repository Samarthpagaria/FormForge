import { FormSchema } from "@formforge/form-engine";

export * from "@formforge/form-engine";

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
      width: "full",
    },
    {
      id: "f_2",
      type: "email",
      label: "Email Address",
      placeholder: "jane@example.com",
      required: true,
      width: "full",
    },
    {
      id: "f_3",
      type: "radio",
      label: "How satisfied are you?",
      required: true,
      options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
      width: "full",
    },
    {
      id: "f_4",
      type: "textarea",
      label: "Message",
      placeholder: "Tell us more about your experience...",
      required: false,
      width: "full",
    },
    {
      id: "f_5",
      type: "checkbox",
      label: "Did you face any issues?",
      required: false,
      options: ["Slow performance", "Poor UI", "Missing features", "Bugs/Errors"],
      width: "full",
    },
    {
      id: "f_6",
      type: "rating",
      label: "Overall Rating",
      required: true,
      width: "full",
    }
  ],
  settings: {
    successMessage: "Thank you for your valuable feedback!",
  }
};
