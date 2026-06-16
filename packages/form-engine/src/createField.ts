import { FieldType, FormField } from "./types";
import { FIELD_DEFAULTS } from "./constants";

export function createField(type: FieldType): FormField {
  const defaults = FIELD_DEFAULTS[type];
  return {
    id: `f_${Math.random().toString(36).substring(2, 9)}`,
    type,
    label: defaults.label,
    placeholder: defaults.placeholder,
    options: defaults.options,
    required: false,
    width: "full",
  };
}
