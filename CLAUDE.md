# CLAUDE.md

## Project Overview

Build a modern video generation web app using Next.js 14+ (App Router), shadcn/ui, and Tailwind CSS. The backend connects to a RunPod endpoint running Wan 2.2 model that converts text prompts to videos.

## Core Requirements

### Tech Stack

-   Next.js 14+ with App Router
-   shadcn/ui components (Button, Input, Slider, Select, Card, Dialog, Toast, Accordion)
-   TypeScript with strict mode
-   React Hook Form + Zod for validation
-   Zustand for state management (generation queue, settings)

### Essential Features

1. **Main Generation Interface** - Clean, centered layout with prompt textarea and collapsible parameter panel
2. **Parameter Controls** - Resolution, inference steps (slider), guidance scales (dual sliders), frames, FPS, optional seed
3. **Real-time Status** - Progress indicator, status polling, estimated time, cancel button
4. **Video Preview** - Inline player with download button and regenerate option
5. **History Page** - Grid of past generations with search/filter, thumbnails, metadata
6. **Preset System** - Quick presets (Draft, Balanced, High Quality, Sketch) + custom presets

### Project Structure

```
app/
  ├── page.tsx                    # Main generator
  ├── history/page.tsx            # History grid
  ├── api/
  │   ├── generate/route.ts       # POST: start generation
  │   └── status/[id]/route.ts    # GET: poll status
components/
  ├── ui/                         # shadcn components
  ├── prompt-input.tsx
  ├── parameter-panel.tsx
  ├── video-player.tsx
  └── history-grid.tsx
lib/
  ├── runpod.ts                   # API client wrapper
  ├── validations.ts              # Zod schemas
  └── db.ts                       # SQLite/localStorage for history
```

### API Implementation

```typescript
// POST /api/generate
{ prompt, resolution, num_inference_steps, guidance_scale,
  guidance_scale_2, num_frames, fps, seed? }
→ { jobId, status: "queued", estimatedTime }

// GET /api/status/[jobId]
→ { status: "processing" | "completed" | "failed",
    progress?, videoUrl?, metadata?, error? }
```

### Key Technical Decisions

-   **State Management**: Zustand store for active generation, queue, and settings
-   **Polling**: useEffect with setInterval (3s) for status updates until complete
-   **Storage**: Start with localStorage for history, upgrade to SQLite if needed
-   **Video Storage**: Save to `/public/videos/[jobId].mp4` or use S3 in production
-   **Validation**: Zod schemas matching RunPod parameters (steps: 20-50, frames: 25-81, etc.)

### UX/UI Guidelines

-   **Layout**: Two-column on desktop (generator left, preview/queue right), stacked on mobile
-   **Loading States**: Skeleton loaders, progress bars with percentage, disable form during generation
-   **Error Handling**: Toast notifications, inline validation errors, retry button on failures
-   **Empty States**: Helpful CTAs when no history ("Generate your first video")
-   **Accessibility**: Proper labels, keyboard navigation, ARIA attributes, focus management

### Nice-to-Have Enhancements

-   Batch generation queue (multiple jobs)
-   Parameter tooltips explaining each setting
-   Prompt enhancement suggestions
-   Side-by-side video comparison
-   Export/import presets
-   Generation statistics dashboard
-   Keyboard shortcuts (Ctrl+Enter to generate)

### Environment Variables

```bash
RUNPOD_API_KEY=secret_key
RUNPOD_ENDPOINT_ID=eyijc6vd8jhy24
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_TIMEOUT=2500
```

### Development Approach

1. Start with minimal working generator (prompt → API → video display)
2. Add parameter controls progressively
3. Implement status polling and progress feedback
4. Build history page with basic filtering
5. Add preset system and advanced features
6. Polish UI/UX, add animations, improve error handling

### Code Quality Standards

-   TypeScript strict mode, no `any` types
-   Extract reusable hooks (`useVideoGeneration`, `useHistory`)
-   Keep components under 200 lines, split if larger
-   Use server components where possible, client components for interactivity
-   Implement proper error boundaries
-   Add loading.tsx and error.tsx for routes

## Goal

Create a production-ready, intuitive video generation tool that makes the Wan 2.2 model easily accessible. Prioritize clean code, excellent UX, and reliable generation flow over feature bloat.
