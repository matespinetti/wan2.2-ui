"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DEFAULT_PRESETS, Preset, GenerationParams } from "@/lib/validations";
import { useGenerationStore } from "@/lib/store";
import { Sparkles, Zap, Crown, Pencil } from "lucide-react";

interface PresetSelectorProps {
  onSelect: (params: Partial<GenerationParams>) => void;
}

const PRESET_ICONS = {
  draft: Zap,
  balanced: Sparkles,
  "high-quality": Crown,
  sketch: Pencil,
};

export function PresetSelector({ onSelect }: PresetSelectorProps) {
  const { selectedPresetId, selectPreset } = useGenerationStore();

  const handlePresetClick = (preset: Preset) => {
    selectPreset(preset.id);
    onSelect(preset.params);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Quick Presets</h3>
      <div className="grid grid-cols-2 gap-2">
        {DEFAULT_PRESETS.map((preset) => {
          const Icon = PRESET_ICONS[preset.type as keyof typeof PRESET_ICONS];
          const isSelected = selectedPresetId === preset.id;

          return (
            <Button
              key={preset.id}
              type="button"
              variant={isSelected ? "default" : "outline"}
              className="h-auto flex-col items-start gap-1 p-3"
              onClick={() => handlePresetClick(preset)}
            >
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                <span className="font-semibold">{preset.name}</span>
              </div>
              {preset.description && (
                <span className="text-xs text-left text-muted-foreground line-clamp-2">
                  {preset.description}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
