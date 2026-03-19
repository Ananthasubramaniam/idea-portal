"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Strict Domain Validation
    if (!email.trim().toLowerCase().endsWith('saiuniversity.edu.in')) {
      setMessage({ type: 'error', text: 'Access restricted to saiuniversity.edu.in accounts only.' });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Check your email for the login link!' });
      setEmail("");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-10 bg-white p-10 sm:p-14 border border-black/10">
        <div>
          <h2 className="text-center text-[40px] font-black tracking-tighter text-black leading-none">
            Sign In.
          </h2>
          <p className="mt-4 text-center text-sm text-zinc-500">
            Join the Idea Portal community securely
          </p>
        </div>

        {message && (
          <div className={`p-4 text-[13px] font-medium border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
            {message.text}
          </div>
        )}

        <div className="mt-8 space-y-8">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex justify-center items-center py-4 px-4 rounded-none border border-black/20 bg-white text-[13px] font-bold tracking-widest uppercase text-black hover:bg-black/5 transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10" />
            </div>
            <div className="relative flex justify-center text-[11px] font-bold tracking-widest uppercase">
              <span className="px-4 bg-white text-zinc-400">Or email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleEmailLogin}>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-4 rounded-none border-b border-black/20 bg-transparent placeholder-zinc-400 text-black focus:outline-none focus:border-black transition-colors"
                placeholder="Ex. you@scds.saiuniversity.edu.in"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group w-full flex justify-center py-5 px-4 rounded-none text-[13px] font-bold tracking-widest uppercase text-white bg-black hover:bg-zinc-800 transition-colors focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Sending link..." : "Send login link"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
