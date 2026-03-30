import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog,  DialogContent,  DialogHeader,  DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(1, "Board title is required"),
});

export type BoardForm= z.infer<typeof formSchema>;

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onCreate: (data: BoardForm) => void;
};

const CreateBoardDialog: React.FC<Props> = ({ isOpen, isLoading, onClose, onCreate }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BoardForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const onSubmit = (data: BoardForm) => {
    onCreate(data);
    onClose();
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-100 p-0 gap-0">
        <DialogHeader className="px-6 py-4 bg-muted/20">
          <DialogTitle className="text-center text-base font-semibold text-black">
            Create board
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-bold">
                Board title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter board title"
                {...register("title")}
                className={cn(
                  "h-10 focus-visible:ring-primary",
                  errors.title && "border-red-500 focus-visible:ring-red-500",
                )}
              />
              {errors.title && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-10 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardDialog;
