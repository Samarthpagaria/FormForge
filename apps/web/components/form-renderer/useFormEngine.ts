import { useState } from "react";
import { FormSchema } from "./schema";

export function useFormEngine(schema: FormSchema, onSubmit?: (data: Record<string, any>) => void) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (fieldId: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
    // Clear error on change
    if (errors[fieldId]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validateField = (fieldId: string, val: any): string | null => {
    const field = schema.fields.find(f => f.id === fieldId);
    if (!field) return null;

    if (field.required) {
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        return "This field is required";
      }
    }
    
    // Basic email validation if not empty
    if (field.type === "email" && val && typeof val === "string") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        return "Please enter a valid email address";
      }
    }

    return null;
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    for (const field of schema.fields) {
      const error = validateField(field.id, values[field.id]);
      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateAll()) {
      setIsSubmitting(true);
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }
      setIsSubmitting(false);
      return true; // Success
    }
    return false; // Failed validation
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    validateField,
    validateAll,
    handleSubmit,
    setErrors
  };
}
