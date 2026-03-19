-- Supabase Schema for SaiU Launchpad

-- 1. Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  name text,
  department text,
  role text DEFAULT 'student'::text,
  points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. Create tasks table (assuming it might not fully exist yet)
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  skills_required text[],
  team_size integer,
  reward_points integer,
  deadline timestamp with time zone,
  status text DEFAULT 'open'::text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid REFERENCES public.users(id) ON DELETE CASCADE
);

-- Enable RLS for tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies for tasks table
CREATE POLICY "Anyone can view open tasks" ON public.tasks FOR SELECT USING (status = 'open');
CREATE POLICY "Users can insert tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = created_by);
