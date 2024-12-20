import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { PlusIcon, TrashIcon, Calendar, ChevronUp, ChevronDown, CheckCircle, EllipsisVertical, Check, CircleAlert} from "lucide-react";
import HabitGraph from '@/components/HabitGraph';
import { prepareGraphData } from '@/utils/dateUtils';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useHabits } from "@/hooks/useHabits";
import noHabitsImage from '../assets/runner.png';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Habit {
  id: string;
  name: string;
  isCompleted?: boolean;
  streak?: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  habits: Habit[];
}

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

const CategoryCard = ({ category, onClick }: CategoryCardProps) => {
  const { habits, addHabit, toggleHabit, deleteHabit, deleteCategory } = useHabits(category.id);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGraphVisible, setIsGraphvisible] = useState(false);

  const handleAddHabit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (newHabitName.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await addHabit.mutateAsync(newHabitName);
        setNewHabitName("");
        setIsDialogOpen(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const today = new Date().toLocaleDateString('en-CA'); // Format as YYYY-MM-DD

  const isDoneForTheDay = (habit) => {
    const lastIndex = habit?.habit_entries?.length - 1;
    return habit.habit_entries[lastIndex]?.date === today;
  };

  const graphData = prepareGraphData(
    habits || [], 
    (habit) => habit.habit_entries[habit.habit_entries.length - 1]?.date
  );

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-shadow"
        style={{ borderBottom: 1, borderTopColor: category.color }}
      >
        <CardHeader className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full"
                >
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </div>
              <Link 
                to={`/calendar/${category.id}`}
                className="calendar-icon hover:text-primary transition-colors"
                title="View habit calendar"
                onClick={(e) => e.stopPropagation()}
              >
                <Calendar size={20} />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="p-2 bg-gray-100 text-green rounded cursor-pointer">
                    <EllipsisVertical className="h-5 w-5" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this Category?')) {
                      deleteCategory.mutate(category.id);
                    }
                  }}>
                    Delete
                  </DropdownMenuItem> 
                  <DropdownMenuSeparator />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={handleAddHabit}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </CardTitle>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            {habits?.length > 0 && (
              <div className="mb-4">
                {isGraphVisible && (
                  <HabitGraph 
                  data={graphData}
                  color={category.color}
                  height="200px"
                  maxValue={habits?.length || 0}
                />
                )}
                
              </div>
            )}
            {!habits?.length ? (
              <div>
                <div className="pt-3 max-h-50 flex justify-center">
                  
                  <img 
                    src={noHabitsImage} 
                    alt="create a new habit" 
                    className="h-40 rounded-full pr-3" 
                  />
                </div>
                <div className="text-sm text-gray-500 pt-3 text-center">No habits added yet</div>
              </div>
            ) : (
              <ul className="space-y-2">
                {habits?.map((habit) => (
                  <li 
                    key={habit.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 pt-2 rounded habit-item"
                  >
                    <button
                      className="flex items-center gap-2 text-left border border-gray-200 rounded-md p-2 hover:bg-gray-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleHabit.mutate({ 
                          habitId: habit.id, 
                          completed: !isDoneForTheDay(habit) 
                        });
                      }}
                    >
                      <CheckCircle 
                        className={`h-5 w-5 ${
                          isDoneForTheDay(habit) 
                            ? 'text-green-500 hover:text-green-700' 
                            : 'text-red-500 hover:text-red-700'
                        }`}
                      />
                      <span className={`${isDoneForTheDay(habit) ? 'line-through' : ''} flex items-center`}>
                        {habit.name}
                        {isDoneForTheDay(habit) && <Check className="h-5 w-5 ml-1" />}
                      </span>
                    </button>
                    
                    <div className="flex-grow" />
                    
                    <button
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md p-2 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this habit?')) {
                          deleteHabit.mutate(habit.id);
                        }
                      }}
                      title="Delete Habit"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
          </DialogHeader>
          <Input
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Enter habit name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !newHabitName.trim()}
            >
              {isSubmitting ? 'Adding...' : 'Add Habit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoryCard;