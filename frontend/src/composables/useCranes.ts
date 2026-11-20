import { computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRoute } from 'vue-router';
import { craneService } from '../services/craneService';
import { CraneDetailsResponse, InspectionLog } from '../types/crane.types';

export function useCranes() {
  const route = useRoute();
  const queryParams = computed(() => ({ ...route.query }));

  return useQuery({
    queryKey: ['cranes', queryParams],
    queryFn: () => craneService.getAll(queryParams.value),
    staleTime: 5 * 60 * 1000
  });
}

export function useCraneDetails(id: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['crane', id],
    queryFn: () => craneService.getById(id),
    retry: false
  });

  const addInspection = useMutation({
    mutationFn: (newLog: Omit<InspectionLog, 'id' | 'craneId'>) => craneService.addInspection(id, newLog),
    onMutate: async (newLog) => {
      await queryClient.cancelQueries({ queryKey: ['crane', id] });
      const previous = queryClient.getQueryData<CraneDetailsResponse>(['crane', id]);

      if (previous) {
        queryClient.setQueryData<CraneDetailsResponse>(['crane', id], {
          ...previous,
          inspections: [...previous.inspections, { ...newLog, id: 'temp-id', craneId: id }]
        });
      }
      return { previous };
    },
    onError: (_err, _newLog, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['crane', id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['crane', id] });
      queryClient.invalidateQueries({ queryKey: ['cranes'] });
    }
  });

  return { ...query, addInspection };
}
