"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, UserPlus, Plus } from "lucide-react";
import { CreateOrganizationDialog } from "@/components/organization/CreateOrganizationDialog";
import { AddHrUserDialog } from "@/components/organization/AddHrUserDialog";
import { useAuthStore } from "@/store/authStore";

export default function OrganizationPage() {
  const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false);
  const [isAddHrDialogOpen, setIsAddHrDialogOpen] = useState(false);
  const { user } = useAuthStore();
  
  // Check if user is admin (only admins can create org and add HR)
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Organization
        </h1>
        <p className="text-gray-600">
            Manage your organization settings and members
        </p>
        </div>
        <div className="flex gap-2">
          {!isAdmin && (
            <Button
              onClick={() => setIsCreateOrgDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Organization
            </Button>
          )}
          {isAdmin && (
            <Button
              onClick={() => setIsAddHrDialogOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-5 w-5" />
              Add HR User
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Organization Status
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isAdmin ? "Active" : "Not Created"}
            </div>
            <CardDescription className="text-xs mt-1">
              {isAdmin 
                ? "You are an organization admin" 
                : "Create an organization to get started"}
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Your Role
            </CardTitle>
            <Users className="h-4 w-4 text-primary-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 capitalize">
              {user?.role || "User"}
            </div>
            <CardDescription className="text-xs mt-1">
              Current organization role
            </CardDescription>
          </CardContent>
        </Card>

        {isAdmin && (
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
                HR Users
            </CardTitle>
              <UserPlus className="h-4 w-4 text-primary-yellow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">-</div>
            <CardDescription className="text-xs mt-1">
                Manage HR users in your organization
            </CardDescription>
          </CardContent>
        </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {!isAdmin && (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Create Organization</CardTitle>
              <CardDescription>
                Create a new organization and become the admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                You don't belong to an organization yet. Create one to get started with managing 
                candidates, interview panels, and HR users.
              </p>
              <Button
                onClick={() => setIsCreateOrgDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Organization
              </Button>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Add HR User</CardTitle>
              <CardDescription>
                Add HR users to your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                HR users can register candidates and manage interview panels. Add HR users 
                to delegate candidate management tasks.
              </p>
              <Button
                onClick={() => setIsAddHrDialogOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                Add HR User
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Organization Information</CardTitle>
            <CardDescription>
              View your organization details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-gray-900">
                  {isAdmin ? "Active" : "Not Created"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Your Role:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {user?.role || "User"}
                </span>
              </div>
              {isAdmin && (
                <p className="text-xs text-gray-500 mt-4">
                  As an admin, you can create interview panels, register candidates, 
                  and add HR users to your organization.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateOrganizationDialog
        open={isCreateOrgDialogOpen}
        onOpenChange={setIsCreateOrgDialogOpen}
        onSuccess={() => {
          setIsCreateOrgDialogOpen(false);
        }}
      />

      <AddHrUserDialog
        open={isAddHrDialogOpen}
        onOpenChange={setIsAddHrDialogOpen}
        onSuccess={() => {
          setIsAddHrDialogOpen(false);
        }}
      />
    </div>
  );
}

