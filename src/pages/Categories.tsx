import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import CategoryCard from "@/components/CategoryCard";
import RandomQuote from "@/components/RandomQuote";
import { useNavigate } from "react-router-dom";

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

  const createCategory = useMutation({
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate(newCategory);
  };

  if (isLoading) {
    return <div className="container min-h-screen flex flex-col items-center justify-center bg-gray-100">Loading...</div>;
  }

  return (
    <div className="container mx-auto flex flex-col min-h-screen p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div className="flex items-center">
                <Input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="mr-4"
                />
                <select
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="border rounded p-2"
                >
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon} {icon}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full">
                Create Category
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
      </div>
      <div className="w-full"><RandomQuote /></div>
    </div>
  );
};

export default Categories;