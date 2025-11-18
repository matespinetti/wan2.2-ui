import { z } from "zod";

// Resolution options (dimensions must be multiples of 16 for Wan 2.2 model)
export const RESOLUTIONS = [
  { value: "480p", label: "480p (864x480)", width: 864, height: 480 },
  { value: "720p", label: "720p (1280x720)", width: 1280, height: 720 },
] as const;

export type Resolution = (typeof RESOLUTIONS)[number]["value"];

// Validation schema for Image-to-Video generation parameters
export const generationParamsSchema = z.object({
  image: z.string().min(1, "Image is required"),
  prompt: z
    .string()
    .max(1000, "Prompt must be less than 1000 characters")
    .optional(),
  resolution: z.enum(["480p", "720p"]).default("720p"), // UI reference only
  num_inference_steps: z
    .number()
    .int()
    .min(20, "Must be at least 20 steps")
    .max(50, "Must be at most 50 steps")
    .default(40),
  guidance_scale: z
    .number()
    .min(1, "Must be at least 1")
    .max(20, "Must be at most 20")
    .default(3.5),
  num_frames: z
    .number()
    .int()
    .min(25, "Must be at least 25 frames")
    .max(81, "Must be at most 81 frames")
    .default(81),
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
export type PresetType = "quick" | "balanced" | "high-quality" | "smooth-motion" | "custom";

export interface Preset {
  id: string;
  name: string;
  type: PresetType;
  params: Partial<Omit<GenerationParams, "image">>;
  description?: string;
}

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: "quick",
    name: "Quick",
    type: "quick",
    description: "Fast generation with good quality",
    params: {
      resolution: "480p",
      num_inference_steps: 30,
      guidance_scale: 3.0,
      num_frames: 49,
      fps: 12,
    },
  },
  {
    id: "balanced",
    name: "Balanced",
    type: "balanced",
    description: "Balanced quality and speed (recommended)",
    params: {
      resolution: "720p",
      num_inference_steps: 40,
      guidance_scale: 3.5,
      num_frames: 81,
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
      guidance_scale: 4.5,
      num_frames: 81,
      fps: 24,
    },
  },
  {
    id: "smooth-motion",
    name: "Smooth Motion",
    type: "smooth-motion",
    description: "Higher FPS for smoother animations",
    params: {
      resolution: "720p",
      num_inference_steps: 40,
      guidance_scale: 3.5,
      num_frames: 81,
      fps: 30,
    },
  },
];

// Generation status types
export type GenerationStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";

// Generation history item
export interface GenerationHistoryItem {
  id: string;
  prompt?: string; // Optional for I2V
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
