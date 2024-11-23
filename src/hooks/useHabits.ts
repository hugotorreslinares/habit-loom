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


      const todayUTC = new Date();
      const day = todayUTC.getUTCDate();
      const month = todayUTC.getUTCMonth() + 1; // Los meses son 0-indexados
      const year = todayUTC.getUTCFullYear();
      const newDate = `${year}-${month}-${day}`;
      console.log(`${year}-${month}-${day}`);

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
      console.log("categoryHabits", habits)
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
    console.log("date",date)
    const { data: checked, error } = await supabase
      .from('habit_entries')
      .select('*')
      .eq('category_id', categoryId)
      .eq('date', date)

    if (error) throw error;
    console.log("checked", checked);
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
      const { error } = await supabase
        .from('categories') // Assuming your categories are stored in a 'categories' table
        .delete()
        .eq('id', categoryId); // Use the category ID to identify which category to delete

      if (error) throw error; // Throw an error if the deletion fails
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] }); // Invalidate queries related to habits to refresh the data
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