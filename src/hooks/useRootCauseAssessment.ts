import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RootCauseAssessment } from '@/types/quiz';

export function useRootCauseAssessment(userId: string | undefined) {
  return useQuery({
    queryKey: ['root-cause-assessment', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await (supabase as any)
        .from('root_cause_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as RootCauseAssessment | null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}

export function useAllAssessments(userId: string | undefined) {
  return useQuery({
    queryKey: ['all-root-cause-assessments', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await (supabase as any)
        .from('root_cause_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data as RootCauseAssessment[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assessmentId: string) => {
      const { error } = await (supabase as any)
        .from('root_cause_assessments')
        .delete()
        .eq('id', assessmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['root-cause-assessment'] });
      queryClient.invalidateQueries({ queryKey: ['all-root-cause-assessments'] });
    },
  });
}

export function useAssessmentComparison(userId: string | undefined) {
  const { data: assessments } = useAllAssessments(userId);

  if (!assessments || assessments.length < 2) {
    return null;
  }

  const current = assessments[0];
  const previous = assessments[1];

  const improvements = [
    {
      category: 'Aerophagia',
      change: previous.aerophagia_score - current.aerophagia_score,
      percentageChange: ((previous.aerophagia_score - current.aerophagia_score) / previous.aerophagia_score) * 100,
    },
    {
      category: 'Motility',
      change: previous.motility_score - current.motility_score,
      percentageChange: ((previous.motility_score - current.motility_score) / previous.motility_score) * 100,
    },
    {
      category: 'Dysbiosis',
      change: previous.dysbiosis_score - current.dysbiosis_score,
      percentageChange: ((previous.dysbiosis_score - current.dysbiosis_score) / previous.dysbiosis_score) * 100,
    },
    {
      category: 'Brain-Gut',
      change: previous.brain_gut_score - current.brain_gut_score,
      percentageChange: ((previous.brain_gut_score - current.brain_gut_score) / previous.brain_gut_score) * 100,
    },
    {
      category: 'Hormonal',
      change: previous.hormonal_score - current.hormonal_score,
      percentageChange: ((previous.hormonal_score - current.hormonal_score) / previous.hormonal_score) * 100,
    },
    {
      category: 'Structural',
      change: previous.structural_score - current.structural_score,
      percentageChange: ((previous.structural_score - current.structural_score) / previous.structural_score) * 100,
    },
    {
      category: 'Lifestyle',
      change: previous.lifestyle_score - current.lifestyle_score,
      percentageChange: ((previous.lifestyle_score - current.lifestyle_score) / previous.lifestyle_score) * 100,
    },
  ];

  return {
    current,
    previous,
    improvements: improvements.filter((i) => Math.abs(i.change) > 0),
    overallChange: previous.overall_score - current.overall_score,
  };
}
