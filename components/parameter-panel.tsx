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
import { RESOLUTIONS, GenerationParams } from "@/lib/validations";

interface ParameterPanelProps {
  register: UseFormRegister<GenerationParams>;
  watch: UseFormWatch<GenerationParams>;
  setValue: (name: keyof GenerationParams, value: any) => void;
}

export function ParameterPanel({ register, watch, setValue }: ParameterPanelProps) {
  const resolution = watch("resolution");
  const numInferenceSteps = watch("num_inference_steps");
  const guidanceScale = watch("guidance_scale");
  const guidanceScale2 = watch("guidance_scale_2");
  const numFrames = watch("num_frames");
  const fps = watch("fps");

  return (
    <Accordion type="single" collapsible defaultValue="parameters" className="w-full">
      <AccordionItem value="parameters">
        <AccordionTrigger>Generation Parameters</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6 pt-4">
            {/* Resolution */}
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution</Label>
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
            </div>

            {/* Inference Steps */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="num_inference_steps">Inference Steps</Label>
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
                <Label htmlFor="guidance_scale">Guidance Scale</Label>
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
                Controls how closely the video follows the prompt
              </p>
            </div>

            {/* Guidance Scale 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="guidance_scale_2">Guidance Scale 2</Label>
                <span className="text-sm text-muted-foreground">
                  {guidanceScale2.toFixed(1)}
                </span>
              </div>
              <Slider
                id="guidance_scale_2"
                min={1}
                max={20}
                step={0.5}
                value={[guidanceScale2]}
                onValueChange={([value]) => setValue("guidance_scale_2", value)}
              />
              <p className="text-xs text-muted-foreground">
                Secondary guidance parameter for fine-tuning
              </p>
            </div>

            {/* Number of Frames */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="num_frames">Number of Frames</Label>
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
                <Label htmlFor="fps">Frames Per Second (FPS)</Label>
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
              <Label htmlFor="seed">Seed (Optional)</Label>
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
  );
}
