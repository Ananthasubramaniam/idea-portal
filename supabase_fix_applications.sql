-- Fix: Add missing created_at column to applications table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
