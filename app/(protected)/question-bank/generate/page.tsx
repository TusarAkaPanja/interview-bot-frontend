"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuestionConfigurations, useQuestionConfigurationStatus } from "@/lib/hooks/useQuestionBank";
import { Loader2, ArrowLeft, Sparkles, CheckCircle2, XCircle, Clock, Play, ChevronRight } from "lucide-react";
import { GenerateQuestionsDialog } from "@/components/question-bank/GenerateQuestionsDialog";
import { CreateCategoryDialog } from "@/components/question-bank/CreateCategoryDialog";
import { CreateTopicDialog } from "@/components/question-bank/CreateTopicDialog";
import { CreateSubtopicDialog } from "@/components/question-bank/CreateSubtopicDialog";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FolderPlus, Tag, Layers } from "lucide-react";
import type { QuestionConfiguration } from "@/types/question";

function getStatusColor(status: QuestionConfiguration["status"]): string {
  switch (status) {
    case "completed":
      return "text-green-600 bg-green-50";
    case "failed":
      return "text-red-600 bg-red-50";
    case "in_progress":
      return "text-blue-600 bg-blue-50";
    case "pending":
      return "text-yellow-600 bg-yellow-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

function getStatusIcon(status: QuestionConfiguration["status"]) {
  switch (status) {
    case "completed":
      return CheckCircle2;
    case "failed":
      return XCircle;
    case "in_progress":
      return Play;
    case "pending":
      return Clock;
    default:
      return Clock;
  }
}

function ConfigurationCard({ config }: { config: QuestionConfiguration }) {
  const StatusIcon = getStatusIcon(config.status);
  const { data: statusData } = useQuestionConfigurationStatus(
    config.uuid,
    config.status === "pending" || config.status === "in_progress"
  );
  
  const currentConfig = statusData || config;
  const progress = currentConfig.number_of_questions_to_generate > 0
    ? (currentConfig.number_of_questions_completed / currentConfig.number_of_questions_to_generate) * 100
    : 0;

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{currentConfig.name}</CardTitle>
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-4 w-4", getStatusColor(currentConfig.status).split(" ")[0])} />
              <span className={cn("px-2 py-1 rounded-md text-xs font-medium", getStatusColor(currentConfig.status))}>
                {currentConfig.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">
              {currentConfig.number_of_questions_completed} / {currentConfig.number_of_questions_to_generate}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                currentConfig.status === "completed" ? "bg-green-600" :
                currentConfig.status === "failed" ? "bg-red-600" :
                "bg-blue-600"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Completed:</span>
            <span className="ml-2 font-medium text-green-600">{currentConfig.number_of_questions_completed}</span>
          </div>
          <div>
            <span className="text-gray-600">Pending:</span>
            <span className="ml-2 font-medium text-yellow-600">{currentConfig.number_of_questions_pending}</span>
          </div>
          <div>
            <span className="text-gray-600">In Progress:</span>
            <span className="ml-2 font-medium text-blue-600">{currentConfig.number_of_questions_in_progress}</span>
          </div>
          <div>
            <span className="text-gray-600">Failed:</span>
            <span className="ml-2 font-medium text-red-600">{currentConfig.number_of_questions_failed}</span>
          </div>
        </div>

        {currentConfig.time_taken_in_seconds > 0 && (
          <div className="text-sm text-gray-600">
            Time taken: {Math.floor(currentConfig.time_taken_in_seconds / 60)}m {currentConfig.time_taken_in_seconds % 60}s
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GeneratePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("page_size") || "10", 10);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [subtopicDialogOpen, setSubtopicDialogOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuestionConfigurations({ page, page_size: pageSize });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleGenerateSuccess = () => {
    refetch();
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
              {error instanceof Error ? error.message : "Failed to load configurations"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const totalPages = Math.ceil((data.total_count || 0) / pageSize);
  const hasNext = !!data.next_page;
  const hasPrevious = !!data.previous_page;
  const results = data.results || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/question-bank">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Generate Questions</h1>
            <p className="text-gray-600">
              Manage AI-generated question configurations
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCategoryDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            Category
          </Button>
          <Button
            variant="outline"
            onClick={() => setTopicDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Tag className="h-4 w-4" />
            Topic
          </Button>
          <Button
            variant="outline"
            onClick={() => setSubtopicDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Layers className="h-4 w-4" />
            Subtopic
          </Button>
          <Button
            onClick={() => setGenerateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate New
          </Button>
        </div>
      </div>

      {results.length === 0 ? (
        <Card className="bg-white shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No configurations found</p>
              <p className="text-sm text-gray-500 mt-2">
                Start by generating your first set of questions
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.total_count || 0)} of {data.total_count || 0} configurations
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {results.map((config) => (
              <ConfigurationCard key={config.uuid} config={config} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={!hasPrevious}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
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
        </>
      )}

      <GenerateQuestionsDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        onSuccess={handleGenerateSuccess}
      />
      <CreateCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
      />
      <CreateTopicDialog
        open={topicDialogOpen}
        onOpenChange={setTopicDialogOpen}
      />
      <CreateSubtopicDialog
        open={subtopicDialogOpen}
        onOpenChange={setSubtopicDialogOpen}
      />
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <GeneratePageContent />
    </Suspense>
  );
}

