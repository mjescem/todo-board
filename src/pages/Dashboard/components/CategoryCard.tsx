import { Plus, Trash2 } from "lucide-react";
import TaskCard from "./TaskCard";
import {
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  type Category,
} from "@/features/categories/categoriesApi";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";

type Props = {
  category: Category;
};

const tasks = [
  {
    id: "t1",
    categoryId: "c1",
    title: "This is a test",
    color: null,
    description: "This is a test",
    isDone: false,
  },
  {
    id: "t2",
    categoryId: "c2",
    title: "create sign up page]",
    color: "bg-[#4bce97]",
    description: "This is a test",
    isDone: true,
  },
  {
    id: "t3",
    categoryId: "c3",
    title: "adadadasda",
    color: "bg-[#f87462]",
    description: "",
    isDone: false,
  },
];

const CategoryCard: React.FC<Props> = ({ category }) => {
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(category.title);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleUpdateTitle = async () => {
    if (!titleValue.trim() || titleValue === category.title) {
      setIsEditing(false);
      return;
    }

    try {
      await updateCategory({
        id: category.id,
        title: titleValue.trim(),
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update category:", error);
      setTitleValue(category.title);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(category.id).unwrap();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  return (
    <section className="flex flex-col min-w-68 rounded-xl bg-black pb-2">
      <div className="flex items-center px-3 py-3 group cursor-pointer">
        <div className="flex-1">
          {isEditing ? (
            <Input
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
              className="h-7 px-1 text-sm font-bold text-white bg-white/10 border-none"
            />
          ) : (
            <h3
              onClick={() => setIsEditing(true)}
              className="text-sm font-bold text-white"
            >
              {category.title}
            </h3>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsConfirmDialogOpen(true)}
          className="h-6 w-6 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      <div className="flex-1 px-2 space-y-2.5">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      <div className="px-2 pt-2">
        <div className="flex gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-white hover:bg-white/20">
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add a card</span>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={()=> setIsConfirmDialogOpen(false)}
        title="Delete this list?"
        description={`Are you sure you want to delete "${category.title}"? This will permanently remove all tickets within this list.`}
        confirmText="Delete"
        intent="danger"
        confirmAction={handleDelete}
      />
    </section>
  );
};

export default CategoryCard;
