"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ApplicantList from "@/components/ApplicantList";

interface Application {
  id: string;
  user_id: string;
  proposal: string;
  status: string;
  team_members: string[];
  users: { email: string } | null;
}

interface Task {
  id: string;
  title: string;
  description: string;
  reward_points: number;
  deadline: string;
  status: string;
}

interface AdminTaskCardProps {
  task: Task;
  onUpdate: () => void;
}

export default function AdminTaskCard({ task, onUpdate }: AdminTaskCardProps) {
  const [open, setOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Shared fetch logic, extracted so both open-click and onUpdate can use it
  const fetchApplications = async () => {
    setLoadingApps(true);

    const { data: apps } = await supabase
      .from("applications")
      .select("id, user_id, proposal, status, team_members")
      .eq("task_id", task.id)
      .order("created_at", { ascending: true });

    if (!apps || apps.length === 0) {
      setApplications([]);
      setLoadingApps(false);
      setOpen(true);
      return;
    }

    // Deduplicate: keep only one application per user_id (latest wins via order)
    const seen = new Set<string>();
    const uniqueApps = apps.filter((a) => {
      if (seen.has(a.user_id)) return false;
      seen.add(a.user_id);
      return true;
    });

    const userIds = uniqueApps.map((a) => a.user_id);
    const { data: users } = await supabase
      .from("users")
      .select("id, email")
      .in("id", userIds);

    const emailMap = new Map((users ?? []).map((u) => [u.id, u.email]));

    const normalized: Application[] = uniqueApps.map((a) => ({
      ...a,
      users: { email: emailMap.get(a.user_id) ?? "Unknown" },
    }));

    setApplications(normalized);
    setLoadingApps(false);
    setOpen(true);
  };

  const handleViewApplicants = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    await fetchApplications();
  };

  const statusColor =
    task.status === "open"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : task.status === "assigned"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      : task.status === "completed"
      ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
      <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{task.title}</h3>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${statusColor}`}>
          {task.status}
        </span>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="flex gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-5">
        <span>🏆 {task.reward_points} pts</span>
        <span>📅 {task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : "N/A"}</span>
      </div>

      <button
        onClick={handleViewApplicants}
        className="px-4 py-2 text-sm font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition"
      >
        {loadingApps ? "Loading..." : open ? "Hide Applicants" : "View Applicants"}
      </button>

      {open && (
        <ApplicantList
          taskId={task.id}
          taskTitle={task.title}
          taskRewardPoints={task.reward_points}
          applications={applications}
          taskStatus={task.status}
          onUpdate={() => {
            // Refetch fresh apps and reopen so admin sees updated statuses immediately
            fetchApplications();
            onUpdate();
          }}
        />
      )}
    </div>
  );
}
