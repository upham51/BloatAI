-- Add admin tracking fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS admin_granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS admin_granted_at TIMESTAMP WITH TIME ZONE;

-- Create admin_actions audit log table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'grant_subscription', 'revoke_subscription', 'grant_role', 'revoke_role', 'delete_user'
  action_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_actions (only admins can view and insert)
CREATE POLICY "Admins can view all admin actions"
ON public.admin_actions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert admin actions"
ON public.admin_actions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create indexes for admin_actions
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user_id ON public.admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON public.admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);

-- Add admin policies for profiles table (allow admins to update subscription fields of other users)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for user_roles table (allow admins to manage roles)
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policy for meal_entries (allow admins to view all entries)
CREATE POLICY "Admins can view all meal entries"
ON public.meal_entries
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policy for user_insights (allow admins to view all insights)
CREATE POLICY "Admins can view all user insights"
ON public.user_insights
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policy for root_cause_assessments (allow admins to view all assessments)
CREATE POLICY "Admins can view all assessments"
ON public.root_cause_assessments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
