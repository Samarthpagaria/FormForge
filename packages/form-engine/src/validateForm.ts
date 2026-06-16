import { FormSchema } from "./types";
import { validateField } from "./validateField";

export function validateForm(schema: FormSchema, answers: Record<string, any>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let valid = true;

  for (const field of schema.fields) {
    const error = validateField(field, answers[field.id]);
    if (error) {
      errors[field.id] = error;
      valid = false;
    }
  }

  return { valid, errors };
}
