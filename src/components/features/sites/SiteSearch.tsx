"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useUiStore } from "@/store/ui.store";

export function SiteSearch() {
  const setSearch = useUiStore((s) => s.setSearch);
  const [inputValue, setInputValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setSearch(inputValue);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, setSearch]);

  function handleClear() {
    setInputValue("");
    setSearch("");
  }

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search icon */}
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none"
      />

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Пошук сайтів..."
        className={cn(
          "w-full h-14 bg-white rounded-2xl border border-gray-200",
          "pl-12 pr-12 text-base text-gray-900",
          "placeholder:text-gray-400",
          "outline-none focus:border-gray-400 focus:shadow-md transition-all shadow-sm"
        )}
      />

      {/* Clear icon */}
      {inputValue.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Очистити пошук"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
