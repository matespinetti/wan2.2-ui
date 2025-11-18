# CLAUDE.md

## Project Overview

Build a modern Image-to-Video (I2V) generation web app using Next.js 14+ (App Router), shadcn/ui, and Tailwind CSS. The backend connects to a RunPod endpoint running Wan 2.2 model that converts static images to animated videos with optional text prompts for guidance.

## Core Requirements

### Tech Stack

-   Next.js 14+ with App Router
-   shadcn/ui components (Button, Input, Slider, Select, Card, Dialog, Toast, Accordion, Tooltip)
-   TypeScript with strict mode
-   React Hook Form + Zod for validation
-   Zustand for state management (generation queue, settings)
-   Sharp for image processing and thumbnail generation
-   Better-SQLite3 for persistent storage

### Essential Features

1. **Image Upload** - Drag & drop or file picker with preview, dimensions display, and file size validation (max 10MB, JPEG/PNG/WebP)
2. **Main Generation Interface** - Clean, centered layout with image upload, optional prompt textarea, and collapsible parameter panel with tooltips
3. **Parameter Controls** - Resolution (reference), inference steps (slider), guidance scale (slider), frames, FPS, optional seed
4. **Real-time Status** - Progress indicator, status polling, estimated time, cancel button
5. **Video Preview** - Inline player with download button and regenerate option
6. **History Page** - Grid of past generations with search/filter, thumbnails (auto-generated from upload images), metadata
7. **Preset System** - Quick presets (Quick, Balanced, High Quality, Smooth Motion) + custom presets
8. **Authentication** - NextAuth.js with bcrypt for user management

### Project Structure

```
app/
  ├── page.tsx                    # Main I2V generator
  ├── history/page.tsx            # History grid
  ├── api/
  │   ├── generate/route.ts       # POST: start generation
  │   ├── status/[id]/route.ts    # GET: poll status
  │   ├── videos/route.ts         # POST: save video + generate thumbnail
  │   └── auth/                   # NextAuth endpoints
components/
  ├── ui/                         # shadcn components
  ├── image-upload.tsx            # NEW: Image upload with drag & drop
  ├── prompt-input.tsx
  ├── parameter-panel.tsx         # With tooltips
  ├── preset-selector.tsx
  ├── video-player.tsx
  └── history-grid.tsx
lib/
  ├── runpod.ts                   # RunPod API client wrapper
  ├── validations.ts              # Zod schemas for I2V
  ├── database.ts                 # Better-SQLite3 for history
  └── store.ts                    # Zustand state management
```

### API Implementation

```typescript
// POST /api/generate (I2V)
{
  image: string,              // Required: base64-encoded image
  prompt?: string,            // Optional: text guidance
  resolution: string,         // Reference only (auto-calculated from image)
  num_inference_steps: number,
  guidance_scale: number,     // Default: 3.5
  num_frames: number,         // Default: 81
  fps: number,                // Default: 16
  seed?: number
}
→ { jobId, status: "queued", estimatedTime }

// GET /api/status/[jobId]
→ { status: "processing" | "completed" | "failed",
    progress?, videoUrl?, thumbnailUrl?, metadata?, error? }

// POST /api/videos
{ jobId: string, videoBase64: string, imageBase64?: string }
→ { videoPath: string, thumbnailPath?: string }
```

### Key Technical Decisions

-   **State Management**: Zustand store with persist middleware for active generation, queue, and settings
-   **Polling**: useEffect with setInterval (3s) for status updates until complete
-   **Storage**: Better-SQLite3 for persistent generation history with thumbnails
-   **Video Storage**: Save to `/public/videos/[jobId].mp4` with thumbnails (`[jobId]-thumb.jpg`)
-   **Image Processing**: Sharp for thumbnail generation (320x240 JPEG at 80% quality)
-   **Validation**: Zod schemas matching I2V RunPod parameters
    -   Image: required, base64-encoded
    -   Prompt: optional text guidance
    -   Inference steps: 20-50 (default 40)
    -   Guidance scale: 1-20 (default 3.5)
    -   Frames: 25-81 (default 81)
    -   FPS: 8-30 (default 16)
-   **Resolution**: Auto-calculated from uploaded image dimensions (resolution field is UI reference only)

### UX/UI Guidelines

-   **Layout**: Two-column on desktop (generator left, preview/queue right), stacked on mobile
-   **Image Upload**: Drag & drop zone with visual feedback, image preview with dimensions/aspect ratio/file size
-   **Tooltips**: Help icons (?) next to all parameters with detailed explanations
-   **Loading States**: Skeleton loaders, progress bars with percentage, disable form during generation
-   **Error Handling**: Toast notifications for upload errors, inline validation errors, retry button on failures
-   **Empty States**: Helpful CTAs ("Upload an image to generate a video")
-   **Accessibility**: Proper labels, keyboard navigation, ARIA attributes, focus management, cursor-help on tooltips

### Nice-to-Have Enhancements

-   Batch generation queue (multiple jobs)
-   ✅ Parameter tooltips explaining each setting (IMPLEMENTED)
-   Prompt enhancement suggestions
-   Side-by-side video comparison (before/after image)
-   Export/import presets
-   Generation statistics dashboard
-   Keyboard shortcuts (Ctrl+Enter to generate)
-   Multiple image uploads for batch processing
-   Image editing tools (crop, resize) before generation

### Environment Variables

```bash
RUNPOD_API_KEY=secret_key
RUNPOD_ENDPOINT_ID=eyijc6vd8jhy24
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_TIMEOUT=2500
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### Development Approach

1. ✅ Start with minimal working I2V generator (image upload → API → video display)
2. ✅ Add image upload with drag & drop and validation
3. ✅ Add parameter controls with tooltips
4. ✅ Implement status polling and progress feedback
5. ✅ Build history page with thumbnails and filtering
6. ✅ Add preset system (Quick, Balanced, High Quality, Smooth Motion)
7. ✅ Polish UI/UX, add tooltips, improve error handling
8. ✅ Implement thumbnail generation with Sharp
9. ✅ Add authentication with NextAuth.js

### Code Quality Standards

-   TypeScript strict mode, no `any` types
-   Extract reusable hooks (`useVideoGeneration`, `useHistory`)
-   Keep components under 200 lines, split if larger
-   Use server components where possible, client components for interactivity
-   Implement proper error boundaries
-   Add loading.tsx and error.tsx for routes

## Goal

Create a production-ready, intuitive Image-to-Video generation tool that makes the Wan 2.2 I2V model easily accessible. Prioritize clean code, excellent UX, and reliable generation flow over feature bloat.

## Image Requirements

-   **Formats**: JPEG, PNG, WebP
-   **Size**: Maximum 10MB
-   **Resolution**: Auto-detected from uploaded image
-   **Aspect Ratio**: Any (displayed to user after upload)
-   **Processing**: Converted to base64 for API transmission
-   **Thumbnails**: 320x240 JPEG generated from uploaded image for history display

## Migration from T2V to I2V

This application was migrated from Text-to-Video (T2V) to Image-to-Video (I2V). Key changes:

-   **Added**: Required image upload field (base64)
-   **Changed**: Prompt is now optional (was required)
-   **Removed**: `guidance_scale_2` parameter
-   **Removed**: Manual resolution/width/height inputs (auto-calculated by backend)
-   **Updated Defaults**:
    -   `guidance_scale`: 7.5 → 3.5
    -   `num_inference_steps`: 30 → 40
    -   `num_frames`: 49 → 81
-   **New Presets**: Quick, Balanced, High Quality, Smooth Motion (replaced T2V presets)
