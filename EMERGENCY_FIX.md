# 🚨 EMERGENCY FIX - Run This SQL NOW

## Go to Lovable → Supabase → SQL Editor

Copy and paste this **ONE LINE** (replace with your email):

```sql
UPDATE public.profiles
SET onboarding_completed = true
WHERE email = 'YOUR-ADMIN-EMAIL@example.com';
```

**Change `YOUR-ADMIN-EMAIL@example.com` to your actual admin email!**

Click "Run"

---

## What This Does:
- Marks your admin account as "onboarding completed"
- Uses EXISTING column (no need to add new columns yet)
- Your admin account will bypass the onboarding modal immediately

---

## After Running:
1. Refresh your Lovable app
2. Clear browser cache (Ctrl+Shift+Delete → Cached images)
3. Log out and log back in
4. Should go straight to dashboard!

---

## Then Run Full Migration Later:
After your admin account works, run the FULL SQL from SETUP_SQL.md to add all the new columns for future users.

---

## Check If It Worked:
```sql
SELECT email, onboarding_completed
FROM public.profiles
WHERE email = 'YOUR-ADMIN-EMAIL@example.com';
```

Should return: `onboarding_completed: true`
