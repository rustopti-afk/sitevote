"use client";

import { useState, type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Client-side provider tree shared by the whole app.
 *
 * Combines:
 * - {@link SessionProvider} so `useSession` works in any client component.
 * - {@link QueryClientProvider} for TanStack Query data fetching/caching.
 *
 * The QueryClient is created lazily inside `useState` so that a single
 * instance is preserved across re-renders while still being created per
 * browser session (never shared between requests on the server).
 */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Treat data as fresh for 30s before refetching in the background.
            staleTime: 30_000,
            // Retry a failed query once before surfacing the error.
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
