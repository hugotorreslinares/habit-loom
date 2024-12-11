import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from "@tanstack/react-query";

const iconOptions = [
  "🌟", "🎯", "💡", "📅", "📝", 
  "🔥", "✅", "🚀", "🎉", "📊", 
  "🔔", "🌈", "🛠️", "📌", "💼", 
  "🌍", "🎵", "🍀", "🏆", "💖", 
  "🧩", "🎨", "🧘‍♂️", "📖", "🌌"
];

const CategoryDialog = ({ isOpen, setIsOpen, type }) => {
  const [newCategory, setNewCategory] = useState({ name: "", icon: "🌟", color: "#4F46E5" });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createCategory = useMutation({
    mutationFn: async (category) => {
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
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createCategory.mutate(newCategory);
  };

  return (
    <div className="m-3">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-600">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden md:block">{type === 'category' ? 'New Category' : 'New Habit'}</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{type === 'category' ? 'New Category' : 'New Habit'}</DialogTitle>
          </DialogHeader>
          {type === 'category' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 pb-3">Category Name</label>
                <Input
                  id="category-name"
                  placeholder="i.e: Work"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="category-color" className="block text-sm font-medium text-gray-700 mr-4">Color</label>
                <Input
                  id="category-color"
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="mr-4"
                />
                <label htmlFor="category-icon" className="block text-sm font-medium text-gray-700">Icon</label>
                <select
                  id="category-icon"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="border rounded p-2"
                >
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon} 
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full">
                <span>Create Category</span>
              </Button>
            </form>
          ) : (
            <form onSubmit={handleHabitSubmit} className="space-y-4">
              <div>
                <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 pb-3">Habit Name</label>
                <Input
                  id="habit-name"
                  placeholder="i.e: Exercise"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                <span>Create Habit</span>
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryDialog;