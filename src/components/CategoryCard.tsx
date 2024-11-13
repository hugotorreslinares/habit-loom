import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

const CategoryCard = ({ category, onClick }: CategoryCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
      style={{ borderColor: category.color }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{category.icon}</span>
          <span>{category.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500">Click to view calendar</div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;