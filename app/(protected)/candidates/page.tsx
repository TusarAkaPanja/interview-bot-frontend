"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CandidateList } from "@/components/candidate/CandidateList";
import { RegisterCandidateDialog } from "@/components/candidate/RegisterCandidateDialog";
import { UserPlus, Users } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function CandidatesPage() {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const { user } = useAuthStore();
  
  // Check if user can register candidates (Admin or HR)
  const canRegisterCandidates = user?.role === "admin" || user?.role === "hr";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Candidates
          </h1>
          <p className="text-gray-600">
            Manage candidates in your organization
          </p>
        </div>
        {canRegisterCandidates && (
          <Button
            onClick={() => setIsRegisterDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-5 w-5" />
            Register Candidate
          </Button>
        )}
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Candidate List
          </CardTitle>
          <CardDescription>
            View and manage all candidates in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CandidateList />
        </CardContent>
      </Card>

      <RegisterCandidateDialog
        open={isRegisterDialogOpen}
        onOpenChange={setIsRegisterDialogOpen}
        onSuccess={() => {
          setIsRegisterDialogOpen(false);
        }}
      />
    </div>
  );
}

