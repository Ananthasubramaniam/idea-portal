import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  skills_required: string[];
  team_size: number;
  reward_points: number;
  deadline?: string;
  status?: string;
  created_at?: string;
}

function getRelativeTime(dateString?: string, deadline?: string) {
  if (deadline) {
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "ended";
    if (days === 0) return "ends today";
    if (days === 1) return "ends in 1 day";
    return `ends in ${days} days`;
  }
  if (!dateString) return "recently";
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function TaskCard({ task }: { task: Task }) {
  const isAssigned = task.status === "assigned";

  return (
    <Link
      href={`/task/${task.id}`}
      className="group block p-6 md:p-8 bg-white hover:bg-black/5 transition-colors border-b border-black/5 last:border-b-0 w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
        {/* Left Side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[20px] font-bold text-black group-hover:text-[#E8A020] transition-colors leading-none tracking-tight truncate">
              {task.title}
            </h3>
            {isAssigned && (
              <span className="label-thin border border-black/20 text-black px-2 py-0.5 rounded-full shrink-0">
                Active
              </span>
            )}
            {task.skills_required && task.skills_required.length > 0 && (
              <span className="label-thin border border-black/20 text-zinc-500 px-2 py-0.5 rounded-full shrink-0">
                {task.skills_required[0]}
              </span>
            )}
          </div>
          <p className="text-[13px] text-zinc-500 line-clamp-1 max-w-2xl">
            {task.description}
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6 shrink-0 md:justify-end">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-left md:text-right">
            <span className="text-sm font-mono text-black">{task.reward_points} pts</span>
            <span className="text-[13px] text-zinc-400 md:w-28 md:text-right">{getRelativeTime(task.created_at, task.deadline)}</span>
          </div>
          <svg className="w-4 h-4 text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
