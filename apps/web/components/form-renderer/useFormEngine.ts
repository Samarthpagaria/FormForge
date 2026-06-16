import { useState } from "react";
import { FormSchema, validateField, validateForm } from "@formforge/form-engine";

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

  const handleValidateField = (fieldId: string, val: any): string | null => {
    const field = schema.fields.find(f => f.id === fieldId);
    if (!field) return null;
    return validateField(field, val);
  };

  const validateAll = (): boolean => {
    const { valid, errors: newErrors } = validateForm(schema, values);
    setErrors(newErrors);
    return valid;
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
    validateField: handleValidateField,
    validateAll,
    handleSubmit,
    setErrors
  };
}
