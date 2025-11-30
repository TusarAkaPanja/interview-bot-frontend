"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCategories, useTopicsByCategory, useSubtopicsByTopic } from "@/lib/hooks/useQuestionBank";
import { X } from "lucide-react";
import type { DifficultyLevel } from "@/types/question";

export function QuestionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const categoryUuid = searchParams.get("category_uuid") || "";
  const topicUuid = searchParams.get("topic_uuid") || "";
  const subtopicUuid = searchParams.get("subtopic_uuid") || "";
  const difficulty = searchParams.get("difficulty_level") || "";
  const search = searchParams.get("search") || "";

  const { data: categories = [] } = useCategories();
  const { data: topics = [] } = useTopicsByCategory(categoryUuid || undefined);
  const { data: subtopics = [] } = useSubtopicsByTopic(topicUuid || undefined);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset dependent filters
    if (key === "category_uuid") {
      params.delete("topic_uuid");
      params.delete("subtopic_uuid");
    }
    if (key === "topic_uuid") {
      params.delete("subtopic_uuid");
    }
    params.set("page", "1"); // Reset to first page
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/question-bank");
  };

  const hasActiveFilters = categoryUuid || topicUuid || subtopicUuid || difficulty || search;

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="search" className="text-sm font-medium text-gray-700">
            Search
          </label>
          <Input
            id="search"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-gray-700">
            Category
          </label>
          <Select
            id="category"
            value={categoryUuid}
            onChange={(e) => updateFilter("category_uuid", e.target.value)}
            className="bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.uuid} value={category.uuid}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="topic" className="text-sm font-medium text-gray-700">
            Topic
          </label>
          <Select
            id="topic"
            value={topicUuid}
            onChange={(e) => updateFilter("topic_uuid", e.target.value)}
            disabled={!categoryUuid}
            className="bg-white"
          >
            <option value="">All Topics</option>
            {topics.map((topic) => (
              <option key={topic.uuid} value={topic.uuid}>
                {topic.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="subtopic" className="text-sm font-medium text-gray-700">
            Subtopic
          </label>
          <Select
            id="subtopic"
            value={subtopicUuid}
            onChange={(e) => updateFilter("subtopic_uuid", e.target.value)}
            disabled={!topicUuid}
            className="bg-white"
          >
            <option value="">All Subtopics</option>
            {subtopics.map((subtopic) => (
              <option key={subtopic.uuid} value={subtopic.uuid}>
                {subtopic.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="difficulty" className="text-sm font-medium text-gray-700">
            Difficulty
          </label>
          <Select
            id="difficulty"
            value={difficulty}
            onChange={(e) => updateFilter("difficulty_level", e.target.value)}
            className="bg-white"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

