"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function PostTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setAuthChecking(false);
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic Validation
    if (!title || !description || !skills || !teamSize || !rewardPoints || !deadline) {
      setErrorMsg("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);

      const { error } = await supabase.from("tasks").insert([
        {
          title,
          description,
          skills_required: skillsArray,
          team_size: parseInt(teamSize, 10),
          reward_points: parseInt(rewardPoints, 10),
          deadline: new Date(deadline).toISOString(),
          status: "open",
          created_by: user?.id
        }
      ]);

      if (error) {
        throw error;
      }

      // Redirect to homepage on success
      router.push("/");
      router.refresh();
      
    } catch (error: any) {
      console.error("Error inserting task:", error);
      setErrorMsg(error.message || "Failed to post the task. Please try again.");
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-500">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 overflow-x-hidden pt-12 relative flex justify-center items-center">
      {/* Background decoration */}
      <div
        className="absolute top-0 inset-x-0 h-[500px] -z-10"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%),
            linear-gradient(180deg, #f8f9fb 0%, #fafbff 100%)
          `,
        }}
      />
      <div className="w-full max-w-2xl px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full mb-6">
            For Founders
          </span>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-black mb-4">
            Post a Project
          </h1>
          <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
            Share a project requirement and collaborate with students across campus.
          </p>
        </div>

        <div 
          className="bg-white rounded-3xl p-8 sm:p-10 border border-zinc-100"
          style={{ boxShadow: "0 8px 40px -8px rgba(99,102,241,0.06), 0 2px 10px rgba(0,0,0,0.03)" }}
        >
          {errorMsg && (
            <div className="mb-6 px-4 py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-100 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-black mb-2">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build a mobile app for the cafeteria"
                className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm placeholder:text-zinc-400"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-bold text-black mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the project goals, deliverables, and timeline..."
                className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm placeholder:text-zinc-400"
                required
              />
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-bold text-black mb-2">
                Skills Required
              </label>
              <input
                id="skills"
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Node, UI Design (comma separated)"
                className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm placeholder:text-zinc-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="teamSize" className="block text-sm font-bold text-black mb-2">
                  Team Size
                </label>
                <input
                  id="teamSize"
                  type="number"
                  min="1"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm placeholder:text-zinc-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="rewardPoints" className="block text-sm font-bold text-black mb-2">
                  Reward Points
                </label>
                <input
                  id="rewardPoints"
                  type="number"
                  min="0"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm placeholder:text-zinc-400"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-bold text-black mb-2">
                Deadline
              </label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm placeholder:text-zinc-400"
                required
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-base font-semibold text-white bg-zinc-900 hover:bg-black hover:scale-[1.02] transition-all shadow-md disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {loading ? "Posting..." : "Post Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
