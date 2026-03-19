-- Migration to add missing created_at column to tasks table
ALTER TABLE IF EXISTS public.tasks 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
