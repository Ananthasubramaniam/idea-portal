"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DashboardCard from "@/components/DashboardCard";
import Link from "next/link";

interface Application {
  id: string;
  status: string;
  tasks: {
    id: string;
    title: string;
    description: string;
    status: string;
    deadline: string;
    reward_points: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed'>('active');

  const fetchDashboardData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const selectFields = `
      id,
      status,
      tasks (
        id,
        title,
        description,
        status,
        deadline,
        reward_points
      )
    `;

    // Fetch applications where the user is the leader
    const { data: ownApps } = await supabase
      .from("applications")
      .select(selectFields)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Fetch applications where user was added as a team member
    const { data: teamApps } = user.email
      ? await supabase
          .from("applications")
          .select(selectFields)
          .contains("team_members", [user.email])
          .order("created_at", { ascending: false })
      : { data: [] };

    // Merge and deduplicate by id
    const seen = new Set<string>();
    const merged = [...(ownApps ?? []), ...(teamApps ?? [])].filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });

    setApplications(merged as unknown as Application[]);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <p className="label-thin text-zinc-500 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const pendingOrRejectedApps = applications.filter(
    (app) => app.status === "pending" || app.status === "rejected"
  );
  
  const assignedApps = applications.filter(
    (app) => app.status === "accepted" && app.tasks?.status !== "completed"
  );

  const completedApps = applications.filter(
    (app) => app.status === "accepted" && app.tasks?.status === "completed"
  );

  const currentList = activeTab === 'active' ? assignedApps : activeTab === 'pending' ? pendingOrRejectedApps : completedApps;

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'active': return { text: "No active assignments. Browse projects to find your first collaboration.", cta: "Browse Projects", link: "/#projects" };
      case 'pending': return { text: "You have no pending applications. Apply to a project to get started.", cta: "Find a Project", link: "/#projects" };
      case 'completed': return { text: "You haven't completed any projects yet. Keep building!", cta: "View Board", link: "/#projects" };
    }
  }
  const emptyState = getEmptyStateMessage();

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-24">
          <span className="label-thin text-black">Student Dashboard</span>
          <h1 className="text-[60px] lg:text-[80px] font-black tracking-tighter text-black leading-[0.95] mt-6">
            Welcome back.
          </h1>
        </div>

        {/* 60/40 Asymmetric Grid */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start border-t border-black/10 pt-16 mt-8">
          
          {/* LEFT: 60% Content Area */}
          <div className="w-full lg:w-[60%] flex flex-col md:flex-row gap-12 md:gap-16">
            
            {/* Left-side tab navigation */}
            <div className="flex md:flex-col gap-6 shrink-0 md:w-32 overflow-x-auto pb-4 md:pb-0 hide-scrollbar border-b md:border-b-0 border-black/10 md:border-transparent">
              <button 
                onClick={() => setActiveTab('active')}
                className={`flex items-center gap-3 text-sm transition-colors ${activeTab === 'active' ? 'text-black font-bold' : 'text-zinc-400 font-medium hover:text-black'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'active' ? 'bg-[#E8A020]' : 'bg-transparent border border-zinc-300'}`} />
                Active
                <span className="ml-auto text-[10px] font-mono opacity-50">{assignedApps.length}</span>
              </button>
              <button 
                onClick={() => setActiveTab('pending')}
                className={`flex items-center gap-3 text-sm transition-colors ${activeTab === 'pending' ? 'text-black font-bold' : 'text-zinc-400 font-medium hover:text-black'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'pending' ? 'bg-[#E8A020]' : 'bg-transparent border border-zinc-300'}`} />
                Pending
                <span className="ml-auto text-[10px] font-mono opacity-50">{pendingOrRejectedApps.length}</span>
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`flex items-center gap-3 text-sm transition-colors ${activeTab === 'completed' ? 'text-black font-bold' : 'text-zinc-400 font-medium hover:text-black'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'completed' ? 'bg-[#E8A020]' : 'bg-transparent border border-zinc-300'}`} />
                Done
                <span className="ml-auto text-[10px] font-mono opacity-50">{completedApps.length}</span>
              </button>
            </div>

            {/* Project List */}
            <div className="flex-1 w-full flex flex-col pt-0 md:-mt-6">
              {currentList.length === 0 ? (
                <div className="py-12 border-t border-black/5 md:border-t-0 flex flex-col items-start text-left">
                  <h3 className="text-[40px] md:text-[50px] font-light text-black mb-4 tracking-tight leading-none max-w-sm">Nothing here yet</h3>
                  <p className="text-sm text-zinc-500 mb-8 max-w-sm">{emptyState.text}</p>
                  <Link href={emptyState.link} className="bg-black text-white px-8 py-3.5 rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors">
                    {emptyState.cta}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col border-t border-black/10">
                  {currentList.map((app) => (
                    <DashboardCard
                      key={app.id}
                      task={app.tasks}
                      applicationStatus={app.status}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: 40% Sticky Activity Sidebar */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-32 border-l border-black/5 lg:pl-16">
            <span className="label-thin text-black mb-10 block">Activity Timeline</span>
            
            <div className="relative">
              {applications.length > 0 ? (
                <>
                  <div className="absolute left-[5px] top-2 bottom-0 w-px bg-black/10 z-0"></div>
                  <div className="flex flex-col gap-12 relative z-10">
                    {applications.slice(0, 8).map((app, i) => {
                      const isAccepted = app.status === "accepted";
                      const isRejected = app.status === "rejected";
                      const isPending = app.status === "pending";
                      
                      return (
                        <div key={app.id} className="flex gap-6 items-start">
                          <div className={`w-3 h-3 rounded-full shrink-0 mt-1.5 border-[3px] border-[var(--background)] shadow-[0_0_0_2px_var(--background)] ${isAccepted ? 'bg-[#E8A020]' : isRejected ? 'bg-zinc-300' : 'bg-black'}`} />
                          <div>
                            <div className="text-sm font-bold text-black transition-colors">
                              {app.tasks?.title ?? "Project"}
                            </div>
                            <p className="text-[13px] text-zinc-500 mt-2 leading-relaxed">
                              {isAccepted
                                ? "Your application was accepted. You are now part of the team."
                                : isRejected
                                ? "Your application was not selected."
                                : "Application submitted and pending review."}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-sm text-zinc-500">No recent activity.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
