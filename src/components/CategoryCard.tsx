import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { PlusIcon, TrashIcon, Calendar, ChevronUp, ChevronDown, CheckCircle, EllipsisVertical } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
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
  const handleAddHabit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const name = prompt('Enter habit name:');
    if (name) {
      await addHabit.mutateAsync(name);
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow"
      style={{ borderBottom: 1, borderTopColor: category.color }}
    >
      <CardHeader className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-2 hover:bg-gray-200 rounded-full flex items-center gap-2"
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
            <Link 
              to={`/calendar/${category.id}`}
              className="calendar-icon hover:text-primary transition-colors"
              title="View habit calendar"
              onClick={(e) => e.stopPropagation()}
            >
              <Calendar size={20} />
            </Link>
            <DropdownMenu>
      <DropdownMenuTrigger>
        <button className="p-2 bg-gray-100 text-green rounded"><EllipsisVertical className="h-5 w-5" /></button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
       {/*  <DropdownMenuItem onClick={() => console.log("Edit action")}>Edit</DropdownMenuItem> */}
       <DropdownMenuItem  onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this Category?')) {
                        deleteCategory.mutate(category.id);
                      }
                    }}>
                    Delete
       </DropdownMenuItem> 
        <DropdownMenuSeparator />
       {/*  <DropdownMenuItem onClick={() => console.log("View action")}>View</DropdownMenuItem> */}
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
                  <div className="flex place-items-stretch gap-2">
                     <button
                    className={`text-green-500 hover:text-green-700 transition-opacity ${habit.isCompleted ? 'line-through' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHabit.mutate({ 
                        habitId: habit.id, 
                        completed: !habit.isCompleted 
                      });
                    }}
                    title="Mark as done for today"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                    <span className="${habit.isCompleted ? 'line-through' : ''}">{habit.name} {habit.isCompleted}</span>
                  </div>
                  <div className="flex">
                    
                  <button
                    className="text-red-500 hover:text-red-700 opacity-100 group-hover:opacity-100 transition-opacity"
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
                  </div>
                 
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default CategoryCard;