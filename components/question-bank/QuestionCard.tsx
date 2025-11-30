"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { Question, DifficultyLevel } from "@/types/question";
import { cn } from "@/lib/utils";
import { QuestionDetailDialog } from "./QuestionDetailDialog";

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

interface QuestionCardProps {
  question: Question;
  onRefetch?: () => void;
}

export function QuestionCard({ question, onRefetch }: QuestionCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open && onRefetch) {
      // Refetch when modal closes
      onRefetch();
    }
  };

  return (
    <>
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">
                {question.name || question.question.substring(0, 100)}
              </CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">{question.question}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "px-2 py-1 rounded-md text-xs font-medium",
                  getDifficultyColor(question.difficulty_level)
                )}
              >
                {getDifficultyLabel(question.difficulty_level)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
            </div>
          </div>
        </CardHeader>
        {question.description && (
          <CardContent>
            <p className="text-sm text-gray-500">{question.description}</p>
          </CardContent>
        )}
      </Card>
      <QuestionDetailDialog
        question={question}
        open={isDialogOpen}
        onOpenChange={handleOpenChange}
        onRefetch={onRefetch}
      />
    </>
  );
}

