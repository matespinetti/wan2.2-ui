"use client";

import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RESOLUTIONS, GenerationParams } from "@/lib/validations";
import { HelpCircle } from "lucide-react";

interface ParameterPanelProps {
  register: UseFormRegister<GenerationParams>;
  watch: UseFormWatch<GenerationParams>;
  setValue: (name: keyof GenerationParams, value: any) => void;
}

export function ParameterPanel({ register, watch, setValue }: ParameterPanelProps) {
  const resolution = watch("resolution");
  const numInferenceSteps = watch("num_inference_steps");
  const guidanceScale = watch("guidance_scale");
  const numFrames = watch("num_frames");
  const fps = watch("fps");

  return (
    <TooltipProvider>
      <Accordion type="single" collapsible defaultValue="parameters" className="w-full">
        <AccordionItem value="parameters">
          <AccordionTrigger>Generation Parameters</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4">
            {/* Resolution */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="resolution">Resolution</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Reference only - the actual resolution is automatically calculated from your uploaded image dimensions</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={resolution}
                onValueChange={(value) => setValue("resolution", value)}
              >
                <SelectTrigger id="resolution">
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  {RESOLUTIONS.map((res) => (
                    <SelectItem key={res.value} value={res.value}>
                      {res.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                For reference - actual resolution calculated from image
              </p>
            </div>

            {/* Inference Steps */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="num_inference_steps">Inference Steps</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Number of denoising steps - higher values produce better quality but take longer to generate</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm text-muted-foreground">
                  {numInferenceSteps}
                </span>
              </div>
              <Slider
                id="num_inference_steps"
                min={20}
                max={50}
                step={1}
                value={[numInferenceSteps]}
                onValueChange={([value]) => setValue("num_inference_steps", value)}
              />
              <p className="text-xs text-muted-foreground">
                Higher values produce better quality but take longer
              </p>
            </div>

            {/* Guidance Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="guidance_scale">Guidance Scale</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Controls how closely the video follows your prompt - higher values mean stronger adherence to the text description</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm text-muted-foreground">
                  {guidanceScale.toFixed(1)}
                </span>
              </div>
              <Slider
                id="guidance_scale"
                min={1}
                max={20}
                step={0.5}
                value={[guidanceScale]}
                onValueChange={([value]) => setValue("guidance_scale", value)}
              />
              <p className="text-xs text-muted-foreground">
                How closely the video follows the prompt (higher = more influence)
              </p>
            </div>

            {/* Number of Frames */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="num_frames">Number of Frames</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Total number of frames in the output video - more frames create a longer duration video</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm text-muted-foreground">{numFrames}</span>
              </div>
              <Slider
                id="num_frames"
                min={25}
                max={81}
                step={1}
                value={[numFrames]}
                onValueChange={([value]) => setValue("num_frames", value)}
              />
              <p className="text-xs text-muted-foreground">
                More frames = longer video
              </p>
            </div>

            {/* FPS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="fps">Frames Per Second (FPS)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Playback speed of the video - higher FPS creates smoother, faster motion</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm text-muted-foreground">{fps}</span>
              </div>
              <Slider
                id="fps"
                min={8}
                max={30}
                step={1}
                value={[fps]}
                onValueChange={([value]) => setValue("fps", value)}
              />
              <p className="text-xs text-muted-foreground">
                Higher FPS = smoother motion
              </p>
            </div>

            {/* Seed (Optional) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="seed">Seed (Optional)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Random seed for reproducible results - use the same seed with identical settings to generate similar videos</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="seed"
                type="number"
                placeholder="Random if not set"
                {...register("seed", {
                  setValueAs: (value) => (value === "" || value === null) ? undefined : Number(value)
                })}
              />
              <p className="text-xs text-muted-foreground">
                Use same seed for reproducible results
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    </TooltipProvider>
  );
}
