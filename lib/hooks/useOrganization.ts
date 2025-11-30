import { useMutation } from "@tanstack/react-query";
import {
  createOrganization,
  addHrUser,
  CreateOrganizationData,
  AddHrUserData,
} from "@/lib/api";

// Create Organization
export function useCreateOrganization() {
  return useMutation({
    mutationFn: (data: CreateOrganizationData) => createOrganization(data),
  });
}

// Add HR User
export function useAddHrUser() {
  return useMutation({
    mutationFn: (data: AddHrUserData) => addHrUser(data),
  });
}

