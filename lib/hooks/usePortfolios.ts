import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePortfolioStore } from '@/stores';

export function usePortfolios() {
  const queryClient = useQueryClient();
  const { setPortfolios, setLoading, setError } = usePortfolioStore();

  const portfoliosQuery = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      const response = await fetch('/api/portfolios');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolios');
      }
      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      setPortfolios(data);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create portfolio');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });

  return {
    portfolios: portfoliosQuery.data || [],
    isLoading: portfoliosQuery.isLoading,
    error: portfoliosQuery.error?.message,
    createPortfolio: createMutation.mutate,
    isCreating: createMutation.isLoading,
    createError: createMutation.error?.message,
  };
}