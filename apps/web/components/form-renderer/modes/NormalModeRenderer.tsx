import React from "react";
import { FormSchema, FormField } from "../schema";
import { FieldText, FieldTextarea, FieldDatePicker, FieldRadioGroup, FieldCheckboxGroup, FieldRating, FieldSelect, FieldFallback } from "../fields";
import { motion } from "framer-motion";

export interface ModeRendererProps {
  schema: FormSchema;
  disabled?: boolean;
  submitLabel?: string;
  className?: string;
  forceMobile?: boolean;
  engine: {
    values: Record<string, any>;
    errors: Record<string, string>;
    isSubmitting: boolean;
    handleChange: (fieldId: string, value: any) => void;
    handleSubmit: () => Promise<boolean>;
  };
}

export function NormalModeRenderer({ schema, disabled = false, submitLabel = "Submit Form", className = "", forceMobile = false, engine }: ModeRendererProps) {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = engine;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    await handleSubmit();
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      field,
      disabled: disabled || isSubmitting,
      value: values[field.id],
      onChange: (val: any) => handleChange(field.id, val),
      error: errors[field.id]
    };

    switch (field.type) {
      case "short_text":
      case "text":
      case "name":
      case "email":
      case "phone":
      case "number":
      case "file":
        return <FieldText {...commonProps} />;
      case "date":
        return <FieldDatePicker {...commonProps} />;
      case "long_text":
      case "textarea":
        return <FieldTextarea {...commonProps} />;
      case "radio":
        return <FieldRadioGroup {...commonProps} />;
      case "checkbox":
        return <FieldCheckboxGroup {...commonProps} />;
      case "select":
      case "dropdown":
        return <FieldSelect {...commonProps} />;
      case "rating":
        return <FieldRating {...commonProps} />;
      default:
        return <FieldFallback {...commonProps} />;
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className={`flex flex-col gap-8 w-full max-w-[640px] mx-auto bg-white p-8 rounded-3xl shadow-sm border border-neutral-200/60 ${className}`}>
      {/* Form Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">{schema.title}</h1>
        {schema.description && (
          <p className="text-neutral-500 text-sm leading-relaxed">{schema.description}</p>
        )}
      </div>

      <div className="h-px w-full bg-neutral-200/60" />

      {/* Fields */}
      {schema.fields.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <p className="text-neutral-400 text-sm font-medium">No fields added yet</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${forceMobile ? '' : 'sm:grid-cols-2'} gap-x-4 gap-y-6`}>
          {schema.fields.map((field) => (
            <motion.div 
              key={field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex flex-col gap-2 group ${field.width === 'half' && !forceMobile ? 'col-span-1' : `col-span-1 ${forceMobile ? '' : 'sm:col-span-2'}`}`}
            >
              <label className="text-sm font-semibold text-neutral-800 tracking-tight flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500 font-bold">*</span>}
              </label>
              {field.description && (
                <p className="text-xs text-neutral-500 mb-1">{field.description}</p>
              )}
              {renderField(field)}
            </motion.div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      {schema.fields.length > 0 && (
        <div className="pt-4 mt-2">
          <button
            type="submit"
            disabled={disabled || isSubmitting}
            className="w-full py-3.5 px-4 bg-[#5b21b6] text-white rounded-xl font-bold text-sm shadow-sm transition-all hover:bg-[#4c1d95] hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-sm"
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
