"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Trophy, Loader2 } from "lucide-react";

/**
 * Login page. Offers Google sign-in and redirects authenticated users home.
 */
export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Once a session is present, leave the login page.
  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session, router]);

  // While we resolve the session (or are about to redirect), show a spinner
  // instead of flashing the login form.
  if (status === "loading" || session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 max-w-sm w-full mx-4">
        {/* Logo + title */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-gray-900" />
            <span className="text-xl font-semibold text-gray-900">SiteVote</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">
            Ласкаво просимо
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Увійди через Google щоб почати голосувати
          </p>
        </div>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 font-medium text-gray-800 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
        >
          <GoogleIcon />
          Продовжити з Google
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Натискаючи, ти погоджуєшся з умовами використання
        </p>
      </div>
    </div>
  );
}

/**
 * Official multi-color Google "G" mark.
 */
function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
