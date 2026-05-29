import Link from "next/link";

/**
 * Global 404 page rendered for unmatched routes and `notFound()` calls.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-4 text-center">
      <p className="select-none text-9xl font-black leading-none text-gray-100">
        404
      </p>

      <h1 className="mt-6 text-2xl font-bold text-gray-900">
        Сторінку не знайдено
      </h1>

      <Link href="/" className="btn-primary mt-8 inline-flex items-center gap-2">
        ← Повернутись
      </Link>
    </div>
  );
}
