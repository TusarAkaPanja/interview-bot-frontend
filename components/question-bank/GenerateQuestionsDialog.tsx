"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useGenerateQuestions, useCategories, useTopicsByCategory, useSubtopicsByTopic } from "@/lib/hooks/useQuestionBank";
import { Loader2 } from "lucide-react";

const generateSchema = z.object({
  category_uuid: z.string().min(1, "Category is required"),
  topic_uuid: z.string().min(1, "Topic is required"),
  subtopic_uuid: z.string().optional(),
  number_of_questions: z.number().min(1, "Number of questions must be at least 1").max(100, "Maximum 100 questions"),
  difficulty_easy: z.number().min(0).max(100),
  difficulty_medium: z.number().min(0).max(100),
  difficulty_hard: z.number().min(0).max(100),
}).refine((data) => {
  const total = data.difficulty_easy + data.difficulty_medium + data.difficulty_hard;
  return Math.abs(total - 100) < 0.01; // Allow small floating point differences
}, {
  message: "Difficulty partitions must sum to 100%",
  path: ["difficulty_hard"],
});

type GenerateFormData = z.infer<typeof generateSchema>;

interface GenerateQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GenerateQuestionsDialog({ open, onOpenChange, onSuccess }: GenerateQuestionsDialogProps) {
  const generateQuestions = useGenerateQuestions();
  const { data: categories = [] } = useCategories();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<GenerateFormData>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      difficulty_easy: 30,
      difficulty_medium: 50,
      difficulty_hard: 20,
    },
  });

  const selectedCategoryUuid = watch("category_uuid");
  const selectedTopicUuid = watch("topic_uuid");
  const { data: topics = [] } = useTopicsByCategory(selectedCategoryUuid);
  const { data: subtopics = [] } = useSubtopicsByTopic(selectedTopicUuid);

  const onSubmit = async (data: GenerateFormData) => {
    try {
      await generateQuestions.mutateAsync({
        category_uuid: data.category_uuid,
        topic_uuid: data.topic_uuid,
        subtopic_uuid: data.subtopic_uuid || undefined,
        number_of_questions: data.number_of_questions,
        difficulty_partitions: {
          easy: data.difficulty_easy,
          medium: data.difficulty_medium,
          hard: data.difficulty_hard,
        },
      });
      reset();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Questions</DialogTitle>
          <DialogDescription>
            Generate questions automatically using AI. Select category, topic, and difficulty distribution.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {generateQuestions.isError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {generateQuestions.error instanceof Error
                ? generateQuestions.error.message
                : "Failed to generate questions"}
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
              disabled={!selectedCategoryUuid}
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
            <label htmlFor="subtopic_uuid" className="text-sm font-medium text-gray-700">
              Subtopic (Optional)
            </label>
            <Select
              id="subtopic_uuid"
              {...register("subtopic_uuid")}
              disabled={!selectedTopicUuid}
              className="bg-white"
            >
              <option value="">No subtopic</option>
              {subtopics.map((subtopic) => (
                <option key={subtopic.uuid} value={subtopic.uuid}>
                  {subtopic.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="number_of_questions" className="text-sm font-medium text-gray-700">
              Number of Questions
            </label>
            <Input
              id="number_of_questions"
              type="number"
              {...register("number_of_questions", { valueAsNumber: true })}
              min={1}
              max={100}
              placeholder="20"
              className="bg-white"
            />
            {errors.number_of_questions && (
              <p className="text-sm text-red-600">{errors.number_of_questions.message}</p>
            )}
          </div>

          <div className="space-y-4 border-t pt-4">
            <label className="text-sm font-medium text-gray-700">Difficulty Distribution (%)</label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="difficulty_easy" className="text-xs text-gray-600">Easy</label>
                <Input
                  id="difficulty_easy"
                  type="number"
                  step="0.1"
                  {...register("difficulty_easy", { valueAsNumber: true })}
                  min={0}
                  max={100}
                  className="bg-white"
                />
                {errors.difficulty_easy && (
                  <p className="text-xs text-red-600">{errors.difficulty_easy.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="difficulty_medium" className="text-xs text-gray-600">Medium</label>
                <Input
                  id="difficulty_medium"
                  type="number"
                  step="0.1"
                  {...register("difficulty_medium", { valueAsNumber: true })}
                  min={0}
                  max={100}
                  className="bg-white"
                />
                {errors.difficulty_medium && (
                  <p className="text-xs text-red-600">{errors.difficulty_medium.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="difficulty_hard" className="text-xs text-gray-600">Hard</label>
                <Input
                  id="difficulty_hard"
                  type="number"
                  step="0.1"
                  {...register("difficulty_hard", { valueAsNumber: true })}
                  min={0}
                  max={100}
                  className="bg-white"
                />
                {errors.difficulty_hard && (
                  <p className="text-xs text-red-600">{errors.difficulty_hard.message}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">Total must equal 100%</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={generateQuestions.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={generateQuestions.isPending}>
              {generateQuestions.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

