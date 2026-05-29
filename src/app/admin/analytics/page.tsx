"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Globe,
  CheckCircle,
  Clock,
  BarChart3,
  Users,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface AdminStats {
  totalSites: number;
  activeSites: number;
  pendingSites: number;
  totalVotes: number;
  totalUsers: number;
  recentVotes: Array<{
    id: string;
    createdAt: string;
    ipAddress: string | null;
    user: { name: string | null; email: string | null } | null;
    site: { name: string | null; slug: string | null } | null;
  }>;
}

interface LeaderboardSite {
  id: string;
  name: string;
  voteCount: number;
}

interface TopSiteDatum {
  name: string;
  votes: number;
}

const NUMBER_CARDS: Array<{
  key: keyof Pick<
    AdminStats,
    "totalSites" | "activeSites" | "pendingSites" | "totalVotes" | "totalUsers"
  >;
  label: string;
  icon: typeof Globe;
}> = [
  { key: "totalSites", label: "Всього сайтів", icon: Globe },
  { key: "activeSites", label: "Активні", icon: CheckCircle },
  { key: "pendingSites", label: "На розгляді", icon: Clock },
  { key: "totalVotes", label: "Голоси", icon: BarChart3 },
  { key: "totalUsers", label: "Користувачі", icon: Users },
];

/**
 * Escapes a single CSV field: wraps in quotes and doubles any inner quotes so
 * commas, quotes and newlines survive a round-trip through spreadsheet tools.
 */
function csvField(value: string | null | undefined): string {
  const text = value ?? "";
  return `"${text.replace(/"/g, '""')}"`;
}

/**
 * Analytics dashboard.
 *
 * Client Component that loads aggregate stats and the leaderboard, renders the
 * headline numbers plus a top-sites bar chart, and lets the admin export the
 * recent-vote feed as a CSV file generated entirely in the browser.
 */
export default function AnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [topSites, setTopSites] = useState<TopSiteDatum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [statsRes, boardRes] = await Promise.all([
          fetch("/api/admin/stats", { cache: "no-store" }),
          fetch("/api/leaderboard", { cache: "no-store" }),
        ]);

        if (!statsRes.ok) {
          throw new Error(`Не вдалося завантажити статистику (HTTP ${statsRes.status})`);
        }

        const statsBody = (await statsRes.json()) as {
          success: boolean;
          data?: AdminStats;
        };
        if (!statsBody.success || !statsBody.data) {
          throw new Error("Сервер повернув некоректну статистику");
        }

        // Top-sites chart data is best-effort: a leaderboard failure must not
        // blank out the headline numbers.
        let board: TopSiteDatum[] = [];
        if (boardRes.ok) {
          const boardBody = (await boardRes.json()) as {
            success: boolean;
            data?: LeaderboardSite[];
          };
          if (boardBody.success && boardBody.data) {
            board = boardBody.data.slice(0, 10).map((site: LeaderboardSite) => ({
              name: site.name,
              votes: site.voteCount,
            }));
          }
        }

        if (!cancelled) {
          setStats(statsBody.data);
          setTopSites(board);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Не вдалося завантажити дані"
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const exportCsv = useCallback(() => {
    if (!stats || stats.recentVotes.length === 0) return;

    const header = ["Користувач", "Email", "Сайт", "Дата", "IP"];
    const rows = stats.recentVotes.map((vote: AdminStats["recentVotes"][number]) =>
      [
        csvField(vote.user?.name),
        csvField(vote.user?.email),
        csvField(vote.site?.name),
        csvField(new Date(vote.createdAt).toISOString()),
        csvField(vote.ipAddress),
      ].join(",")
    );

    // Prepend a UTF-8 BOM so Excel renders Cyrillic correctly.
    const csv = "﻿" + [header.map(csvField).join(","), ...rows].join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sitevote-votes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [stats]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-silver-400">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
        <span>{error ?? "Дані недоступні"}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-silver-900">Аналітика</h1>
          <p className="text-sm text-silver-500 mt-1">
            Зведена статистика платформи
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={stats.recentVotes.length === 0}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          Експорт CSV
        </button>
      </div>

      {/* Big numbers */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {NUMBER_CARDS.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="relative overflow-hidden rounded-2xl border border-silver-200 bg-white p-6 shadow-glass"
          >
            <div className="absolute right-5 top-5 rounded-xl bg-indigo-50 p-2.5">
              <Icon size={22} className="text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-silver-500">{label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-silver-900">
              {stats[key]}
            </p>
          </div>
        ))}
      </div>

      {/* Top sites chart */}
      <section className="rounded-2xl border border-silver-200 bg-white p-6 shadow-glass">
        <h2 className="mb-5 text-base font-semibold text-silver-900">
          Топ сайтів за голосами
        </h2>
        {topSites.length === 0 ? (
          <p className="py-10 text-center text-sm text-silver-400">
            Немає даних для відображення
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={topSites}
              margin={{ top: 8, right: 16, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" vertical={false} />
              <XAxis
                dataKey="name"
                angle={-35}
                textAnchor="end"
                interval={0}
                height={70}
                tick={{ fill: "#868E96", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#868E96", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(99,102,241,0.06)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E9ECEF",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="votes" name="Голоси" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
