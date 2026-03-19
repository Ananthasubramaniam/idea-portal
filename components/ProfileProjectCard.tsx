import React from "react";
import Link from "next/link";

interface ProfileProjectCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    reward_points: number;
    completed_at?: string; // Optional if we track that, fallback to deadline
  };
}

export default function ProfileProjectCard({ task }: ProfileProjectCardProps) {
  return (
    <Link
      href={`/task/${task.id}`}
      className="group block p-6 md:p-8 bg-white hover:bg-black/5 transition-colors border-b border-black/5 last:border-b-0 w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[20px] font-bold text-black group-hover:text-[#E8A020] transition-colors leading-none tracking-tight truncate">
              {task.title}
            </h3>
            <span className="label-thin border border-black/20 text-black px-2 py-0.5 rounded-full shrink-0">
              Completed
            </span>
          </div>
          <p className="text-[13px] text-zinc-500 line-clamp-1 max-w-2xl">
            {task.description}
          </p>
        </div>

        <div className="flex items-center gap-6 shrink-0 md:justify-end">
          <span className="text-sm font-mono text-black">+{task.reward_points} pts</span>
          <svg className="w-4 h-4 text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
