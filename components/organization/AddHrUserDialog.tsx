"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddHrUser } from "@/lib/hooks/useOrganization";
import { Loader2 } from "lucide-react";

const addHrUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
});

type AddHrUserFormData = z.infer<typeof addHrUserSchema>;

interface AddHrUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddHrUserDialog({ open, onOpenChange, onSuccess }: AddHrUserDialogProps) {
  const addHrUser = useAddHrUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddHrUserFormData>({
    resolver: zodResolver(addHrUserSchema),
  });

  const onSubmit = async (data: AddHrUserFormData) => {
    try {
      await addHrUser.mutateAsync({
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
          <DialogTitle>Add HR User</DialogTitle>
          <DialogDescription>
            Add a new HR user to your organization. If no password is provided, a random password will be generated.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {addHrUser.isError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {addHrUser.error instanceof Error
                ? addHrUser.error.message
                : "Failed to add HR user"}
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
                placeholder="Jane"
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
                placeholder="Doe"
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
              placeholder="hr@acme.com"
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
              If left empty, a random password will be generated
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
              disabled={addHrUser.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addHrUser.isPending}>
              {addHrUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add HR User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

