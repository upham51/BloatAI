-- Automatically grant admin role to specific emails upon signup
-- This ensures upham51@gmail.com and upham5111@gmail.com get admin immediately

-- Create or replace function to auto-grant admin role
CREATE OR REPLACE FUNCTION public.auto_grant_admin_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_emails TEXT[] := ARRAY['upham51@gmail.com', 'upham5111@gmail.com'];
BEGIN
  -- Check if the new user's email is in the admin list
  IF NEW.email = ANY(admin_emails) THEN
    -- Grant admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Auto-granted admin role to %', NEW.email;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_grant_admin ON auth.users;

-- Create trigger on auth.users insert
CREATE TRIGGER trigger_auto_grant_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_grant_admin_on_signup();

COMMENT ON FUNCTION public.auto_grant_admin_on_signup() IS 'Automatically grants admin role to whitelisted emails upon user creation';
