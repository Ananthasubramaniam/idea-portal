"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { sendNewApplicationEmail } from "@/lib/email";

interface ApplicationFormProps {
  taskId: string;
}

export default function ApplicationForm({ taskId }: ApplicationFormProps) {
  const router = useRouter();
  const [proposal, setProposal] = useState("");
  const [teamMembers, setTeamMembers] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Parse team members string to array
      const parsedMembers = teamMembers
        .split(",")
        .map(email => email.trim())
        .filter(email => email !== "");

      const { error } = await supabase.from("applications").insert([
        {
          task_id: taskId,
          user_id: user.id,
          proposal,
          team_members: parsedMembers,
          status: "pending",
        },
      ]);

      if (error) {
        throw error;
      }

      // Fetch task title to send in email
      const { data: taskData } = await supabase
        .from("tasks")
        .select("title")
        .eq("id", taskId)
        .single();
        
      if (taskData) {
        // Fire-and-forget — don't block the redirect on email delivery
        sendNewApplicationEmail(taskData.title, user.email || "Unknown Student");
      }

      router.push(`/task/${taskId}?applied=true`);
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit application. Please try again.";
      setErrorMsg(message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {errorMsg && (
        <div className="p-4 text-[13px] font-medium bg-red-50 text-red-700 border border-red-100">
          {errorMsg}
        </div>
      )}
      <div className="space-y-8">
        <div>
          <label htmlFor="teamMembers" className="label-thin block text-zinc-500 mb-4">
            Team Members (Optional)
          </label>
          <input
            id="teamMembers"
            type="text"
            value={teamMembers}
            onChange={(e) => setTeamMembers(e.target.value)}
            placeholder="e.g. mahesh@saiuniversity.edu.in, rahul@saiuniversity.edu.in"
            className="w-full pb-4 bg-transparent border-b border-black/20 text-black focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-zinc-300 text-[15px]"
          />
        </div>
        <div>
          <label htmlFor="proposal" className="label-thin block text-zinc-500 mb-4">
            Your Proposal
          </label>
          <textarea
            id="proposal"
            rows={5}
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Explain why you are interested in this project and what skills you bring."
            className="w-full pb-4 bg-transparent border-b border-black/20 text-black focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-zinc-300 text-[15px] resize-y"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-5 px-4 rounded-none text-[13px] font-bold tracking-widest uppercase text-white bg-black hover:bg-zinc-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
