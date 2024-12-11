import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import CategoryCard from "@/components/CategoryCard";
//import RandomQuote from "@/components/RandomQuote";
import { useNavigate } from "react-router-dom";
import CategoryDialog from "@/components/CategoryDialog"; // Import the new component




const iconOptions = [
  "🌟", "🎯", "💡", "📅", "📝", // Existing icons
  "🔥", "✅", "🚀", "🎉", "📊", // First set of new icons
  "🔔", "🌈", "🛠️", "📌", "💼", // Second set of new icons
  "🌍", "🎵", "🍀", "🏆", "💖", // Additional icons
  "🧩", "🎨", "🧘‍♂️", "📖", "🌌" // More icons
];

const Categories = () => {
  const [newCategory, setNewCategory] = useState({ name: "", icon: "🌟", color: "#4F46E5" });
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

/*   const createCategory = useMutation({
    mutationFn: async (category: typeof newCategory) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("categories")
        .insert({
          ...category,
          user_id: user.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsOpen(false);
      setNewCategory({ name: "", icon: "🎯", color: "#4F46E5" });
      toast({
        title: "Category created",
        description: "Your new habit category has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
    },
  }); */

/*   const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate(newCategory);
  }; */

  if (isLoading) {
    return <div className="container min-h-screen flex flex-col items-center justify-center bg-gray-100">Loading...</div>;
  }

  return (
    <div className="container mx-auto flex flex-col min-h-screen p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-1xl font-bold">Categories</h2>
        <CategoryDialog isOpen={isOpen} setIsOpen={setIsOpen} type="category"/>
      </div>
      <div className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => navigate(`/calendar/${category.id}`)}
            />
          ))}
        
        </div>  
        {categories.length == 0 && (
        <div className="w-full md:p-60 pt-20"> 
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                This is the beginning of your new journey
              </CardTitle>
              </CardHeader>
              
              <CardContent>
                Start by creating a new category, and then add the habits you want to track or each category.
                <br></br>
                click on the calendar Icon to have an insight on how well you have performed.
              </CardContent>
          </Card>
        </div>
        )}
      </div>
      {/* <div className="relative w-full">
        <div className="absolute right-0 bottom-0"><RandomQuote /></div>
      </div> */}
    </div>
  );
};

export default Categories;