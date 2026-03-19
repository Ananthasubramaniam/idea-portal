"use client";

import { useState } from "react";
import { authorizedFetch } from "@/lib/api";

export default function ApiTestButton() {
  const [responseMsg, setResponseMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testSecureApiRoute = async () => {
    setLoading(true);
    setResponseMsg(null);

    try {
      // Use the modular authorizedFetch helper
      const res = await authorizedFetch("/api/protected", { method: "GET" });
      const data = await res.json();

      setResponseMsg(`Success: ${data.message} (User: ${data.user.email})`);
    } catch (err: any) {
      setResponseMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-md">
      <h3 className="font-bold mb-4 text-zinc-900 dark:text-white">Test Backend API Route</h3>
      <button
        onClick={testSecureApiRoute}
        disabled={loading}
        className="w-full bg-black text-white font-bold py-2 rounded-none hover:bg-zinc-800 disabled:opacity-50 transition-colors"
      >
        {loading ? "Testing..." : "Fetch Protected API"}
      </button>
      
      {responseMsg && (
        <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900 text-sm font-mono border border-zinc-200 dark:border-zinc-800 rounded text-zinc-700 dark:text-zinc-300">
          {responseMsg}
        </div>
      )}
    </div>
  );
}
