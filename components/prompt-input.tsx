"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldError } from "react-hook-form";

interface PromptInputProps {
  register: UseFormRegister<any>;
  error?: FieldError;
  value?: string;
  maxLength?: number;
}

export function PromptInput({
  register,
  error,
  value = "",
  maxLength = 1000,
}: PromptInputProps) {
  const currentLength = value?.length || 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="prompt">Prompt</Label>
        <span className="text-sm text-muted-foreground">
          {currentLength}/{maxLength}
        </span>
      </div>
      <Textarea
        id="prompt"
        placeholder="Describe the video you want to generate..."
        className="min-h-[120px] resize-none"
        maxLength={maxLength}
        {...register("prompt")}
      />
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}
