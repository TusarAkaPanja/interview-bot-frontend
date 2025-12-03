"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useInterviewPanel } from "@/lib/hooks/usePanel";
import { Loader2, Calendar, Users, FileQuestion, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadCandidateReport } from "@/lib/api";
import type { InterviewPanel } from "@/types/panel";

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

interface ViewPanelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelUuid: string | null;
}

export function ViewPanelDialog({ open, onOpenChange, panelUuid }: ViewPanelDialogProps) {
  const { data: panel, isLoading, isError } = useInterviewPanel(panelUuid || undefined);
  const [downloadingSessionUuid, setDownloadingSessionUuid] = useState<string | null>(null);

  const handleDownloadReport = async (sessionUuid: string, candidateName: string) => {
    if (!sessionUuid) return;
    
    setDownloadingSessionUuid(sessionUuid);
    try {
      const blob = await downloadCandidateReport(sessionUuid);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interview-report-${candidateName.replace(/\s+/g, "-")}-${sessionUuid}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download report:", error);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloadingSessionUuid(null);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isError || !panel) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex flex-col items-center justify-center py-12">
            <X className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 text-lg font-medium mb-2">Failed to load panel</p>
            <p className="text-gray-600 text-sm">Unable to retrieve panel details</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const now = new Date();
  const endDate = new Date(panel.end_datetime);
  const startDate = new Date(panel.start_datetime);
  const isUpcoming = startDate > now;
  const isExpired = endDate < now;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{panel.name}</DialogTitle>
          <DialogDescription>
            {panel.description || "Interview panel details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Status</label>
              <div className="mt-1">
                <span
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium",
                    panel.is_active && !isExpired
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
            <div>
              <label className="text-xs text-gray-500">Total Questions</label>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {panel.total_number_of_questions}
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <label className="text-xs text-gray-500">Start Date & Time</label>
              </div>
              <div className="text-sm text-gray-900">{formatDateTime(panel.start_datetime)}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <label className="text-xs text-gray-500">End Date & Time</label>
              </div>
              <div className="text-sm text-gray-900">{formatDateTime(panel.end_datetime)}</div>
            </div>
          </div>

          {/* Question Distributions */}
          {panel.question_distributions && panel.question_distributions.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <FileQuestion className="h-5 w-5 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Question Distributions</label>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {panel.question_distributions.map((dist, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-gray-50">
                    <div className="font-medium text-sm text-gray-900 mb-2">
                      {dist.topic} - {dist.subtopic}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Easy:</span>
                        <span className="ml-1 font-medium text-gray-900">{dist.easy}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Medium:</span>
                        <span className="ml-1 font-medium text-gray-900">{dist.medium}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Hard:</span>
                        <span className="ml-1 font-medium text-gray-900">{dist.hard}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <span className="ml-1 font-medium text-primary-blue">{dist.total}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Candidates */}
          {panel.candidates && panel.candidates.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">
                  Candidates ({panel.candidates.length})
                </label>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {panel.candidates.map((candidate) => (
                  <div key={candidate.uuid} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {candidate.candidate_name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{candidate.candidate_email}</div>
                        {candidate.status && (
                          <div className="mt-2">
                            <span
                              className={cn(
                                "px-2 py-1 rounded-md text-xs font-medium",
                                getStatusColor(candidate.status)
                              )}
                            >
                              {candidate.status}
                            </span>
                          </div>
                        )}
                        {candidate.score !== undefined && candidate.score !== null && (
                          <div className="text-xs text-gray-600 mt-1">
                            Score: <span className="font-medium">{candidate.score}</span>
                          </div>
                        )}
                        {candidate.cumulative_score !== undefined && candidate.cumulative_score !== null && (
                          <div className="text-xs text-gray-600 mt-1">
                            Cumulative Score: <span className="font-medium">{candidate.cumulative_score}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {candidate.session_uuid && 
                         (candidate.has_report || 
                          candidate.status?.toLowerCase() === "completed") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReport(candidate.session_uuid!, candidate.candidate_name)}
                            disabled={downloadingSessionUuid === candidate.session_uuid}
                            className="text-xs"
                          >
                            {downloadingSessionUuid === candidate.session_uuid ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="h-3 w-3 mr-1" />
                                Download Report
                              </>
                            )}
                          </Button>
                        )}
                        {candidate.token && (
                          <div className="text-xs">
                            <div className="text-gray-500">Token:</div>
                            <div className="font-mono text-gray-700 break-all max-w-xs">
                              {candidate.token}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {candidate.token_expires_at && (
                      <div className="text-xs text-gray-500 mt-2">
                        Token expires: {formatDateTime(candidate.token_expires_at)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!panel.candidates || panel.candidates.length === 0) && (
            <div className="pt-4 border-t">
              <div className="text-center py-4 text-sm text-gray-500">
                No candidates assigned to this panel
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

