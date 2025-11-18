"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UseFormRegister, FieldError } from "react-hook-form";
import { HelpCircle } from "lucide-react";

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
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="prompt">Prompt (Optional)</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Guide the video generation with a text description - optional but recommended for better control over motion, style, and scene</p>
              </TooltipContent>
            </Tooltip>
          </div>
        <span className="text-sm text-muted-foreground">
          {currentLength}/{maxLength}
        </span>
      </div>
      <Textarea
        id="prompt"
        placeholder="e.g., A dog running through a forest, cinematic lighting, slow motion..."
        className="min-h-[100px] resize-none"
        maxLength={maxLength}
        {...register("prompt")}
      />
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
      {!error && (
        <p className="text-sm text-muted-foreground">
          Describe the motion, style, or scene you want. Optional but recommended for better results.
        </p>
      )}
      </div>
    </TooltipProvider>
  );
}
