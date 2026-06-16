import { FormField } from "./types";

export function validateField(field: FormField, val: any): string | null {
  if (field.required) {
    if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
      return "This field is required";
    }
  }

  if (val === undefined || val === null || val === "") return null;

  // Basic email validation
  if (field.type === "email" && typeof val === "string") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      return "Please enter a valid email address";
    }
  }

  // Number validation
  if (field.type === "number") {
    const num = Number(val);
    if (isNaN(num)) return "Must be a valid number";
    if (field.validation?.min !== undefined && num < field.validation.min) {
      return `Must be at least ${field.validation.min}`;
    }
    if (field.validation?.max !== undefined && num > field.validation.max) {
      return `Must be no more than ${field.validation.max}`;
    }
  }

  // Pattern validation
  if (field.validation?.pattern && typeof val === "string") {
    try {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(val)) {
        return field.validation.customErrorMessage || "Invalid format";
      }
    } catch (e) {
      // Invalid regex pattern
    }
  }

  return null;
}
