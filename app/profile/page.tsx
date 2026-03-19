"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProfileProjectCard from "@/components/ProfileProjectCard";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  department: string | null;
  points: number;
}

interface CompletedTask {
  id: string;
  title: string;
  description: string;
  reward_points: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);

  const fetchProfileData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // 1. Fetch user profile
    const { data: profileData } = await supabase
      .from("users")
      .select("id, name, email, department, points")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData as UserProfile);
    }

    // 2. Fetch completed tasks assigned to this user
    // Join applications with tasks where app.status = 'accepted' and task.status = 'completed'
    const { data: apps } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        tasks!inner (
          id,
          title,
          description,
          status,
          reward_points
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "accepted")
      .eq("tasks.status", "completed");

    if (apps) {
      // Maps inner joined 'tasks' array/object down to CompletedTask type
      const tasksList = apps.map((app: any) => app.tasks).flat();
      setCompletedTasks(tasksList as CompletedTask[]);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-32 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-24">
        
        {/* Profile Header */}
        <div>
          <span className="label-thin text-black">Student Profile</span>
          <h1 className="text-[60px] lg:text-[80px] font-black tracking-tighter text-black leading-none mt-4">
            {profile.name || "Student."}
          </h1>
        </div>

        {/* Profile Card / Stats */}
        <div className="border border-black/10 p-8 sm:p-12 flex flex-col sm:flex-row gap-12 items-start sm:items-center bg-white">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-black/20 flex items-center justify-center text-black text-[40px] font-light uppercase flex-shrink-0">
              {profile.name ? profile.name[0] : profile.email[0]}
            </div>

            <div className="flex-grow">
              <div className="flex flex-col gap-4 text-zinc-500 text-[15px]">
                <span className="flex items-center gap-4">
                  <span className="label-thin text-black w-16">Email</span>
                  <span className="truncate">{profile.email}</span>
                </span>
                {profile.department && (
                  <span className="flex items-center gap-4">
                    <span className="label-thin text-black w-16">Dept</span>
                    <span className="truncate">{profile.department}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right py-5 sm:pl-12 sm:border-l border-black/10">
              <div className="label-thin text-black mb-2">Total Score</div>
              <div className="text-[60px] font-mono text-black leading-none">
                {profile.points}
              </div>
            </div>
        </div>

        {/* Completed Projects History */}
        <div className="space-y-8">
          <h2 className="label-thin text-black pb-4 border-b border-black/10">Completed Projects</h2>
          {completedTasks.length === 0 ? (
            <div className="py-12 flex flex-col items-start border-b border-black/5">
              <h3 className="text-[40px] font-light text-black mb-4 tracking-tight leading-none">Nothing here yet</h3>
              <p className="text-sm text-zinc-500">You haven&apos;t completed any projects yet. Browse tasks and start contributing to earn points!</p>
            </div>
          ) : (
            <div className="flex flex-col border-t border-black/10">
              {completedTasks.map((task) => (
                <ProfileProjectCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
