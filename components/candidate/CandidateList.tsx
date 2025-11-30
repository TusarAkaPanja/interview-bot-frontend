"use client";

import { useCandidates } from "@/lib/hooks/useCandidate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Mail, Calendar } from "lucide-react";

export function CandidateList() {
  const { data: candidates = [], isLoading, isError, error } = useCandidates();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700">
            {error instanceof Error ? error.message : "Failed to load candidates"}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No candidates found</p>
            <p className="text-sm text-gray-500 mt-2">
              Register candidates to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {candidates.map((candidate) => (
        <Card key={candidate.uuid} className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {candidate.name || `${candidate.first_name} ${candidate.last_name}`.trim()}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Mail className="h-4 w-4" />
              {candidate.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {candidate.organization && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Organization:</span>
                  <span>{candidate.organization}</span>
                </div>
              )}
              {candidate.created_at && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined: {new Date(candidate.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

