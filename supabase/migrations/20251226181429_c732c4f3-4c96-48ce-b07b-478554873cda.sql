-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  push_subscription JSONB
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create meal_entries table
CREATE TABLE public.meal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  meal_description TEXT NOT NULL,
  photo_url TEXT,
  portion_size TEXT CHECK (portion_size IN ('small', 'normal', 'large')),
  eating_speed TEXT CHECK (eating_speed IN ('slow', 'normal', 'fast')),
  social_setting TEXT CHECK (social_setting IN ('solo', 'with_others')),
  bloating_rating INTEGER CHECK (bloating_rating BETWEEN 1 AND 5),
  rating_status TEXT DEFAULT 'pending' CHECK (rating_status IN ('pending', 'completed', 'skipped')),
  rating_due_at TIMESTAMP WITH TIME ZONE,
  detected_triggers JSONB DEFAULT '[]'::jsonb,
  notification_sent BOOLEAN DEFAULT FALSE
);

-- Enable RLS on meal_entries
ALTER TABLE public.meal_entries ENABLE ROW LEVEL SECURITY;

-- Meal entries policies
CREATE POLICY "Users can view own entries"
  ON public.meal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON public.meal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON public.meal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON public.meal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_insights table
CREATE TABLE public.user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  insights_data JSONB NOT NULL,
  entry_count_at_generation INTEGER,
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100)
);

-- Enable RLS on user_insights
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;

-- User insights policies
CREATE POLICY "Users can view own insights"
  ON public.user_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON public.user_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX meal_entries_user_id_idx ON public.meal_entries(user_id);
CREATE INDEX meal_entries_created_at_idx ON public.meal_entries(created_at DESC);
CREATE INDEX meal_entries_rating_status_idx ON public.meal_entries(rating_status);
CREATE INDEX user_insights_user_id_idx ON public.user_insights(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for meal_entries
CREATE TRIGGER update_meal_entries_updated_at
  BEFORE UPDATE ON public.meal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for meal photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('meal-photos', 'meal-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Storage policies for meal photos
CREATE POLICY "Anyone can view meal photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meal-photos');

CREATE POLICY "Users can upload their own meal photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own meal photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own meal photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);