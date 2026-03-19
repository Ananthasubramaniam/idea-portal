"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        setUser(session?.user ?? null);
        if (session?.user) checkAndCreateProfile(session.user);
      } catch (error: any) {
        // If refresh fails, we just don't set a user (logged out state)
        if (error?.message?.includes('Refresh Token Not Found')) {
          await supabase.auth.signOut();
          setUser(null);
        }
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAndCreateProfile(session.user);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const checkAndCreateProfile = async (authUser: User) => {
    // Aggressive fallback: Kick out any existing non-edu accounts
    if (authUser.email && !authUser.email.toLowerCase().endsWith('saiuniversity.edu.in')) {
      await supabase.auth.signOut();
      alert("Access restricted: Only saiuniversity.edu.in educational accounts are allowed to use this portal.");
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single();

    if (error && error.code === 'PGRST116') {
      await supabase.from('users').insert([{
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
        role: 'student',
        points: 0,
      }]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'bg-[var(--background)]/80 backdrop-blur-md border-b border-black/10' : 'bg-transparent border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center text-[13px] font-medium">
          {/* Logo */}
          <Link href="/" className="font-bold text-black flex items-center gap-2 tracking-tight">
            Idea Portal
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-zinc-500 hover:text-black hover:bg-black/5 px-2 py-1 rounded transition-colors">
              Browse
            </Link>
            <Link href="/leaderboard" className="text-zinc-500 hover:text-black hover:bg-black/5 px-2 py-1 rounded transition-colors">
              Leaderboard
            </Link>
            {user && (
              <>
                <Link href="/dashboard" className="text-zinc-500 hover:text-black hover:bg-black/5 px-2 py-1 rounded transition-colors">
                  Dashboard
                </Link>
                <Link href="/profile" className="text-zinc-500 hover:text-black hover:bg-black/5 px-2 py-1 rounded transition-colors">
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center">
            {user ? (
              <button
                onClick={handleLogout}
                className="text-zinc-500 hover:text-black hover:bg-black/5 px-2 py-1 rounded transition-colors"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="text-white bg-black px-4 py-1.5 rounded hover:bg-zinc-800 transition-colors shadow-none font-bold"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
