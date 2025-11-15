"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { HistoryCard } from "./history-card";
import { GenerationHistoryItem } from "@/lib/validations";
import { Search } from "lucide-react";

interface HistoryGridProps {
  items: GenerationHistoryItem[];
  onDelete?: (id: string) => void;
  onView?: (item: GenerationHistoryItem) => void;
}

export function HistoryGrid({ items, onDelete, onView }: HistoryGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) =>
    item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No generations yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Start by creating your first video generation. Your history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search generations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No generations match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
