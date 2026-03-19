-- Add team_members column to applications table
ALTER TABLE applications ADD COLUMN team_members text[] DEFAULT '{}';
