"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCreateTopic, useCategories } from "@/lib/hooks/useQuestionBank";
import { Loader2 } from "lucide-react";

const topicSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  description: z.string().min(1, "Description is required"),
  category_uuid: z.string().min(1, "Category is required"),
});

type TopicFormData = z.infer<typeof topicSchema>;

interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTopicDialog({ open, onOpenChange }: CreateTopicDialogProps) {
  const createTopic = useCreateTopic();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
  });

  const onSubmit = async (data: TopicFormData) => {
    try {
      await createTopic.mutateAsync(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Topic</DialogTitle>
          <DialogDescription>
            Create a new topic under a category.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {createTopic.isError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {createTopic.error instanceof Error
                ? createTopic.error.message
                : "Failed to create topic"}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="category_uuid" className="text-sm font-medium text-gray-700">
              Category
            </label>
            <Select
              id="category_uuid"
              {...register("category_uuid")}
              disabled={categoriesLoading}
              className="bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.uuid} value={category.uuid}>
                  {category.name}
                </option>
              ))}
            </Select>
            {errors.category_uuid && (
              <p className="text-sm text-red-600">{errors.category_uuid.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Python"
              className="bg-white"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Python programming language questions"
              className="bg-white"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={createTopic.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTopic.isPending || categoriesLoading}>
              {createTopic.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

