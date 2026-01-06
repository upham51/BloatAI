-- Create root_cause_assessments table
CREATE TABLE public.root_cause_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  retake_number INTEGER NOT NULL DEFAULT 1,
  overall_score INTEGER NOT NULL DEFAULT 0,
  aerophagia_score INTEGER NOT NULL DEFAULT 0,
  motility_score INTEGER NOT NULL DEFAULT 0,
  dysbiosis_score INTEGER NOT NULL DEFAULT 0,
  brain_gut_score INTEGER NOT NULL DEFAULT 0,
  hormonal_score INTEGER NOT NULL DEFAULT 0,
  structural_score INTEGER NOT NULL DEFAULT 0,
  lifestyle_score INTEGER NOT NULL DEFAULT 0,
  primary_root_cause TEXT,
  secondary_root_cause TEXT,
  answers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.root_cause_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own assessments" 
ON public.root_cause_assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" 
ON public.root_cause_assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" 
ON public.root_cause_assessments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments" 
ON public.root_cause_assessments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_root_cause_assessments_updated_at
BEFORE UPDATE ON public.root_cause_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();