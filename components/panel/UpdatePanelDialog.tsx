"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateInterviewPanel, useInterviewPanel } from "@/lib/hooks/usePanel";
import { Loader2 } from "lucide-react";

const updatePanelSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be 255 characters or less").optional(),
  description: z.string().optional(),
  start_datetime: z.string().min(1, "Start datetime is required").optional(),
  end_datetime: z.string().min(1, "End datetime is required").optional(),
}).refine((data) => {
  if (data.start_datetime && data.end_datetime) {
    const start = new Date(data.start_datetime);
    const end = new Date(data.end_datetime);
    return end > start;
  }
  return true;
}, {
  message: "End datetime must be after start datetime",
  path: ["end_datetime"],
});

type UpdatePanelFormData = z.infer<typeof updatePanelSchema>;

interface UpdatePanelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelUuid: string | null;
  onSuccess?: () => void;
}

// Helper function to convert ISO datetime to datetime-local format
function toDateTimeLocal(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function UpdatePanelDialog({ open, onOpenChange, panelUuid, onSuccess }: UpdatePanelDialogProps) {
  const updatePanel = useUpdateInterviewPanel();
  const { data: panel, isLoading } = useInterviewPanel(panelUuid || undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdatePanelFormData>({
    resolver: zodResolver(updatePanelSchema),
  });

  // Reset form when panel data is loaded
  useEffect(() => {
    if (panel && open) {
      reset({
        name: panel.name,
        description: panel.description || "",
        start_datetime: panel.start_datetime ? toDateTimeLocal(panel.start_datetime) : "",
        end_datetime: panel.end_datetime ? toDateTimeLocal(panel.end_datetime) : "",
      });
    }
  }, [panel, open, reset]);

  const onSubmit = async (data: UpdatePanelFormData) => {
    if (!panelUuid) return;

    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.start_datetime) {
        // Convert datetime-local to ISO format
        updateData.start_datetime = new Date(data.start_datetime).toISOString();
      }
      if (data.end_datetime) {
        // Convert datetime-local to ISO format
        updateData.end_datetime = new Date(data.end_datetime).toISOString();
      }

      await updatePanel.mutateAsync({
        panelUuid,
        data: updateData,
      });
      reset();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the mutation
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

  if (!panel) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Interview Panel</DialogTitle>
          <DialogDescription>
            Update the interview panel details. Only active panels can be updated.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {updatePanel.isError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {updatePanel.error instanceof Error
                ? updatePanel.error.message
                : "Failed to update interview panel"}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Panel Name
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="start_datetime" className="text-sm font-medium text-gray-700">
                Start Date & Time
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
                End Date & Time
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

          {/* Show panel candidates */}
          {panel.candidates && panel.candidates.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-medium text-gray-700">
                Panel Candidates ({panel.candidates.length})
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {panel.candidates.map((panelCandidate) => (
                  <div key={panelCandidate.uuid} className="flex items-center justify-between p-2 bg-blue-50 rounded text-xs">
                    <div className="flex-1">
                      <span className="text-gray-700 font-medium">{panelCandidate.candidate_name}</span>
                      {panelCandidate.candidate_email && (
                        <span className="text-gray-500 ml-2">({panelCandidate.candidate_email})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={updatePanel.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updatePanel.isPending || !panel.is_active}>
              {updatePanel.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Panel"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

