# Admin Access Setup

## Automatic Setup

The migration file `supabase/migrations/20260113000000_grant_initial_admin.sql` will automatically grant admin access to `upham51@gmail.com` when applied to your Supabase database.

## Manual Setup (if migration doesn't auto-apply)

If you need to manually grant admin access, follow these steps:

### Option 1: Using Supabase Dashboard SQL Editor

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. Run the following SQL query:

```sql
-- Grant admin role to upham51@gmail.com
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID for upham51@gmail.com
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'upham51@gmail.com'
  LIMIT 1;

  -- Insert admin role if it doesn't already exist
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Admin role granted successfully';
  ELSE
    RAISE EXCEPTION 'User not found. Please ensure upham51@gmail.com account exists.';
  END IF;
END $$;
```

### Option 2: Grant Admin to Any User by Email

To grant admin access to any user:

```sql
-- Replace 'user@example.com' with the desired email
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'user@example.com'
  LIMIT 1;

  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Admin role granted to user@example.com';
  ELSE
    RAISE EXCEPTION 'User not found';
  END IF;
END $$;
```

## Verifying Admin Access

After granting admin access:

1. Log out and log back in to your account
2. Navigate to `/admin` in your application
3. You should now see the admin dashboard with:
   - User metrics
   - System statistics
   - Admin navigation menu

## Troubleshooting

### "User not found" error
- Ensure the user account has been created by signing up through the app
- Check that the email address is correct (case-sensitive)
- Verify the user exists in the `auth.users` table

### Still can't access admin dashboard
1. Clear browser cache and cookies
2. Log out completely and log back in
3. Check browser console for any errors
4. Verify the `user_roles` table has an entry for your user with role='admin':

```sql
SELECT ur.*, au.email
FROM public.user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'upham51@gmail.com';
```

## Removing Admin Access

To remove admin access from a user:

```sql
DELETE FROM public.user_roles
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
)
AND role = 'admin';
```
