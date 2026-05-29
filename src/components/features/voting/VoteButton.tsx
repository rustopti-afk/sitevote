"use client";

import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart } from "lucide-react";
import { cn } from "@/utils/cn";
import { useVoteMutation } from "@/hooks/useSites";
import { useUiStore } from "@/store/ui.store";

interface VoteButtonProps {
  siteId: string;
  hasVoted: boolean;
}

/**
 * Button that casts a vote for a site.
 * - Unauthenticated users are prompted to sign in via the confirm dialog.
 * - Already-voted sites show a disabled "Проголосовано" state.
 * - Otherwise an active "Голосувати" button triggers the vote mutation.
 */
export function VoteButton({ siteId, hasVoted }: VoteButtonProps) {
  const { data: session } = useSession();
  const voteMutation = useVoteMutation(siteId);
  const openVoteConfirm = useUiStore((state) => state.openVoteConfirm);

  const handleClick = () => {
    if (!session) {
      openVoteConfirm(siteId);
      return;
    }
    if (hasVoted || voteMutation.isPending) {
      return;
    }
    voteMutation.mutate();
  };

  const disabled = hasVoted || voteMutation.isPending;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      disabled={disabled}
      data-testid="vote-button"
      style={hasVoted ? undefined : { boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
      className={cn(
        hasVoted
          ? "flex items-center gap-1.5 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 cursor-default"
          : "flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.03] hover:bg-black",
        voteMutation.isPending && "cursor-wait opacity-60",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {hasVoted ? (
          <motion.span
            key="voted"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Проголосовано
          </motion.span>
        ) : (
          <motion.span
            key="vote"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5"
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            Голосувати
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
