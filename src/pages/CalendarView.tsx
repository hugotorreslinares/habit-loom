import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

const CalendarView = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
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

      const formattedDate = format(date, "yyyy-MM-dd");

      const { data: existingEntries, error: fetchError } = await supabase
        .from("habit_entries")
        .select("*")
        .eq("category_id", categoryId)
        .eq("date", formattedDate);

      if (fetchError) throw fetchError;

      if (existingEntries && existingEntries.length > 0) {
        const existing = existingEntries[0];
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
            date: formattedDate,
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
      <Button 
        variant="outline" 
        className="mb-4"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
      
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
            onSelect={(dates) => {
              if (dates && dates.length > 0) {
                const lastSelectedDate = dates[dates.length - 1];
                if (lastSelectedDate) {
                  toggleEntry.mutate({ date: lastSelectedDate, completed: true });
                }
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