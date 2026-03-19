import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { notFound } from "next/navigation";
import ApplyButton from "@/components/ApplyButton";

export const dynamic = 'force-dynamic';

export default async function TaskDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ applied?: string }>;
}) {
  const { id } = await params;
  const { applied } = await searchParams;

  const { data: task, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !task) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden pt-24 md:pt-32 relative flex justify-center pb-32">
      <div className="w-full max-w-4xl px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5 group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to projects
          </Link>
        </div>

        {/* Success banner */}
        {applied === 'true' && (
          <div className="mb-6 p-4 rounded-xl text-sm font-medium bg-green-50 text-green-700 border border-green-100 dark:bg-green-950 dark:border-green-900/50 dark:text-green-400">
            ✓ Application submitted successfully.
          </div>
        )}

        <div className="bg-white rounded-[32px] overflow-hidden border border-black/10 text-left shadow-sm">
          <div className="p-8 sm:p-16 border-b border-black/5">
            <div className="flex justify-between items-start flex-wrap gap-4 mb-8">
              <h1 className="text-[40px] sm:text-[64px] font-black text-black tracking-tighter leading-[0.95] flex-1">
                {task.title}
              </h1>
              <span className={`mt-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border ${task.status === 'open' ? 'border-black text-black' : 'border-black/20 text-zinc-500'}`}>
                {task.status}
              </span>
            </div>
            <p className="text-lg text-zinc-500 whitespace-pre-wrap leading-relaxed max-w-3xl">
              {task.description}
            </p>
          </div>

          <div className="px-8 sm:px-16 py-12 bg-[#F7F6F2] flex flex-col sm:flex-row gap-12 justify-between">
            <div className="flex-1">
              <h3 className="label-thin text-zinc-500 mb-4">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {task.skills_required && task.skills_required.length > 0 ? (
                  task.skills_required.map((skill: string, idx: number) => (
                    <span key={idx} className="bg-transparent border border-black/10 px-4 py-1.5 rounded-full text-[13px] font-medium text-black">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-400 italic text-sm">None specified</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-10 sm:text-right shrink-0">
              <div>
                <h3 className="label-thin text-zinc-500 mb-2">Team Size</h3>
                <p className="text-3xl font-black text-black leading-none">{task.team_size} <span className="text-sm font-medium text-zinc-400 font-sans tracking-normal hidden md:inline">members</span></p>
              </div>
              <div>
                <h3 className="label-thin text-zinc-500 mb-2">Reward</h3>
                <p className="text-3xl font-mono text-black leading-none sm:justify-end">
                  {task.reward_points} <span className="text-sm font-medium text-zinc-400 font-sans tracking-normal hidden md:inline">pts</span>
                </p>
              </div>
              <div>
                <h3 className="label-thin text-zinc-500 mb-2">Deadline</h3>
                <p className="text-lg font-bold text-black leading-none">
                  {task.deadline ? new Date(task.deadline).toLocaleDateString("en-GB", { month: "short", day: "numeric" }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full">
            <ApplyButton taskId={task.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
