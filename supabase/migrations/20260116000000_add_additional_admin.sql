-- Grant admin role to additional admin user (upham5111@gmail.com)
-- Also ensure upham51@gmail.com retains admin role
-- This migration is idempotent and safe to run multiple times

DO $$
DECLARE
  admin_user_id1 UUID;
  admin_user_id2 UUID;
BEGIN
  -- Get the user ID for upham51@gmail.com
  SELECT id INTO admin_user_id1
  FROM auth.users
  WHERE email = 'upham51@gmail.com'
  LIMIT 1;

  -- Get the user ID for upham5111@gmail.com
  SELECT id INTO admin_user_id2
  FROM auth.users
  WHERE email = 'upham5111@gmail.com'
  LIMIT 1;

  -- Grant admin role to upham51@gmail.com if user exists
  IF admin_user_id1 IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id1, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RAISE NOTICE 'Admin role granted/confirmed for upham51@gmail.com (user_id: %)', admin_user_id1;
  ELSE
    RAISE NOTICE 'User upham51@gmail.com not found in auth.users table';
  END IF;

  -- Grant admin role to upham5111@gmail.com if user exists
  IF admin_user_id2 IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id2, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RAISE NOTICE 'Admin role granted to upham5111@gmail.com (user_id: %)', admin_user_id2;
  ELSE
    RAISE NOTICE 'User upham5111@gmail.com not found yet. Admin role will be granted when user signs up.';
  END IF;
END $$;
