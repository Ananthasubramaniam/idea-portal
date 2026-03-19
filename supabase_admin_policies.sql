-- Admin RLS Policies for SaiU Launchpad
-- Run this in your Supabase SQL Editor after supabase_applications.sql

-- 1. Allow admins to VIEW all applications
CREATE POLICY "Admins can view all applications"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 2. Allow admins to UPDATE application status (accept/reject)
CREATE POLICY "Admins can update all applications"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 3. Allow admins to UPDATE any task status (assigned, completed)
CREATE POLICY "Admins can update any task"
  ON public.tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 4. Allow admins to VIEW all users (needed for applicant email display)
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users AS u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- 5. Allow admins to UPDATE user points (for task completion reward)
CREATE POLICY "Admins can update user points"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users AS u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- 6. Allow admins to VIEW all tasks (not just open ones)
CREATE POLICY "Admins can view all tasks"
  ON public.tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
