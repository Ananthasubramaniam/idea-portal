import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import ApplicationForm from "@/components/ApplicationForm";

export const dynamic = 'force-dynamic';

export default async function ApplyPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;

  const { data: task, error } = await supabase
    .from("tasks")
    .select("id, title, description")
    .eq("id", taskId)
    .single();

  if (error || !task) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-32 px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <Link href={`/task/${taskId}`} className="label-thin text-zinc-500 hover:text-black transition-colors inline-flex items-center">
            &larr; Back to task
          </Link>
        </div>

        <div className="mb-16">
          <h1 className="text-[60px] lg:text-[80px] font-black text-black tracking-tighter leading-none">
            Apply.
          </h1>
          <p className="mt-6 text-sm text-zinc-500">
            You&apos;re applying for a spot on this project.
          </p>
        </div>

        {/* Task Summary */}
        <div className="bg-white border text-black border-black/10 p-8 sm:p-12 mb-16">
          <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
          <p className="text-[13px] text-zinc-500 line-clamp-4">{task.description}</p>
        </div>

        {/* Application Form */}
        <div>
          <h3 className="label-thin text-black mb-10">Application Details</h3>
          <ApplicationForm taskId={taskId} />
        </div>
      </div>
    </div>
  );
}
