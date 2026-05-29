"use client";

import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/ui.store";

/**
 * Dialog prompting unauthenticated users to sign in before voting.
 * Visibility is driven by the global UI store.
 */
export function VoteConfirmDialog() {
  const isOpen = useUiStore((state) => state.isVoteConfirmOpen);
  const closeVoteConfirm = useUiStore((state) => state.closeVoteConfirm);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : closeVoteConfirm())}>
      <DialogContent
        data-testid="login-dialog"
        className="rounded-3xl bg-white p-8 shadow-xl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Потрібна авторизація
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Щоб проголосувати, увійдіть через Google
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="btn-secondary" onClick={closeVoteConfirm}>
            Скасувати
          </Button>
          <Button className="btn-primary" onClick={() => signIn("google")}>
            Увійти через Google
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
