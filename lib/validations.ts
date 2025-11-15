import { z } from "zod";

// Resolution options (dimensions must be multiples of 16 for Wan 2.2 model)
export const RESOLUTIONS = [
  { value: "480p", label: "480p (864x480)", width: 864, height: 480 },
  { value: "720p", label: "720p (1280x720)", width: 1280, height: 720 },
] as const;

export type Resolution = (typeof RESOLUTIONS)[number]["value"];

// Validation schema for generation parameters
export const generationParamsSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(1000, "Prompt must be less than 1000 characters"),
  resolution: z.enum(["480p", "720p"]).default("720p"),
  num_inference_steps: z
    .number()
    .int()
    .min(20, "Must be at least 20 steps")
    .max(50, "Must be at most 50 steps")
    .default(30),
  guidance_scale: z
    .number()
    .min(1, "Must be at least 1")
    .max(20, "Must be at most 20")
    .default(7.5),
  guidance_scale_2: z
    .number()
    .min(1, "Must be at least 1")
    .max(20, "Must be at most 20")
    .default(7.5),
  num_frames: z
    .number()
    .int()
    .min(25, "Must be at least 25 frames")
    .max(81, "Must be at most 81 frames")
    .default(49),
  fps: z
    .number()
    .int()
    .min(8, "Must be at least 8 FPS")
    .max(30, "Must be at most 30 FPS")
    .default(16),
  seed: z.number().int().optional(),
});

export type GenerationParams = z.infer<typeof generationParamsSchema>;

// Preset configurations
export type PresetType = "draft" | "balanced" | "high-quality" | "sketch" | "custom";

export interface Preset {
  id: string;
  name: string;
  type: PresetType;
  params: Partial<GenerationParams>;
  description?: string;
}

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: "draft",
    name: "Draft",
    type: "draft",
    description: "Quick preview with lower quality",
    params: {
      resolution: "480p",
      num_inference_steps: 20,
      guidance_scale: 5,
      guidance_scale_2: 5,
      num_frames: 25,
      fps: 12,
    },
  },
  {
    id: "balanced",
    name: "Balanced",
    type: "balanced",
    description: "Good balance of quality and speed",
    params: {
      resolution: "720p",
      num_inference_steps: 30,
      guidance_scale: 7.5,
      guidance_scale_2: 7.5,
      num_frames: 49,
      fps: 16,
    },
  },
  {
    id: "high-quality",
    name: "High Quality",
    type: "high-quality",
    description: "Best quality, slower generation",
    params: {
      resolution: "720p",
      num_inference_steps: 50,
      guidance_scale: 10,
      guidance_scale_2: 10,
      num_frames: 81,
      fps: 24,
    },
  },
  {
    id: "sketch",
    name: "Sketch",
    type: "sketch",
    description: "Fast iterations for creative exploration",
    params: {
      resolution: "480p",
      num_inference_steps: 25,
      guidance_scale: 6,
      guidance_scale_2: 6,
      num_frames: 33,
      fps: 12,
    },
  },
];

// Generation status types
export type GenerationStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";

// Generation history item
export interface GenerationHistoryItem {
  id: string;
  prompt: string;
  params: GenerationParams;
  status: GenerationStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  createdAt: number;
  completedAt?: number;
  progress?: number;
  estimatedTime?: number;
}
