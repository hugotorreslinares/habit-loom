import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { PlusIcon, TrashIcon, Calendar, ChevronUp, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useHabits } from "@/hooks/useHabits";

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
  const { habits, addHabit, toggleHabit, deleteHabit } = useHabits(category.id);
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
      className="cursor-pointer hover:shadow-lg transition-shadow"
      style={{ borderBottom: 1, borderTopColor: category.color }}
    >
      <CardHeader className=" bg-blue-100 hover:bg-blue-200 transition-colors duration-200">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-2 hover:bg-gray-100 rounded-full flex items-center gap-2"
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
            <div className="text-sm text-gray-500">No habits added yet</div>
          ) : (
            <ul className="space-y-2">
              {habits?.map((habit) => (
                <li 
                  key={habit.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded habit-item"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={habit.isCompleted}
                      onCheckedChange={(checked) => {
                        toggleHabit.mutate({ 
                          habitId: habit.id, 
                          completed: checked as boolean 
                        });
                      }}
                    />
                    <span>{habit.name}</span>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 opacity-100 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this habit?')) {
                        deleteHabit.mutate(habit.id);
                      }
                    }}
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
  );
};

export default CategoryCard;