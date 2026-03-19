"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface ApplyButtonProps {
  taskId: string;
}

type ApplyState = "loading" | "unauthenticated" | "applied" | "open";

export default function ApplyButton({ taskId }: ApplyButtonProps) {
  const [state, setState] = useState<ApplyState>("loading");

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState("unauthenticated");
        return;
      }

      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("task_id", taskId)
        .eq("user_id", user.id)
        .maybeSingle();

      setState(existing ? "applied" : "open");
    };

    check();
  }, [taskId]);

  if (state === "loading") {
    return (
      <div className="inline-flex w-full justify-center items-center py-5 px-8 bg-zinc-100 text-zinc-400 text-[13px] font-bold tracking-widest uppercase rounded-none">
        Checking...
      </div>
    );
  }

  if (state === "applied") {
    return (
      <div className="inline-flex w-full justify-center items-center gap-2 py-5 px-8 text-[13px] font-bold tracking-widest uppercase text-black bg-[var(--background)] border border-black/10 rounded-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        You have already applied
      </div>
    );
  }

  if (state === "unauthenticated") {
    return (
      <Link
        href="/login"
        className="inline-flex w-full justify-center items-center gap-2 py-5 px-8 bg-black text-white text-[13px] font-bold tracking-widest uppercase rounded-none hover:bg-zinc-800 transition-colors"
      >
        Login to Apply
      </Link>
    );
  }

  return (
    <Link
      href={`/apply/${taskId}`}
      className="inline-flex w-full justify-center items-center gap-2 py-5 px-8 bg-black text-white text-[13px] font-bold tracking-widest uppercase rounded-none hover:bg-zinc-800 transition-colors"
    >
      Apply for Project
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
    </Link>
  );
}
