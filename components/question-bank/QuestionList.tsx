"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuestions } from "@/lib/hooks/useQuestionBank";
import { Loader2, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import type { QuestionFilters, DifficultyLevel } from "@/types/question";
import { cn } from "@/lib/utils";
import { QuestionCard } from "./QuestionCard";

function getDifficultyColor(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case "easy":
      return "text-green-600 bg-green-50";
    case "medium":
      return "text-yellow-600 bg-yellow-50";
    case "hard":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

function getDifficultyLabel(difficulty: DifficultyLevel): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

export function QuestionList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("page_size") || "10", 10);

  const filters: QuestionFilters = {
    category_uuid: searchParams.get("category_uuid") || undefined,
    topic_uuid: searchParams.get("topic_uuid") || undefined,
    subtopic_uuid: searchParams.get("subtopic_uuid") || undefined,
    difficulty_level: (searchParams.get("difficulty_level") as DifficultyLevel) || undefined,
    search: searchParams.get("search") || undefined,
    page,
    page_size: pageSize,
  };

  const { data, isLoading, isError, error, refetch } = useQuestions(filters);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-red-600">
              {error instanceof Error ? error.message : "Failed to load questions"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.results || data.results.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="py-12">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No questions found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your filters or create new questions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.ceil((data.count || 0) / pageSize);
  // Use next/previous from API response for accurate pagination
  const hasNext = !!data.next;
  const hasPrevious = !!data.previous;
  const results = data.results || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.count || 0)} of {data.count || 0} questions
        </p>
      </div>

      <div className="space-y-4">
        {results.map((question) => (
          <QuestionCard key={question.uuid} question={question} onRefetch={refetch} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => handlePageChange(page - 1)}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasNext}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

