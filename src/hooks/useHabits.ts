import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useHabits(categoryId: string) {
  const queryClient = useQueryClient();

  const { data: habits } = useQuery({
    queryKey: ['habits', categoryId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split('T')[0];

      console.log('Querying habits with categoryId:', categoryId);
      console.log('Today:', today);

      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select(`
          *,
          habit_entries(completed)
        `)
        .eq('category_id', categoryId)
        .eq('user_id', user.user.id)
        .eq('habit_entries.date', today);

      if (habitsError) {
        console.error('Error fetching habits:', habitsError);
        throw habitsError;
      }

      console.log('Habits returned:', habits);
      return habits;
    },
  });

  const addHabit = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          name: name,
          category_id: categoryId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select('*');

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', categoryId] });
    },
  });

  const toggleHabit = useMutation({
    mutationFn: async ({ 
      habitId, 
      completed,
      date = new Date().toISOString().split('T')[0]
    }: { 
      habitId: string; 
      completed: boolean;
      date?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      if (completed) {
        const { error } = await supabase
          .from('habit_entries')
          .insert([
            {
              habit_id: habitId,
              user_id: user.user.id,
              category_id: categoryId,
              date: date,
              completed: true
            }
          ]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('habit_entries')
          .delete()
          .eq('habit_id', habitId)
          .eq('user_id', user.user.id)
          .eq('date', date);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', categoryId] });
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async (habitId: string) => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', categoryId] });
    },
  });

  return {
    habits,
    addHabit,
    toggleHabit,
    deleteHabit,
  };
} 