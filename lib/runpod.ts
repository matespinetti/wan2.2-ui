import { GenerationParams, GenerationStatus } from "./validations";

export interface RunPodGenerateResponse {
  id: string;
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
}

export interface RunPodStatusResponse {
  id: string;
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  output?: {
    video_base64?: string;  // Changed from video_url to match RunPod actual response
    metadata?: {
      duration?: number;
      fps?: number;
      prompt?: string;
      resolution?: string;
    };
    message?: string;
  };
  error?: string;
  executionTime?: number;
  delayTime?: number;  // Added based on user's screenshot
}

class RunPodClient {
  private apiKey: string;
  private endpointId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.RUNPOD_API_KEY || "";
    this.endpointId = process.env.RUNPOD_ENDPOINT_ID || "";
    this.baseUrl = `https://api.runpod.ai/v2/${this.endpointId}`;

    if (!this.apiKey || !this.endpointId) {
      console.warn("RunPod credentials not configured");
    }
  }

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async generateVideo(params: GenerationParams): Promise<RunPodGenerateResponse> {
    try {
      // Remove data URL prefix from image (e.g., "data:image/jpeg;base64,")
      const base64Image = params.image.replace(/^data:image\/\w+;base64,/, "");

      const payload = {
        input: {
          image: base64Image,
          ...(params.prompt && { prompt: params.prompt }),
          num_inference_steps: params.num_inference_steps,
          guidance_scale: params.guidance_scale,
          num_frames: params.num_frames,
          fps: params.fps,
          ...(params.seed !== undefined && { seed: params.seed }),
        },
      };

      const response = await fetch(`${this.baseUrl}/run`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`RunPod API error: ${error}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error calling RunPod generate:", error);
      throw error;
    }
  }

  async getStatus(jobId: string): Promise<RunPodStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/status/${jobId}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`RunPod API error: ${error}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking RunPod status:", error);
      throw error;
    }
  }

  async cancelJob(jobId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/cancel/${jobId}`, {
        method: "POST",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`RunPod API error: ${error}`);
      }
    } catch (error) {
      console.error("Error cancelling RunPod job:", error);
      throw error;
    }
  }

  mapStatus(runpodStatus: RunPodStatusResponse["status"]): GenerationStatus {
    const statusMap: Record<RunPodStatusResponse["status"], GenerationStatus> = {
      IN_QUEUE: "queued",
      IN_PROGRESS: "processing",
      COMPLETED: "completed",
      FAILED: "failed",
    };
    return statusMap[runpodStatus];
  }
}

export const runpodClient = new RunPodClient();
