"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UiState {
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: "votes" | "newest" | "name";
  isVoteConfirmOpen: boolean;
  pendingVoteSiteId: string | null;
}

interface UiActions {
  setSearch: (query: string) => void;
  setCategory: (categoryId: string | null) => void;
  setSortBy: (sortBy: "votes" | "newest" | "name") => void;
  openVoteConfirm: (siteId: string) => void;
  closeVoteConfirm: () => void;
}

type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>()(
  devtools(
    (set) => ({
      // Initial state
      searchQuery: "",
      selectedCategory: null,
      sortBy: "votes",
      isVoteConfirmOpen: false,
      pendingVoteSiteId: null,

      // Actions
      setSearch: (query) => set({ searchQuery: query }, false, "setSearch"),

      setCategory: (categoryId) =>
        set({ selectedCategory: categoryId }, false, "setCategory"),

      setSortBy: (sortBy) => set({ sortBy }, false, "setSortBy"),

      openVoteConfirm: (siteId) =>
        set(
          { isVoteConfirmOpen: true, pendingVoteSiteId: siteId },
          false,
          "openVoteConfirm"
        ),

      closeVoteConfirm: () =>
        set(
          { isVoteConfirmOpen: false, pendingVoteSiteId: null },
          false,
          "closeVoteConfirm"
        ),
    }),
    { name: "ui-store" }
  )
);
