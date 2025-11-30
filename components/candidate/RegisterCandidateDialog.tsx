"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegisterCandidate } from "@/lib/hooks/useCandidate";
import { Loader2 } from "lucide-react";

const registerCandidateSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
});

type RegisterCandidateFormData = z.infer<typeof registerCandidateSchema>;

interface RegisterCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RegisterCandidateDialog({ open, onOpenChange, onSuccess }: RegisterCandidateDialogProps) {
  const registerCandidate = useRegisterCandidate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterCandidateFormData>({
    resolver: zodResolver(registerCandidateSchema),
  });

  const onSubmit = async (data: RegisterCandidateFormData) => {
    try {
      await registerCandidate.mutateAsync({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password || undefined,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register New Candidate</DialogTitle>
          <DialogDescription>
            Register a new candidate in your organization. If no password is provided, a random 8-character password will be generated.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {registerCandidate.isError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {registerCandidate.error instanceof Error
                ? registerCandidate.error.message
                : "Failed to register candidate"}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                First Name *
              </label>
              <Input
                id="first_name"
                {...register("first_name")}
                placeholder="John"
                className="bg-white"
              />
              {errors.first_name && (
                <p className="text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <Input
                id="last_name"
                {...register("last_name")}
                placeholder="Smith"
                className="bg-white"
              />
              {errors.last_name && (
                <p className="text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="candidate@example.com"
              className="bg-white"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password (Optional)
            </label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Leave empty for auto-generated password"
              className="bg-white"
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
            <p className="text-xs text-gray-500">
              If left empty, a random 8-character password will be generated
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={registerCandidate.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={registerCandidate.isPending}>
              {registerCandidate.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Candidate"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

