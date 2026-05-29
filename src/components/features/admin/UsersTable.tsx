"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import type { UserRole } from "@/types/site.types";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  isBlocked: boolean;
  createdAt: string;
  voteCount: number;
}

interface UsersTableProps {
  users: AdminUserRow[];
}

const ROLE_OPTIONS: UserRole[] = ["USER", "MODERATOR", "ADMIN"];

const ROLE_STYLES: Record<UserRole, string> = {
  USER: "bg-silver-100 text-silver-600 ring-silver-300",
  MODERATOR: "bg-blue-50 text-blue-700 ring-blue-200",
  ADMIN: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

/**
 * Sends a PATCH to /api/admin/users/:id and reports failure via the returned
 * message (null on success).
 */
async function patchUser(
  id: string,
  payload: { role?: UserRole; isBlocked?: boolean }
): Promise<string | null> {
  try {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) return null;

    const body = await res.json().catch(() => null);
    return body?.error?.message ?? `Помилка (HTTP ${res.status})`;
  } catch {
    return "Помилка мережі";
  }
}

/**
 * Interactive admin users table.
 *
 * Renders each user with a role <select> and a block/unblock button. Mutations
 * call the admin users API and then refresh the route so server-rendered data
 * stays in sync.
 */
export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(id: string, payload: { role?: UserRole; isBlocked?: boolean }) {
    setBusyId(id);
    setError(null);
    void patchUser(id, payload).then((message) => {
      setBusyId(null);
      if (message) {
        setError(message);
        return;
      }
      startTransition(() => router.refresh());
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-silver-200 bg-white shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-silver-200 text-xs font-medium uppercase tracking-wide text-silver-500">
                <th className="px-5 py-3.5">Користувач</th>
                <th className="px-5 py-3.5">Роль</th>
                <th className="px-5 py-3.5 text-right">Голоси</th>
                <th className="px-5 py-3.5">Реєстрація</th>
                <th className="px-5 py-3.5">Статус</th>
                <th className="px-5 py-3.5 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silver-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-silver-400">
                    Користувачів ще немає
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const busy = busyId === user.id || isPending;
                  return (
                    <tr key={user.id} className="hover:bg-silver-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.image}
                              alt={user.name ?? user.email}
                              className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50">
                              <UserIcon size={16} className="text-indigo-600" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium text-silver-900">
                              {user.name ?? "—"}
                            </p>
                            <p className="truncate text-xs text-silver-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                            ROLE_STYLES[user.role]
                          )}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium tabular-nums text-silver-900">
                        {user.voteCount}
                      </td>
                      <td className="px-5 py-3.5 text-silver-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        {user.isBlocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
                            <ShieldAlert size={12} />
                            Заблоковано
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">
                            <ShieldCheck size={12} />
                            Активний
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={user.role}
                            disabled={busy}
                            onChange={(event) =>
                              run(user.id, {
                                role: event.target.value as UserRole,
                              })
                            }
                            className="rounded-lg border border-silver-300 bg-white px-2 py-1.5 text-xs text-silver-800 outline-none focus:border-indigo-400 disabled:opacity-50"
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              run(user.id, { isBlocked: !user.isBlocked })
                            }
                            className={cn(
                              "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                              user.isBlocked
                                ? "text-green-700 hover:bg-green-50"
                                : "text-red-600 hover:bg-red-50"
                            )}
                          >
                            {busy && busyId === user.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : user.isBlocked ? (
                              <ShieldCheck size={13} />
                            ) : (
                              <ShieldAlert size={13} />
                            )}
                            {user.isBlocked ? "Розблокувати" : "Заблокувати"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
