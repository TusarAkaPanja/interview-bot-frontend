"use client";

import { Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, FileQuestion, Trash2, Edit, Loader2, AlertCircle } from "lucide-react";
import { useInterviewPanels, useDeleteInterviewPanel } from "@/lib/hooks/usePanel";
import { CreatePanelDialog } from "@/components/panel/CreatePanelDialog";
import { ViewPanelDialog } from "@/components/panel/ViewPanelDialog";
import { UpdatePanelDialog } from "@/components/panel/UpdatePanelDialog";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

function PanelCard({ panel, onView, onUpdate }: { panel: any; onView: () => void; onUpdate: () => void }) {
  const deletePanel = useDeleteInterviewPanel();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this panel?")) {
      try {
        await deletePanel.mutateAsync(panel.uuid);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const totalCandidates = panel.candidates?.length || 0;
  const totalDistributions = panel.question_distributions?.length || 0;
  const isActive = panel.is_active;
  const now = new Date();
  const endDate = new Date(panel.end_datetime);
  const startDate = new Date(panel.start_datetime);
  const isUpcoming = startDate > now;
  const isExpired = endDate < now;

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{panel.name}</CardTitle>
            {panel.description && (
              <p className="text-sm text-gray-600 mb-2">{panel.description}</p>
            )}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "px-2 py-1 rounded-md text-xs font-medium",
                  isActive && !isExpired
                    ? "bg-green-100 text-green-700"
                    : isExpired
                    ? "bg-gray-100 text-gray-700"
                    : "bg-blue-100 text-blue-700"
                )}
              >
                {isExpired ? "Expired" : isUpcoming ? "Upcoming" : "Active"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onView}
              className="text-primary-blue hover:text-primary-blue"
              title="View Panel"
            >
              View
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onUpdate}
                  className="text-gray-600 hover:text-gray-700"
                  title="Update Panel"
                  disabled={!panel.is_active}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deletePanel.isPending}
                  className="text-red-600 hover:text-red-700"
                  title="Delete Panel"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <FileQuestion className="h-4 w-4" />
              Total Questions:
            </span>
            <span className="font-semibold text-gray-900">{panel.total_number_of_questions}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Candidates:
            </span>
            <span className="font-semibold text-gray-900">{totalCandidates}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <FileQuestion className="h-4 w-4" />
              Distributions:
            </span>
            <span className="font-semibold text-gray-900">{totalDistributions}</span>
          </div>

          <div className="pt-3 border-t space-y-2">
            <div className="text-xs text-gray-600">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3 w-3" />
                <span className="font-medium">Start:</span>
              </div>
              <div className="ml-5">{formatDateTime(panel.start_datetime)}</div>
            </div>
            <div className="text-xs text-gray-600">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3 w-3" />
                <span className="font-medium">End:</span>
              </div>
              <div className="ml-5">{formatDateTime(panel.end_datetime)}</div>
            </div>
          </div>

          {totalDistributions > 0 && (
            <div className="pt-3 border-t">
              <div className="text-xs font-medium text-gray-700 mb-2">Question Distributions:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {panel.question_distributions.map((dist: any, idx: number) => (
                  <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <div className="font-medium">{dist.topic} - {dist.subtopic}</div>
                    <div className="flex gap-2 mt-1">
                      <span>E: {dist.easy}</span>
                      <span>M: {dist.medium}</span>
                      <span>H: {dist.hard}</span>
                      <span className="ml-auto font-medium">Total: {dist.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PanelsContent() {
  const { data: panels = [], isLoading, isError, error, refetch } = useInterviewPanels();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedPanelUuid, setSelectedPanelUuid] = useState<string | null>(null);
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleView = (panelUuid: string) => {
    setSelectedPanelUuid(panelUuid);
    setViewDialogOpen(true);
  };

  const handleUpdate = (panelUuid: string) => {
    setSelectedPanelUuid(panelUuid);
    setUpdateDialogOpen(true);
  };

  const handleUpdateSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 text-lg font-medium mb-2">Failed to load interview panels</p>
        <p className="text-gray-600 text-sm mb-4">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Panels</h1>
          <p className="text-gray-600">
            Manage interview panels, question distributions, and candidate assignments
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Panel
          </Button>
        )}
      </div>

      {panels.length === 0 ? (
        <Card className="bg-white shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">No interview panels found</p>
              <p className="text-sm text-gray-500 mb-4">
                {isAdmin
                  ? "Create your first interview panel to get started"
                  : "No interview panels have been created yet"}
              </p>
              {isAdmin && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Panel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {panels.map((panel) => (
            <PanelCard
              key={panel.uuid}
              panel={panel}
              onView={() => handleView(panel.uuid)}
              onUpdate={() => handleUpdate(panel.uuid)}
            />
          ))}
        </div>
      )}

      <CreatePanelDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
      <ViewPanelDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        panelUuid={selectedPanelUuid}
      />
      <UpdatePanelDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        panelUuid={selectedPanelUuid}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
}

export default function PanelsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
        </div>
      }
    >
      <PanelsContent />
    </Suspense>
  );
}
