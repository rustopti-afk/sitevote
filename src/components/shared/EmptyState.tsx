import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  /** Headline shown below the icon. */
  title: string;
  /** Supporting text explaining the empty state. */
  description: string;
  /** Optional action element (e.g. a button) rendered below the text. */
  action?: ReactNode;
}

/**
 * Centered placeholder shown when a list or grid has no items.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
        <Inbox className="h-8 w-8 text-gray-300" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
