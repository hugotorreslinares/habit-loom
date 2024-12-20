import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';
import { Calendar } from "@/components/ui/calendar";
import { useHabits } from "@/hooks/useHabits";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import HabitGraph from '@/components/HabitGraph';
import { prepareGraphData } from '@/utils/dateUtils';

const CalendarView = () => {
  const { categoryId } = useParams();
  const { fetchCheckedHabits } = useHabits(categoryId);
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
    .select(`
      date,
      habits(name)
    `)
    .eq("category_id", categoryId)
  
  if (error) throw error;
  return data;
    }

  });

  const toggleEntry = useMutation({
    mutationFn: async ({ date, habitName }: { date: Date; habitName: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const formattedDate = format(date, "yyyy-MM-dd");
      const currentTime = format(date, "HH:mm:ss");

      const { data: existingEntries, error: fetchError } = await supabase
        .from("habit_entries")
        .select("*")
        .eq("category_id", categoryId)
        .eq("date", formattedDate)
        .eq("habit_name", habitName);

      if (fetchError) throw fetchError;

      if (existingEntries && existingEntries.length > 0) {
        const existing = existingEntries[0];
        const { data, error } = await supabase
          .from("habit_entries")
          .update({ completed: !existing.completed, time: currentTime })
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
            user_id: user.user.id,
            time: currentTime,
            habit_name: habitName
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
const transformData = (array) => {
    const uniqueEntries = new Map();
    array.forEach(item => {
      console.log(item.date)
        const habitKey = `${item.date}-${item.habits.name}`; // Create a unique key based on date and habit name
        if (!uniqueEntries.has(habitKey)) {
            uniqueEntries.set(habitKey, {
                date: item.date, 
                habits: {
                    ...item.habits,
                    repetitions: 1 
                }
            });
        } 
    });

    return Array.from(uniqueEntries.values()); // Convert the Map back to an array
};

  const formattedDates = entries? transformData(entries) :[];
  const completedDates = entries?.map(entry => {
    const date = new Date(entry.date);
    date.setDate(date.getDate() + 1);
    return date;
  }) || [];
  console.log("completedDates",completedDates)

  const graphData = prepareGraphData(entries || [], (entry) => entry.date);

  return (
    <div className="container mx-auto p-4">
      <Button 
        variant="outline" 
        className="mb-4"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back 
      </Button>
      
      <Card className="mb-6">
        <CardHeader className=" bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
          <CardTitle className="flex items-center gap-2">
            <span>{category?.icon}</span>
            <span>{category?.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <div className="w-full mb-6">
            <HabitGraph 
              data={graphData}
              color={category?.color || "#8884d8"}
              height="200px"
              maxValue={entries?.length || 0}
            />
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Calendar Column */}
            <div className="md:w-1/2 flex justify-center">
              <Calendar
                mode="multiple"
                selected={completedDates}
                onSelect={(dates) => {
                  if (dates && dates.length > 0) {
                    const lastSelectedDate = dates[dates.length - 1];
                    if (lastSelectedDate) {
                      toggleEntry.mutate({ date: lastSelectedDate, habitName: "Your Habit Name" });
                    }
                  }
                }}
                className="rounded-md border"
              />
            </div>

            {/* Table Column */}
            <div className="md:w-1/2">
              {formattedDates && formattedDates.length > 0 ? (
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Habit Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Habit Repetitions</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formattedDates.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{entry.habits.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{entry.habits.repetitions}</td>
                        <td className="border border-gray-300 px-4 py-2">{entry.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No habits checked for this date.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;