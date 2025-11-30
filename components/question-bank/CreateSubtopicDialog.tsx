"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCreateSubtopic, useCategories, useTopicsByCategory } from "@/lib/hooks/useQuestionBank";
import { Loader2 } from "lucide-react";

const subtopicSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  description: z.string().min(1, "Description is required"),
  category_uuid: z.string().min(1, "Category is required"),
  topic_uuid: z.string().min(1, "Topic is required"),
});

type SubtopicFormData = z.infer<typeof subtopicSchema>;

interface CreateSubtopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSubtopicDialog({ open, onOpenChange }: CreateSubtopicDialogProps) {
  const createSubtopic = useCreateSubtopic();
  const { data: categories = [] } = useCategories();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<SubtopicFormData>({
    resolver: zodResolver(subtopicSchema),
  });

  const selectedCategoryUuid = watch("category_uuid");
  const { data: topics = [], isLoading: topicsLoading } = useTopicsByCategory(selectedCategoryUuid);

  const onSubmit = async (data: SubtopicFormData) => {
    try {
      await createSubtopic.mutateAsync({
        name: data.name,
        description: data.description,
        topic_uuid: data.topic_uuid,
      });
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
          <DialogTitle>Create Subtopic</DialogTitle>
          <DialogDescription>
            Create a new subtopic under a topic.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {createSubtopic.isError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {createSubtopic.error instanceof Error
                ? createSubtopic.error.message
                : "Failed to create subtopic"}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="category_uuid" className="text-sm font-medium text-gray-700">
              Category
            </label>
            <Select
              id="category_uuid"
              {...register("category_uuid")}
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
            <label htmlFor="topic_uuid" className="text-sm font-medium text-gray-700">
              Topic
            </label>
            <Select
              id="topic_uuid"
              {...register("topic_uuid")}
              disabled={!selectedCategoryUuid || topicsLoading}
              className="bg-white"
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.uuid} value={topic.uuid}>
                  {topic.name}
                </option>
              ))}
            </Select>
            {errors.topic_uuid && (
              <p className="text-sm text-red-600">{errors.topic_uuid.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Django Framework"
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
              placeholder="Django web framework questions"
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
              disabled={createSubtopic.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createSubtopic.isPending || topicsLoading}>
              {createSubtopic.isPending ? (
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

