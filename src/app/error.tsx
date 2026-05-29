"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-segment error boundary. Logs the error and lets the user retry
 * by re-rendering the segment via {@link reset}.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Surface the error in the console for debugging / monitoring.
    console.error("[App error boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>

      <h1 className="text-2xl font-bold text-silver-900">Щось пішло не так</h1>

      <p className="mt-2 max-w-md text-silver-500">
        Сталася неочікувана помилка. Спробуйте ще раз — якщо проблема
        повторюється, поверніться пізніше.
      </p>

      {error.digest && (
        <p className="mt-2 text-xs text-silver-400">Код помилки: {error.digest}</p>
      )}

      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        <RotateCcw className="h-4 w-4" />
        Спробувати знову
      </button>
    </div>
  );
}
