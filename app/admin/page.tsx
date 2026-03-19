"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminTaskCard from "@/components/AdminTaskCard";

interface Task {
  id: string;
  title: string;
  description: string;
  reward_points: number;
  deadline: string;
  status: string;
}

type PageState = "loading" | "unauthorized" | "ready";

export default function AdminPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from("tasks")
      .select("id, title, description, reward_points, deadline, status")
      .order("created_at", { ascending: false });
    setTasks((data as Task[]) ?? []);
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        setPageState("unauthorized");
        return;
      }

      await fetchTasks();
      setPageState("ready");
    };

    init();
  }, [router, fetchTasks]);

  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500">Loading admin dashboard...</p>
      </div>
    );
  }

  if (pageState === "unauthorized") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Access Denied</h1>
        <p className="text-zinc-500">You do not have permission to view this page.</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold text-sm hover:opacity-80 transition"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Manage all tasks, review applicants, assign teams, and award points.
          </p>
        </div>

        {/* Open Tasks */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            Open Tasks
          </h2>
          {tasks.filter(t => t.status === 'open').length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 text-sm">No open tasks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {tasks.filter(t => t.status === 'open').map((task) => (
                <AdminTaskCard key={task.id} task={task} onUpdate={fetchTasks} />
              ))}
            </div>
          )}
        </section>

        {/* Assigned Tasks */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            Assigned Tasks
          </h2>
          {tasks.filter(t => t.status === 'assigned').length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 text-sm">No tasks currently assigned.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {tasks.filter(t => t.status === 'assigned').map((task) => (
                <AdminTaskCard key={task.id} task={task} onUpdate={fetchTasks} />
              ))}
            </div>
          )}
        </section>

        {/* Completed Tasks */}
        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600"></span>
            Completed Tasks
          </h2>
          {tasks.filter(t => t.status === 'completed').length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 text-sm">No completed tasks yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {tasks.filter(t => t.status === 'completed').map((task) => (
                <AdminTaskCard key={task.id} task={task} onUpdate={fetchTasks} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
