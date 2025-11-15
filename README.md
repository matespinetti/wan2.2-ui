# Wan 2.2 Video Generator

A modern, production-ready web application for generating videos from text prompts using the Wan 2.2 model running on RunPod.

## Features

- **Intuitive Generator Interface**: Clean, user-friendly form with real-time parameter controls
- **Preset System**: Quick presets (Draft, Balanced, High Quality, Sketch) for common use cases
- **Real-time Status Polling**: Live progress updates during video generation
- **Video Preview & Download**: Inline video player with download functionality
- **Generation History**: Persistent history with search, filtering, and metadata
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Type-Safe**: Built with TypeScript in strict mode
- **Modern UI**: Powered by shadcn/ui components with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Form Management**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Storage**: LocalStorage (easily upgradeable to SQLite/Postgres)
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ (Note: Node.js 20+ recommended for latest features)
- npm or yarn
- RunPod API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd wan2.2-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Add your RunPod credentials to `.env`:
   ```env
   RUNPOD_API_KEY=your_secret_key_here
   RUNPOD_ENDPOINT_ID=your_endpoint_id_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_MAX_TIMEOUT=2500
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
wan2.2-ui/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── generate/          # POST endpoint for starting generation
│   │   └── status/[id]/       # GET/DELETE endpoints for status/cancel
│   ├── history/               # History page
│   ├── layout.tsx             # Root layout with Toaster
│   ├── page.tsx               # Main generator page
│   ├── loading.tsx            # Global loading state
│   ├── error.tsx              # Global error boundary
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── prompt-input.tsx       # Prompt textarea with character counter
│   ├── parameter-panel.tsx    # Collapsible parameter controls
│   ├── preset-selector.tsx    # Quick preset buttons
│   ├── generation-status.tsx  # Progress indicator
│   ├── video-player.tsx       # Video preview with controls
│   ├── history-card.tsx       # Individual history item
│   └── history-grid.tsx       # History grid with search
├── lib/
│   ├── utils.ts               # Utility functions
│   ├── validations.ts         # Zod schemas and types
│   ├── runpod.ts              # RunPod API client
│   ├── db.ts                  # LocalStorage wrapper
│   └── store.ts               # Zustand state management
├── hooks/
│   └── use-toast.ts           # Toast notifications hook
└── public/
    └── videos/                # Generated video storage
```

## API Endpoints

### POST `/api/generate`

Start a new video generation.

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over the ocean",
  "resolution": "720p",
  "num_inference_steps": 30,
  "guidance_scale": 7.5,
  "guidance_scale_2": 7.5,
  "num_frames": 49,
  "fps": 16,
  "seed": 12345 // optional
}
```

**Response:**
```json
{
  "jobId": "abc123",
  "status": "queued",
  "estimatedTime": 120
}
```

### GET `/api/status/[id]`

Check generation status.

**Response:**
```json
{
  "status": "processing",
  "progress": 50,
  "videoUrl": null,
  "error": null
}
```

### DELETE `/api/status/[id]`

Cancel a running generation.

## Parameter Ranges

| Parameter | Min | Max | Default | Description |
|-----------|-----|-----|---------|-------------|
| Resolution | 480p | 1080p | 720p | Output video resolution |
| Inference Steps | 20 | 50 | 30 | Quality vs speed tradeoff |
| Guidance Scale | 1 | 20 | 7.5 | Prompt adherence strength |
| Guidance Scale 2 | 1 | 20 | 7.5 | Secondary guidance parameter |
| Num Frames | 25 | 81 | 49 | Video length in frames |
| FPS | 8 | 30 | 16 | Frames per second |
| Seed | - | - | Random | Reproducibility seed |

## Presets

| Preset | Resolution | Steps | Frames | FPS | Description |
|--------|-----------|-------|---------|-----|-------------|
| Draft | 480p | 20 | 25 | 12 | Quick preview |
| Balanced | 720p | 30 | 49 | 16 | Good balance |
| High Quality | 1080p | 50 | 81 | 24 | Best quality |
| Sketch | 480p | 25 | 33 | 12 | Fast iterations |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in project settings
4. Deploy

### Docker

```bash
docker build -t wan-video-generator .
docker run -p 3000:3000 --env-file .env wan-video-generator
```

## Development

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
npm run start
```

## Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Submit generation form (coming soon)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

### Node Version Issues

If you encounter `EBADENGINE` errors, upgrade to Node.js 20+:
```bash
nvm install 20
nvm use 20
```

### RunPod Connection Errors

1. Verify your API key in `.env`
2. Check endpoint ID is correct
3. Ensure endpoint is running on RunPod

### LocalStorage Issues

Clear browser cache or use incognito mode if history isn't persisting.

## Future Enhancements

- [ ] Batch generation queue
- [ ] Parameter tooltips
- [ ] Prompt enhancement suggestions
- [ ] Side-by-side video comparison
- [ ] Export/import presets
- [ ] Generation statistics dashboard
- [ ] PostgreSQL/SQLite integration
- [ ] S3 video storage
- [ ] User authentication
- [ ] Dark mode toggle

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure TypeScript strict mode compliance
5. Test thoroughly
6. Submit a pull request

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Documentation: See CLAUDE.md for technical specifications
