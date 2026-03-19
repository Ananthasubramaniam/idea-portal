import { supabase } from "@/lib/supabaseClient"
import TaskCard from "@/components/TaskCard"
import Link from "next/link"

export const dynamic = 'force-dynamic';

const howItWorksSteps = [
  {
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    title: "Post an Idea",
    desc: "Share your project idea, define required skills, and set a reward for contributors.",
  },
  {
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
      </svg>
    ),
    title: "Find Collaborators",
    desc: "Talented students review your project and apply with a proposal and team.",
  },
  {
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Build Together",
    desc: "Collaborate, ship the project, and earn points that climb the leaderboard.",
  },
];

export default async function Home() {
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .in("status", ["open", "assigned"])
    .order("created_at", { ascending: false })
    .limit(6);

  const { count: totalTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true });

  const { count: totalApps } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true });

  const { count: activeBuilders } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const { data: topUsers } = await supabase
    .from("users")
    .select("id, name, email, department, points")
    .order("points", { ascending: false })
    .order("name", { ascending: true })
    .limit(5);

  return (
    <div className="w-full text-black overflow-x-hidden">

      {/* ─── HERO ─── */}
      <section className="relative w-full min-h-[90vh] flex items-center bg-[var(--background)] overflow-hidden">
        {/* large grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute inset-0 z-0 mix-blend-overlay opacity-30 bg-noise pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-20 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Copy */}
            <div className="max-w-xl">
              <span className="label-thin text-black mb-6 inline-block">Campus Project Platform</span>

              <h1 className="leading-[0.95] tracking-tighter mb-8">
                <div className="text-[60px] md:text-[80px] font-black text-black">
                  Build Real Projects.
                </div>
                <div className="text-[60px] md:text-[80px] font-light italic text-[#E8A020]">
                  With Students.
                </div>
              </h1>

              <p className="text-zinc-500 mb-10 text-lg leading-relaxed max-w-md">
                Discover real student-led projects, find collaborators across campus, and build work that actually ships.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <a
                  href="#projects"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
                >
                  Browse Projects
                </a>
                <Link
                  href="/post-task"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold rounded-full border border-black text-black hover:bg-black/5 transition-colors"
                >
                  Post a Project
                </Link>
              </div>
            </div>

            {/* Right: Terminal Feed purely CSS */}
            <div className="hidden lg:block relative h-[400px] w-full max-w-md ml-auto border border-black/10 bg-white/50 backdrop-blur-sm rounded-xl p-6 overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-black/5">
                <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                <span className="ml-auto label-thin text-zinc-400">Live Activity</span>
              </div>
              <div className="relative h-full w-full mask-image-fade" style={{ WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)" }}>
                {(tasks || []).slice(0, 4).map((task, i) => (
                  <div 
                    key={task.id} 
                    className="absolute w-full animate-terminal opacity-0"
                    style={{ animationDelay: `${i * 3}s` }}
                  >
                    <div className="flex gap-4 items-start mb-4">
                      <div className="text-xs font-mono text-zinc-400 mt-0.5">{new Date(task.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div>
                        <div className="text-sm font-medium text-black">{task.title}</div>
                        <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Looking for {task.team_size} collaborators • {task.reward_points} pts</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="border-y border-black/10 bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-black/10">
            {[
              { val: `${totalTasks ?? 0}`, label: "Projects Posted" },
              { val: `${activeBuilders ?? 0}`, label: "Active Builders" },
              { val: `${totalApps ?? 0}`, label: "Collaborations" },
            ].map(({ val, label }) => (
              <div key={label} className="pt-8 md:pt-0 md:px-8 first:pt-0 first:px-0 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="text-[80px] font-light leading-none tracking-tighter text-black mb-4">{val}</div>
                <div className="label-thin text-zinc-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-[var(--background)] py-32 border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-20">
            <span className="label-thin text-black">Simple Process</span>
            <h2 className="text-[60px] font-black tracking-tighter text-black mt-4 leading-none mx-auto">How it works.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorksSteps.map((step, i) => (
              <div key={i} className="group">
                <div className="w-12 h-12 flex items-center justify-center border border-black/10 rounded-full mb-6 text-black bg-white">
                  {step.icon}
                </div>
                <div className="label-thin text-zinc-400 mb-4 tracking-widest">0{i + 1}</div>
                <h3 className="text-xl font-bold text-black mb-3">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROJECTS ─── */}
      <section id="projects" className="bg-white py-32 border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="label-thin text-black">Live Board</span>
              <h2 className="text-[60px] font-black tracking-tighter text-black mt-4 leading-none">Featured<br/>Projects.</h2>
            </div>
            <Link
              href="/post-task"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-full border border-black text-black hover:bg-black/5 transition-colors whitespace-nowrap"
            >
              Post yours
            </Link>
          </div>

          {error ? (
            <p className="text-sm text-zinc-400">Failed to load projects. Please try again.</p>
          ) : tasks && tasks.length > 0 ? (
            <div className="flex flex-col gap-px bg-black/5 border border-black/5 rounded-2xl overflow-hidden">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center flex flex-col items-center">
              <h3 className="text-[40px] font-light text-black mb-4 tracking-tight leading-none">Nothing here yet</h3>
              <p className="text-sm text-zinc-500 mb-8 max-w-md">No open projects currently available. Be the first to start a collaboration on campus.</p>
              <Link
                href="/post-task"
                className="inline-flex items-center px-6 py-3 text-sm font-bold rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
              >
                Post a Project
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── LEADERBOARD PREVIEW ─── */}
      <section className="bg-[var(--background)] py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            <div className="lg:col-span-4 lg:sticky lg:top-32">
              <span className="label-thin text-black">Hall of Fame</span>
              <h2 className="text-[60px] font-black tracking-tighter text-black mt-4 mb-6 leading-none">
                Top<br />Builders.
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed mb-10 max-w-sm">
                Students who contribute the most earn points and recognition across the platform.
              </p>
              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
              >
                View Full Leaderboard
              </Link>
            </div>

            <div className="lg:col-span-8">
              <div className="border border-black/10 bg-white">
                <div className="px-8 py-5 border-b border-black/10 flex items-center justify-between">
                  <span className="label-thin text-black">Top Builders</span>
                  <span className="label-thin text-zinc-400">This Week</span>
                </div>

                {topUsers && topUsers.length > 0 ? (
                  <div className="divide-y divide-black/5">
                    {topUsers.map((user, index) => {
                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between px-8 py-6 group hover:bg-black/5 transition-colors"
                        >
                          <div className="flex items-center gap-8">
                            <span className="text-[40px] leading-none font-light text-zinc-300 w-8 text-left group-hover:text-black transition-colors">
                              {index + 1}
                            </span>
                            <div>
                              <div className="text-base font-bold text-black group-hover:text-[#E8A020] transition-colors">
                                {user.name || user.email.split("@")[0]}
                              </div>
                              <div className="text-xs text-zinc-500 mt-1">{user.department || "Student"}</div>
                            </div>
                          </div>
                          <div className="text-right flex items-baseline gap-2">
                            <span className="text-xl font-mono text-black">{user.points}</span>
                            <span className="label-thin text-zinc-400">pts</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-16 text-center text-sm text-zinc-400">No leaderboard data yet.</div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </section>

    </div>
  );
}