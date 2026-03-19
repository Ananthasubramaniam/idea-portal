"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { sendApplicationDecisionEmail } from "@/lib/email";

interface Application {
  id: string;
  user_id: string;
  proposal: string;
  status: string;
  team_members: string[];
  users: { email: string } | null;
}

interface ApplicantListProps {
  taskId: string;
  taskTitle: string;
  taskRewardPoints: number;
  applications: Application[];
  taskStatus: string;
  onUpdate: () => void;
}

export default function ApplicantList({
  taskId,
  taskTitle,
  taskRewardPoints,
  applications,
  taskStatus,
  onUpdate,
}: ApplicantListProps) {
  const [selected, setSelected] = useState<string[]>(
    applications.filter((a) => a.status === "accepted").map((a) => a.id)
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const toggleSelect = (appId: string) => {
    setSelected((prev) => {
      if (prev.includes(appId)) return prev.filter((id) => id !== appId);
      return [...prev, appId];
    });
  };

  const handleAssignTeam = async () => {
    setLoading(true);
    setMsg(null);
    try {
      // Accept selected, reject the rest
      for (const app of applications) {
        const newStatus = selected.includes(app.id) ? "accepted" : "rejected";
        await supabase
          .from("applications")
          .update({ status: newStatus })
          .eq("id", app.id);
          
        if (app.users?.email) {
          // Fire-and-forget — don't block team assignment on email delivery
          sendApplicationDecisionEmail(taskTitle, app.users.email, newStatus);
        }
      }
      // Update task status to "assigned"
      await supabase.from("tasks").update({ status: "assigned" }).eq("id", taskId);
      setMsg("Team assigned successfully.");
      onUpdate();
    } catch {
      setMsg("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleMarkCompleted = async () => {
    setLoading(true);
    setMsg(null);
    try {
      // Find accepted applicants
      const accepted = applications.filter((a) => a.status === "accepted");

      // Add reward points to each accepted user
      for (const app of accepted) {
        const { data: userData } = await supabase
          .from("users")
          .select("points")
          .eq("id", app.user_id)
          .single();
        const currentPoints = userData?.points ?? 0;
        
        // Reward Leader
        await supabase
          .from("users")
          .update({ points: currentPoints + taskRewardPoints })
          .eq("id", app.user_id);

        // Reward Team Members
        if (app.team_members && app.team_members.length > 0) {
          for (const memberEmail of app.team_members) {
            // Find user by email
            const { data: memberData } = await supabase
              .from("users")
              .select("id, points")
              .eq("email", memberEmail)
              .single();

            if (memberData) {
              await supabase
                .from("users")
                .update({ points: (memberData.points ?? 0) + taskRewardPoints })
                .eq("id", memberData.id);
            }
          }
        }
      }

      // Mark task as completed
      await supabase.from("tasks").update({ status: "completed" }).eq("id", taskId);
      setMsg(`Task marked as completed. ${taskRewardPoints} pts awarded to each team member.`);
      onUpdate();
    } catch {
      setMsg("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3">
      {applications.length === 0 ? (
        <p className="text-sm text-zinc-500 italic">No applications yet.</p>
      ) : (
        <>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
            Select applicants to assign to the team:
          </p>
          {applications.map((app) => {
            const isSelected = selected.includes(app.id);
            const isDisabled = false;
            return (
              <div
                key={app.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  app.status === "accepted"
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : app.status === "rejected"
                    ? "bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 opacity-60"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {taskStatus === "open" || taskStatus === "assigned" ? (
                  <input
                    type="checkbox"
                    className="mt-1 accent-blue-600 w-4 h-4 shrink-0"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => toggleSelect(app.id)}
                  />
                ) : null}
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    Leader: {app.users?.email ?? "Unknown user"}
                  </p>
                  {app.team_members && app.team_members.length > 0 && (
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5 mb-1.5 break-words">
                      Members: {app.team_members.join(", ")}
                    </p>
                  )}
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{app.proposal}</p>
                </div>
                <span
                  className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                    app.status === "accepted"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      : app.status === "rejected"
                      ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {app.status}
                </span>
              </div>
            );
          })}

          {msg && (
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{msg}</p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {/* Only show Assign Team when status is open */}
            {taskStatus === "open" && (
              <button
                onClick={handleAssignTeam}
                disabled={loading || selected.length === 0}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? "Saving..." : "Assign Team"}
              </button>
            )}
            {/* Once assigned, show reassign + mark complete */}
            {taskStatus === "assigned" && (
              <>
                <button
                  onClick={handleAssignTeam}
                  disabled={loading || selected.length === 0}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition"
                >
                  {loading ? "Saving..." : "Re-assign Team"}
                </button>
                <button
                  onClick={handleMarkCompleted}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {loading ? "Processing..." : "Mark Task Completed"}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
