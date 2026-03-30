import {
  Plus,
} from "lucide-react";
import CategoryCard from "./components/CategoryCard";

const categories = [
  { id: "c1", title: "To Do" },
  { id: "c2", title: "Doing" },
  { id: "c3", title: "Done" },
  { id: "c4", title: "test" },
];

export default function Dashboard() {

  return (
      <section className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-6">
          <div className="flex h-full gap-4 items-start">
              {categories.map((category) => (
                  <CategoryCard category={category} />
              ))}
              <button className="flex min-w-60 items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-3 text-white">
                  <Plus size={16} />
                  <span className="text-sm font-medium">Add another list</span>
              </button>
          </div>
      </section>
  );
}
