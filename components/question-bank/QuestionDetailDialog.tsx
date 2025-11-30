"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useUpdateQuestion } from "@/lib/hooks/useQuestionBank";
import { Loader2, Edit2 } from "lucide-react";
import type { Question, DifficultyLevel } from "@/types/question";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { questionBankKeys } from "@/lib/hooks/useQuestionBank";

const questionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  question: z.string().min(1, "Question is required"),
  difficulty_level: z.enum(["easy", "medium", "hard"]),
  expected_answer: z.string().optional(),
  expected_time_in_seconds: z.number().min(1).optional(),
  ideal_answer_summary: z.string().optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionDetailDialogProps {
  question: Question;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefetch?: () => void;
}

export function QuestionDetailDialog({ question, open, onOpenChange, onRefetch }: QuestionDetailDialogProps) {
  const updateQuestion = useUpdateQuestion();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      name: question.name || "",
      description: question.description || "",
      question: question.question || "",
      difficulty_level: question.difficulty_level,
      expected_answer: (question as any).expected_answer || "",
      expected_time_in_seconds: (question as any).expected_time_in_seconds || undefined,
      ideal_answer_summary: (question as any).ideal_answer_summary || "",
    },
  });

  // Reset form when dialog opens
  const handleDialogOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      reset({
        name: question.name || "",
        description: question.description || "",
        question: question.question || "",
        difficulty_level: question.difficulty_level,
        expected_answer: (question as any).expected_answer || "",
        expected_time_in_seconds: (question as any).expected_time_in_seconds || undefined,
        ideal_answer_summary: (question as any).ideal_answer_summary || "",
      });
      setIsEditing(false);
    } else {
      // Refetch when modal closes
      if (onRefetch) {
        onRefetch();
      } else {
        // Fallback: refetch all question queries
        queryClient.refetchQueries({ queryKey: questionBankKeys.questions() });
      }
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (data: QuestionFormData) => {
    try {
      await updateQuestion.mutateAsync({
        questionUuid: question.uuid,
        data: {
          name: data.name,
          description: data.description,
          question: data.question,
          difficulty_level: data.difficulty_level,
          expected_answer: data.expected_answer,
          expected_time_in_seconds: data.expected_time_in_seconds,
          ideal_answer_summary: data.ideal_answer_summary,
        },
      });
      setIsEditing(false);
      // Refetch after update
      if (onRefetch) {
        onRefetch();
      } else {
        queryClient.refetchQueries({ queryKey: questionBankKeys.questions() });
      }
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const questionData = question as any;

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Question Details</DialogTitle>
              <DialogDescription>
                View and edit question information
              </DialogDescription>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {updateQuestion.isError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                {updateQuestion.error instanceof Error
                  ? updateQuestion.error.message
                  : "Failed to update question"}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input {...register("name")} className="bg-white" />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Difficulty</label>
                <Select {...register("difficulty_level")} className="bg-white">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Select>
                {errors.difficulty_level && (
                  <p className="text-sm text-red-600">{errors.difficulty_level.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Input {...register("description")} className="bg-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Question</label>
              <textarea
                {...register("question")}
                rows={4}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
              {errors.question && (
                <p className="text-sm text-red-600">{errors.question.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Expected Answer</label>
              <textarea
                {...register("expected_answer")}
                rows={4}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Expected Time (seconds)</label>
                <Input
                  type="number"
                  {...register("expected_time_in_seconds", { valueAsNumber: true })}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ideal Answer Summary</label>
              <textarea
                {...register("ideal_answer_summary")}
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
                disabled={updateQuestion.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateQuestion.isPending}>
                {updateQuestion.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 text-sm text-gray-900">{question.name || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Difficulty</label>
                <p className="mt-1">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium",
                      question.difficulty_level === "easy"
                        ? "text-green-600 bg-green-50"
                        : question.difficulty_level === "medium"
                        ? "text-yellow-600 bg-yellow-50"
                        : "text-red-600 bg-red-50"
                    )}
                  >
                    {question.difficulty_level.charAt(0).toUpperCase() + question.difficulty_level.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            {question.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-sm text-gray-900">{question.description}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">Question</label>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{question.question}</p>
            </div>

            {questionData.expected_answer && (
              <div>
                <label className="text-sm font-medium text-gray-500">Expected Answer</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{questionData.expected_answer}</p>
              </div>
            )}

            {questionData.expected_time_in_seconds && (
              <div>
                <label className="text-sm font-medium text-gray-500">Expected Time</label>
                <p className="mt-1 text-sm text-gray-900">{questionData.expected_time_in_seconds} seconds</p>
              </div>
            )}

            {questionData.ideal_answer_summary && (
              <div>
                <label className="text-sm font-medium text-gray-500">Ideal Answer Summary</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{questionData.ideal_answer_summary}</p>
              </div>
            )}

            {questionData.red_flags && Array.isArray(questionData.red_flags) && questionData.red_flags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Red Flags</label>
                <ul className="mt-1 list-disc list-inside text-sm text-gray-900">
                  {questionData.red_flags.map((flag: string, index: number) => (
                    <li key={index}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {questionData.expected_keywords && Array.isArray(questionData.expected_keywords) && questionData.expected_keywords.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Expected Keywords</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {questionData.expected_keywords.map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="ghost" onClick={() => handleDialogOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

