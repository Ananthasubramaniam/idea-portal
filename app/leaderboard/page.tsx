"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UserRank {
  id: string;
  name: string | null;
  email: string;
  department: string | null;
  points: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from("users")
      .select("id, name, email, department, points")
      .order("points", { ascending: false })
      .order("name", { ascending: true }); // tie breaker

    if (data) {
      setUsers(data as UserRank[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <p className="label-thin text-zinc-500 animate-pulse">Loading Leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden pt-32 pb-32">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="mb-24">
          <span className="label-thin text-black">Hall of Fame</span>
          <h1 className="text-[60px] lg:text-[80px] font-black tracking-tighter text-black leading-none mt-4">
            Leaderboard.
          </h1>
        </div>

        {users.length === 0 ? (
          <div className="py-20 text-center border-t border-black/10">
            <h3 className="text-[40px] font-light text-black mb-4 tracking-tight leading-none">Nothing here yet</h3>
            <p className="text-sm text-zinc-400">No leaderboard data found.</p>
          </div>
        ) : (
          <div className="flex flex-col border-t border-black/10">
            
            {/* Header row */}
            <div className="flex items-center justify-between py-4 border-b border-black/10 bg-[var(--background)] sticky top-16 z-10">
              <span className="label-thin text-zinc-500 w-24">Rank</span>
              <span className="label-thin text-zinc-500 flex-1">Builder</span>
              <span className="label-thin text-zinc-500 w-32 text-right">Points</span>
            </div>

            <div className="flex flex-col">
              {users.map((user, index) => {
                const isFirst = index === 0;
                
                return (
                  <div 
                    key={user.id} 
                    className={`flex items-center justify-between py-6 border-b border-black/5 hover:bg-black/5 transition-colors relative group ${isFirst ? 'bg-white' : ''}`}
                  >
                    {isFirst && (
                      <div className="absolute top-0 left-[-24px] w-[2px] h-full bg-black" />
                    )}
                    
                    <div className="flex items-center gap-8 md:gap-12 flex-1">
                      <div className="w-24 shrink-0">
                        <span className={`leading-none text-black ${isFirst ? 'text-[80px] text-ultra-thin' : 'text-[80px] text-ultra-thin text-zinc-300 group-hover:text-black transition-colors'}`}>
                          {index + 1}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className={`${isFirst ? 'text-[24px] font-black' : 'text-[20px] font-bold'} tracking-tight text-black group-hover:text-[#E8A020] transition-colors leading-none`}>
                          {user.name || user.email.split("@")[0]}
                        </div>
                        <div className="text-sm text-zinc-500 mt-2">{user.department || "Student"}</div>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-baseline gap-2 shrink-0 pr-4">
                      <span className={`${isFirst ? 'text-4xl' : 'text-3xl'} font-mono text-black`}>{user.points}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
