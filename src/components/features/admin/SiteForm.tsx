"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  createSiteSchema,
  type CreateSiteInput,
  type CreateSiteOutput,
} from "@/lib/validations/site.schema";
import type { Category, SiteStatus } from "@/types/site.types";

interface SiteFormProps {
  defaultValues?: Partial<CreateSiteInput>;
  onSubmit: (data: CreateSiteOutput) => void;
  isLoading: boolean;
}

const STATUS_OPTIONS: { value: SiteStatus; label: string }[] = [
  { value: "ACTIVE", label: "Активний" },
  { value: "PENDING", label: "На розгляді" },
  { value: "REJECTED", label: "Відхилено" },
  { value: "ARCHIVED", label: "В архіві" },
];

const inputClass = cn(
  "w-full rounded-xl border border-silver-300 bg-white px-4 py-2.5 text-sm text-silver-800",
  "placeholder:text-silver-400 outline-none",
  "focus:border-indigo-400 transition-colors"
);

const errorClass = "mt-1 text-xs text-red-500";

const labelClass = "block text-sm font-medium text-silver-700 mb-1";

export function SiteForm({ defaultValues, onSubmit, isLoading }: SiteFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSiteInput, unknown, CreateSiteOutput>({
    resolver: zodResolver(createSiteSchema),
    defaultValues: {
      featured: false,
      status: "ACTIVE",
      ...defaultValues,
    },
  });

  // Fetch categories for the select
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => {
        // Categories failed to load — form still usable without them
      });
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Name */}
      <div>
        <label className={labelClass}>Назва сайту</label>
        <input
          type="text"
          placeholder="Наприклад: GitHub"
          className={cn(inputClass, errors.name && "border-red-400")}
          {...register("name")}
        />
        {errors.name && (
          <p className={errorClass}>{errors.name.message}</p>
        )}
      </div>

      {/* URL */}
      <div>
        <label className={labelClass}>URL сайту</label>
        <input
          type="text"
          placeholder="https://example.com"
          className={cn(inputClass, errors.url && "border-red-400")}
          {...register("url")}
        />
        {errors.url && (
          <p className={errorClass}>{errors.url.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Опис</label>
        <textarea
          rows={3}
          placeholder="Короткий опис сайту (до 500 символів)"
          className={cn(inputClass, "resize-none", errors.description && "border-red-400")}
          {...register("description")}
        />
        {errors.description && (
          <p className={errorClass}>{errors.description.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className={labelClass}>Категорія</label>
        <select
          className={cn(inputClass, "cursor-pointer", errors.categoryId && "border-red-400")}
          {...register("categoryId")}
        >
          <option value="">— без категорії —</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon ? `${cat.icon} ` : ""}{cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className={errorClass}>{errors.categoryId.message}</p>
        )}
      </div>

      {/* Thumbnail URL */}
      <div>
        <label className={labelClass}>Thumbnail URL (необов&apos;язково)</label>
        <input
          type="text"
          placeholder="https://example.com/image.png"
          className={cn(inputClass, errors.thumbnail && "border-red-400")}
          {...register("thumbnail")}
        />
        {errors.thumbnail && (
          <p className={errorClass}>{errors.thumbnail.message}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className={labelClass}>Статус</label>
        <select
          className={cn(inputClass, "cursor-pointer", errors.status && "border-red-400")}
          {...register("status")}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className={errorClass}>{errors.status.message}</p>
        )}
      </div>

      {/* Featured checkbox */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="featured"
          className="w-4 h-4 accent-indigo-600 cursor-pointer"
          {...register("featured")}
        />
        <label
          htmlFor="featured"
          className="text-sm font-medium text-silver-700 cursor-pointer select-none"
        >
          Показувати в Featured (обране)
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "mt-2 flex items-center justify-center gap-2 rounded-xl px-6 py-3",
          "bg-indigo-600 text-white text-sm font-semibold",
          "hover:bg-indigo-700 transition-colors",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {isLoading ? "Збереження..." : "Зберегти"}
      </button>
    </form>
  );
}
