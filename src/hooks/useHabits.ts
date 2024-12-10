import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export function useHabits(categoryId: string) {
  const queryClient = useQueryClient();

  const { data: habits } = useQuery({
    queryKey: ['habits', categoryId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select(`
          *,
          habit_entries(date,created_at)
        `)
        .eq('category_id', categoryId)
        .eq('user_id', user.user.id)

      if (habitsError) {
        throw habitsError;
      }
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

  const fetchCheckedHabits = async (date: string) => {
    const { data: checked, error } = await supabase
      .from('habit_entries')
      .select('*')
      .eq('category_id', categoryId)
      .eq('date', date)

    if (error) throw error;
    return checked;
  };

  const toggleHabit = useMutation({
    mutationFn: async ({ 
      habitId, 
      completed,
      date = new Date().toISOString()
    }: { 
      habitId: string; 
      completed: boolean;
      date?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const formattedDate = format(new Date(date), "yyyy-MM-dd");
      console.log(formattedDate,"formatted date")

      if (completed) {
        const { error } = await supabase
          .from('habit_entries')
          .insert([
            {
              habit_id: habitId,
              user_id: user.user.id,
              category_id: categoryId,
              date: formattedDate,
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
          .eq('date', formattedDate);
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
  const deleteCategory = useMutation({
    
    mutationFn: async (categoryId: string) => {
      const { error: deleteHabitsError } = await supabase
        .from('habit_entries')
        .delete()
        .eq('category_id', categoryId);
      console.log(categoryId);
      if (deleteHabitsError) {
        console.error("Error deleting category:", deleteHabitsError);
        throw deleteHabitsError;
      }else {console.log("habit entries succesfully deleted")}

      const { error: deleteCategoryError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      console.log(categoryId);
      if (deleteCategoryError) {
        console.error("Error deleting category:", deleteCategoryError);
        throw deleteCategoryError;
      }
      else {console.log("Category succesfully deleted")}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    habits,
    addHabit,
    toggleHabit,
    deleteHabit,
    deleteCategory,
    fetchCheckedHabits,
  };
} 