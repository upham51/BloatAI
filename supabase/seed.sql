-- Seed file for Gut Guardian
-- This file sets up the initial admin user

-- Grant admin role to upham51@gmail.com
-- This is idempotent and safe to run multiple times
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID for upham51@gmail.com
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'upham51@gmail.com'
  LIMIT 1;

  -- Only proceed if the user exists
  IF admin_user_id IS NOT NULL THEN
    -- Insert admin role if it doesn't already exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Admin role granted to upham51@gmail.com (user_id: %)', admin_user_id;
  ELSE
    RAISE NOTICE 'User upham51@gmail.com not found in auth.users table';
  END IF;
END $$;
