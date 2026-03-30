import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";

type Props = {
category: any
}

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

const CategoryCard: React.FC<Props>  = ({category}) => {

  return (
    <section
      key={category.id}
      className="flex flex-col min-w-68 rounded-xl bg-black pb-2"
    >
        <div className="flex items-center px-3 py-3">
            <h3 className="text-sm font-semibold text-white">{category.title}</h3>
        </div>
        <div className="px-2 space-y-2">
            {tasks
            .filter((t) => t.categoryId === category.id)
            .map((task) => (
                <TaskCard task={task} />
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
    </section>
  );
}

export default CategoryCard 