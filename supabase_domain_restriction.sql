-- Strict Domain Restriction Trigger
-- This ensures that NO ONE can bypass the frontend and create an account directly 
-- via API unless their email ends in saiuniversity.edu.in

CREATE OR REPLACE FUNCTION public.check_email_domain()
RETURNS trigger AS $$
BEGIN
  -- Check if the email ends with 'saiuniversity.edu.in'
  IF NEW.email NOT LIKE '%saiuniversity.edu.in' THEN
    RAISE EXCEPTION 'Access rejected: Only saiuniversity.edu.in educational accounts are permitted.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the trigger already exists and drop it to ensure clean creation
DROP TRIGGER IF EXISTS restrict_email_domain_trigger ON auth.users;

-- Bind the trigger so it fires immediately before a new user tries to register
CREATE TRIGGER restrict_email_domain_trigger
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.check_email_domain();
