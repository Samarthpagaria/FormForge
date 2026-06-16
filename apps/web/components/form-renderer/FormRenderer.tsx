import React from "react";
import { FormSchema } from "./schema";
import { useFormEngine } from "./useFormEngine";
import { NormalModeRenderer } from "./modes/NormalModeRenderer";
import { ChatModeRenderer } from "./modes/ChatModeRenderer";
import { TerminalModeRenderer } from "./modes/TerminalModeRenderer";
import { OneByOneModeRenderer } from "./modes/OneByOneModeRenderer";
import { SwipeModeRenderer } from "./modes/SwipeModeRenderer";
import { StoryModeRenderer } from "./modes/StoryModeRenderer";
import { SlideModeRenderer } from "./modes/SlideModeRenderer";

interface FormRendererProps {
  schema: FormSchema;
  mode?: "normal" | "chat" | "terminal" | "one-by-one" | "swipe" | "story" | "slide" | string;
  disabled?: boolean;
  onSubmit?: (data: Record<string, any>) => void;
  submitLabel?: string;
  className?: string;
  forceMobile?: boolean;
}

export function FormRenderer({ 
  schema, 
  mode = "normal", 
  disabled = false, 
  onSubmit, 
  submitLabel = "Submit Form", 
  className = "",
  forceMobile = false
}: FormRendererProps) {
  
  const engine = useFormEngine(schema, onSubmit);

  const commonProps = {
    schema,
    disabled,
    submitLabel,
    className,
    forceMobile,
    engine
  };

  switch (mode) {
    case "chat":
      return <ChatModeRenderer {...commonProps} />;
    case "terminal":
      return <TerminalModeRenderer {...commonProps} />;
    case "one-by-one":
      return <OneByOneModeRenderer {...commonProps} />;
    case "swipe":
      return <SwipeModeRenderer {...commonProps} />;
    case "story":
      return <StoryModeRenderer {...commonProps} />;
    case "slide":
      return <SlideModeRenderer {...commonProps} />;
    case "normal":
    default:
      return <NormalModeRenderer {...commonProps} />;
  }
}
