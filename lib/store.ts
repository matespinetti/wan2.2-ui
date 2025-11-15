import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { GenerationHistoryItem, GenerationParams, Preset, DEFAULT_PRESETS } from "./validations";

interface GenerationState {
  // Current generation
  currentGeneration: GenerationHistoryItem | null;
  isGenerating: boolean;

  // History
  history: GenerationHistoryItem[];
  isLoadingHistory: boolean;

  // Presets
  presets: Preset[];
  selectedPresetId: string | null;

  // Actions
  startGeneration: (params: GenerationParams, jobId: string) => Promise<void>;
  updateGeneration: (updates: Partial<GenerationHistoryItem>) => void;
  completeGeneration: (videoUrl: string) => void;
  failGeneration: (error: string) => void;
  cancelGeneration: () => Promise<void>;

  // History actions
  loadHistory: () => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;

  // Preset actions
  loadPresets: () => void;
  selectPreset: (id: string | null) => void;
  addPreset: (preset: Preset) => void;
  deletePreset: (id: string) => void;
}

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentGeneration: null,
      isGenerating: false,
      history: [],
      isLoadingHistory: false,
      presets: DEFAULT_PRESETS,
      selectedPresetId: null,

  // Generation actions - Database is updated via API routes
  startGeneration: async (params, jobId) => {
    // Load history to get the new generation
    await get().loadHistory();

    // Find the generation in history
    const { history } = get();
    const generation = history.find((g) => g.id === jobId);

    if (generation) {
      set({
        currentGeneration: generation,
        isGenerating: true,
      });
    }
  },

  updateGeneration: (updates) => {
    const { currentGeneration } = get();
    if (!currentGeneration) return;

    const updated = { ...currentGeneration, ...updates };

    set({ currentGeneration: updated });

    // Reload history to reflect changes
    get().loadHistory();
  },

  completeGeneration: (videoUrl) => {
    const { currentGeneration } = get();
    if (!currentGeneration) return;

    const updates = {
      ...currentGeneration,
      status: "completed" as const,
      videoUrl,
      completedAt: Date.now(),
      progress: 100,
    };

    set({
      currentGeneration: updates,
      isGenerating: false,
    });

    get().loadHistory();
  },

  failGeneration: (error) => {
    const { currentGeneration } = get();
    if (!currentGeneration) return;

    const updates = {
      ...currentGeneration,
      status: "failed" as const,
      error,
      completedAt: Date.now(),
    };

    set({
      currentGeneration: updates,
      isGenerating: false,
    });

    get().loadHistory();
  },

  cancelGeneration: async () => {
    const { currentGeneration } = get();
    if (!currentGeneration) return;

    // Cancel is handled by the cancel API route
    set({
      currentGeneration: null,
      isGenerating: false,
    });

    await get().loadHistory();
  },

  // History actions - Using API routes to access SQLite
  loadHistory: async () => {
    if (typeof window === "undefined") return;

    set({ isLoadingHistory: true });
    try {
      const response = await fetch("/api/history");
      if (response.ok) {
        const { history } = await response.json();
        set({ history, isLoadingHistory: false });
      } else {
        set({ history: [], isLoadingHistory: false });
      }
    } catch (error) {
      console.error("Error loading history:", error);
      set({ history: [], isLoadingHistory: false });
    }
  },

  deleteHistoryItem: async (id) => {
    if (typeof window === "undefined") return;

    try {
      await fetch(`/api/history?id=${id}`, { method: "DELETE" });
      await get().loadHistory();
    } catch (error) {
      console.error("Error deleting history item:", error);
    }
  },

  clearHistory: async () => {
    if (typeof window === "undefined") return;

    try {
      await fetch("/api/history?all=true", { method: "DELETE" });
      set({ history: [] });
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  },

  // Preset actions - Still using LocalStorage for presets (lightweight)
  loadPresets: () => {
    if (typeof window === "undefined") return;

    try {
      const customPresets = localStorage.getItem("wan-custom-presets");
      const parsed = customPresets ? JSON.parse(customPresets) : [];
      set({ presets: [...DEFAULT_PRESETS, ...parsed] });
    } catch (error) {
      console.error("Error loading presets:", error);
      set({ presets: DEFAULT_PRESETS });
    }
  },

  selectPreset: (id) => {
    set({ selectedPresetId: id });
  },

  addPreset: (preset) => {
    if (typeof window === "undefined") return;

    try {
      const customPresets = localStorage.getItem("wan-custom-presets");
      const parsed = customPresets ? JSON.parse(customPresets) : [];
      parsed.push(preset);
      localStorage.setItem("wan-custom-presets", JSON.stringify(parsed));
      get().loadPresets();
    } catch (error) {
      console.error("Error adding preset:", error);
    }
  },

  deletePreset: (id) => {
    if (typeof window === "undefined") return;

    try {
      const customPresets = localStorage.getItem("wan-custom-presets");
      const parsed = customPresets ? JSON.parse(customPresets) : [];
      const filtered = parsed.filter((p: Preset) => p.id !== id);
      localStorage.setItem("wan-custom-presets", JSON.stringify(filtered));

      // Deselect if currently selected
      const { selectedPresetId } = get();
      if (selectedPresetId === id) {
        set({ selectedPresetId: null });
      }

      get().loadPresets();
    } catch (error) {
      console.error("Error deleting preset:", error);
    }
  },
    }),
    {
      name: "wan-generation-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentGeneration: state.currentGeneration,
        isGenerating: state.isGenerating,
      }),
    }
  )
);
