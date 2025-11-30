"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCreateInterviewPanel, useCandidates } from "@/lib/hooks/usePanel";
import { useCategories, useTopicsByCategory, useSubtopicsByTopic } from "@/lib/hooks/useQuestionBank";
import { Loader2, Plus, Trash2, CheckSquare, Square } from "lucide-react";
import { UseFormRegister, UseFormWatch, FieldErrors } from "react-hook-form";

const questionDistributionSchema = z.object({
  topic_uuid: z.string().min(1, "Topic is required"),
  subtopic_uuid: z.string().min(1, "Subtopic is required"),
  easy: z.number().min(0, "Must be 0 or greater"),
  medium: z.number().min(0, "Must be 0 or greater"),
  hard: z.number().min(0, "Must be 0 or greater"),
}).refine((data) => {
  const total = data.easy + data.medium + data.hard;
  return total > 0;
}, {
  message: "At least one difficulty level must have questions",
  path: ["easy"],
});

const createPanelSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be 255 characters or less"),
  description: z.string().optional(),
  total_number_of_questions: z.number().min(1, "Must be at least 1"),
  start_datetime: z.string().min(1, "Start datetime is required"),
  end_datetime: z.string().min(1, "End datetime is required"),
  category_uuid: z.string().min(1, "Category is required"),
  question_distributions: z.array(questionDistributionSchema).min(1, "At least one question distribution is required"),
  candidate_uuids: z.array(z.string()).optional(),
}).refine((data) => {
  const total = data.question_distributions.reduce((sum, dist) => sum + dist.easy + dist.medium + dist.hard, 0);
  return total === data.total_number_of_questions;
}, {
  message: "Sum of question distributions must equal total number of questions",
  path: ["question_distributions"],
}).refine((data) => {
  const start = new Date(data.start_datetime);
  const end = new Date(data.end_datetime);
  return end > start;
}, {
  message: "End datetime must be after start datetime",
  path: ["end_datetime"],
});

type CreatePanelFormData = z.infer<typeof createPanelSchema>;

interface CreatePanelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface DistributionRowProps {
  index: number;
  register: UseFormRegister<CreatePanelFormData>;
  watch: UseFormWatch<CreatePanelFormData>;
  errors: FieldErrors<CreatePanelFormData>;
  topics: any[];
  onRemove: () => void;
  canRemove: boolean;
}

function DistributionRow({ index, register, watch, errors, topics, onRemove, canRemove }: DistributionRowProps) {
  const topicUuid = watch(`question_distributions.${index}.topic_uuid`);
  const { data: subtopics = [] } = useSubtopicsByTopic(topicUuid);
  const distribution = watch(`question_distributions.${index}`);

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Distribution {index + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-gray-600">Topic *</label>
          <Select
            {...register(`question_distributions.${index}.topic_uuid`)}
            className="bg-white"
          >
            <option value="">Select a topic</option>
            {topics.map((topic) => (
              <option key={topic.uuid} value={topic.uuid}>
                {topic.name}
              </option>
            ))}
          </Select>
          {errors.question_distributions?.[index]?.topic_uuid && (
            <p className="text-xs text-red-600">
              {errors.question_distributions[index]?.topic_uuid?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-600">Subtopic *</label>
          <Select
            {...register(`question_distributions.${index}.subtopic_uuid`)}
            disabled={!topicUuid}
            className="bg-white"
          >
            <option value="">Select a subtopic</option>
            {subtopics.map((subtopic) => (
              <option key={subtopic.uuid} value={subtopic.uuid}>
                {subtopic.name}
              </option>
            ))}
          </Select>
          {errors.question_distributions?.[index]?.subtopic_uuid && (
            <p className="text-xs text-red-600">
              {errors.question_distributions[index]?.subtopic_uuid?.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-gray-600">Easy</label>
          <Input
            type="number"
            {...register(`question_distributions.${index}.easy`, { valueAsNumber: true })}
            min={0}
            className="bg-white"
          />
          {errors.question_distributions?.[index]?.easy && (
            <p className="text-xs text-red-600">
              {errors.question_distributions[index]?.easy?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-600">Medium</label>
          <Input
            type="number"
            {...register(`question_distributions.${index}.medium`, { valueAsNumber: true })}
            min={0}
            className="bg-white"
          />
          {errors.question_distributions?.[index]?.medium && (
            <p className="text-xs text-red-600">
              {errors.question_distributions[index]?.medium?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-600">Hard</label>
          <Input
            type="number"
            {...register(`question_distributions.${index}.hard`, { valueAsNumber: true })}
            min={0}
            className="bg-white"
          />
          {errors.question_distributions?.[index]?.hard && (
            <p className="text-xs text-red-600">
              {errors.question_distributions[index]?.hard?.message}
            </p>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Subtotal: {(distribution?.easy || 0) + (distribution?.medium || 0) + (distribution?.hard || 0)} questions
      </div>
    </div>
  );
}

export function CreatePanelDialog({ open, onOpenChange, onSuccess }: CreatePanelDialogProps) {
  const createPanel = useCreateInterviewPanel();
  const { data: categories = [] } = useCategories();
  const { data: candidates = [], isLoading: candidatesLoading, isError: candidatesError, error: candidatesErrorData } = useCandidates();
  const [selectedCategoryUuid, setSelectedCategoryUuid] = useState<string>("");
  const [manualCandidateUuid, setManualCandidateUuid] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
    setValue,
  } = useForm<CreatePanelFormData>({
    resolver: zodResolver(createPanelSchema),
    defaultValues: {
      question_distributions: [{ topic_uuid: "", subtopic_uuid: "", easy: 0, medium: 0, hard: 0 }],
      candidate_uuids: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "question_distributions",
  });

  const categoryUuid = watch("category_uuid");
  const questionDistributions = watch("question_distributions");
  const totalQuestions = watch("total_number_of_questions");
  const selectedCandidateUuids = watch("candidate_uuids") || [];

  // Update selected category when form value changes
  const watchedCategory = watch("category_uuid");
  if (watchedCategory !== selectedCategoryUuid) {
    setSelectedCategoryUuid(watchedCategory);
  }

  const { data: topics = [] } = useTopicsByCategory(selectedCategoryUuid);

  const onSubmit = async (data: CreatePanelFormData) => {
    try {
      await createPanel.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        total_number_of_questions: data.total_number_of_questions,
        start_datetime: data.start_datetime,
        end_datetime: data.end_datetime,
        category_uuid: data.category_uuid,
        question_distributions: data.question_distributions,
        candidate_uuids: data.candidate_uuids || [],
      });
      reset();
      setSelectedCategoryUuid("");
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Calculate total from distributions
  const calculatedTotal = questionDistributions.reduce(
    (sum, dist) => sum + (dist.easy || 0) + (dist.medium || 0) + (dist.hard || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Interview Panel</DialogTitle>
          <DialogDescription>
            Create a new interview panel with question distributions and candidate assignments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {createPanel.isError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {createPanel.error instanceof Error
                ? createPanel.error.message
                : "Failed to create interview panel"}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Panel Name *
              </label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Python Developer Interview - 2024"
                className="bg-white"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="category_uuid" className="text-sm font-medium text-gray-700">
                Category *
              </label>
              <Select
                id="category_uuid"
                {...register("category_uuid")}
                onChange={(e) => {
                  setSelectedCategoryUuid(e.target.value);
                  register("category_uuid").onChange(e);
                }}
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
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Technical interview for Python developer position"
              className="bg-white"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="total_number_of_questions" className="text-sm font-medium text-gray-700">
                Total Questions *
              </label>
              <Input
                id="total_number_of_questions"
                type="number"
                {...register("total_number_of_questions", { valueAsNumber: true })}
                min={1}
                className="bg-white"
              />
              {errors.total_number_of_questions && (
                <p className="text-sm text-red-600">{errors.total_number_of_questions.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="start_datetime" className="text-sm font-medium text-gray-700">
                Start Date & Time *
              </label>
              <Input
                id="start_datetime"
                type="datetime-local"
                {...register("start_datetime")}
                className="bg-white"
              />
              {errors.start_datetime && (
                <p className="text-sm text-red-600">{errors.start_datetime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="end_datetime" className="text-sm font-medium text-gray-700">
                End Date & Time *
              </label>
              <Input
                id="end_datetime"
                type="datetime-local"
                {...register("end_datetime")}
                className="bg-white"
              />
              {errors.end_datetime && (
                <p className="text-sm text-red-600">{errors.end_datetime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Question Distributions *</label>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {calculatedTotal} / {totalQuestions || 0}
                  {calculatedTotal !== (totalQuestions || 0) && (
                    <span className="text-red-600 ml-2">
                      (Must equal {totalQuestions || 0})
                    </span>
                  )}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ topic_uuid: "", subtopic_uuid: "", easy: 0, medium: 0, hard: 0 })}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Distribution
              </Button>
            </div>

            {errors.question_distributions && (
              <p className="text-sm text-red-600">{errors.question_distributions.message}</p>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <DistributionRow
                  key={field.id}
                  index={index}
                  register={register}
                  watch={watch}
                  errors={errors}
                  topics={topics}
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Candidates (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                {selectedCandidateUuids.length} candidate{selectedCandidateUuids.length !== 1 ? "s" : ""} selected
              </p>
              
              {candidatesError && (
                <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm mb-3">
                  <p className="font-medium mb-1">Unable to load candidates from API</p>
                  <p className="text-xs">
                    {candidatesErrorData instanceof Error ? candidatesErrorData.message : "Please add candidate UUIDs manually"}
                  </p>
                </div>
              )}

              {candidatesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-blue" />
                </div>
              ) : candidates.length === 0 ? (
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-gray-50 text-sm text-gray-600">
                    {candidatesError 
                      ? "Unable to load candidates. Please add candidate UUIDs manually below."
                      : "No candidates available. Please add candidate UUIDs manually below."}
                  </div>
                  
                  {/* Manual candidate UUID input */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">
                      Add Candidate UUID Manually
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter candidate UUID (e.g., 123e4567-e89b-12d3-a456-426614174005)"
                        value={manualCandidateUuid}
                        onChange={(e) => setManualCandidateUuid(e.target.value)}
                        className="bg-white text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (manualCandidateUuid.trim() && !selectedCandidateUuids.includes(manualCandidateUuid.trim())) {
                            setValue("candidate_uuids", [...selectedCandidateUuids, manualCandidateUuid.trim()]);
                            setManualCandidateUuid("");
                          }
                        }}
                        disabled={!manualCandidateUuid.trim() || selectedCandidateUuids.includes(manualCandidateUuid.trim())}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter candidate UUIDs one at a time and click the + button to add them
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2 bg-gray-50">
                    {candidates.map((candidate) => {
                      const isSelected = selectedCandidateUuids.includes(candidate.uuid);
                      return (
                        <label
                          key={candidate.uuid}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const current = selectedCandidateUuids;
                              if (e.target.checked) {
                                setValue("candidate_uuids", [...current, candidate.uuid]);
                              } else {
                                setValue(
                                  "candidate_uuids",
                                  current.filter((id) => id !== candidate.uuid)
                                );
                              }
                            }}
                            className="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate.name || `${candidate.first_name} ${candidate.last_name}`.trim()}
                            </div>
                            <div className="text-xs text-gray-500">{candidate.email}</div>
                          </div>
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary-blue" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Show selected candidate Names */}
              {selectedCandidateUuids.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <label className="text-xs font-medium text-gray-700 mb-2 block">
                    Selected Candidate Names:
                  </label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedCandidateUuids.map((uuid) => {
                      const candidate = candidates.find((c) => c.uuid === uuid);
                      const candidateName = candidate 
                        ? (candidate.name || `${candidate.first_name} ${candidate.last_name}`.trim() || candidate.email)
                        : uuid;
                      return (
                        <div key={uuid} className="flex items-center justify-between p-2 bg-blue-50 rounded text-xs">
                          <span className="text-gray-700">{candidateName}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setValue(
                                "candidate_uuids",
                                selectedCandidateUuids.filter((id) => id !== uuid)
                              );
                            }}
                            className="h-6 px-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                setSelectedCategoryUuid("");
                setValue("candidate_uuids", []);
                onOpenChange(false);
              }}
              disabled={createPanel.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPanel.isPending}>
              {createPanel.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Panel"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

