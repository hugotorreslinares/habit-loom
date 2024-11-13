import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const CalendarView = () => {
  const { categoryId } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: category } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: entries } = useQuery({
    queryKey: ["entries", categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_entries")
        .select("*")
        .eq("category_id", categoryId);
      
      if (error) throw error;
      return data;
    },
  });

  const toggleEntry = useMutation({
    mutationFn: async ({ date, completed }: { date: Date; completed: boolean }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("habit_entries")
        .select("*")
        .eq("category_id", categoryId)
        .eq("date", format(date, "yyyy-MM-dd"))
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from("habit_entries")
          .update({ completed: !existing.completed })
          .eq("id", existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("habit_entries")
          .insert({
            category_id: categoryId,
            date: format(date, "yyyy-MM-dd"),
            completed: true,
            user_id: user.user.id
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", categoryId] });
      toast({
        title: "Updated",
        description: "Habit status updated successfully.",
      });
    },
  });

  const completedDates = entries?.filter(entry => entry.completed).map(entry => new Date(entry.date)) || [];

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{category?.icon}</span>
            <span>{category?.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="multiple"
            selected={completedDates}
            onSelect={(date) => {
              if (date) {
                toggleEntry.mutate({ date, completed: true });
              }
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;