"use client";

import { Suspense } from "react";
import { QuestionFilters } from "@/components/question-bank/QuestionFilters";
import { QuestionList } from "@/components/question-bank/QuestionList";
import { CreateCategoryDialog } from "@/components/question-bank/CreateCategoryDialog";
import { CreateTopicDialog } from "@/components/question-bank/CreateTopicDialog";
import { CreateSubtopicDialog } from "@/components/question-bank/CreateSubtopicDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

function QuestionBankContent() {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [subtopicDialogOpen, setSubtopicDialogOpen] = useState(false);
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Question Bank</h1>
          <p className="text-gray-600">
            Manage and organize your interview questions
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link href="/question-bank/generate">
              <Button className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Questions
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <QuestionFilters />
        </div>
        
        <div className="lg:col-span-3">
          <QuestionList />
        </div>
      </div>

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

export default function QuestionBankPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <QuestionBankContent />
    </Suspense>
  );
}
