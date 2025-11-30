"use client";

import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Users, FileText, TrendingUp } from "lucide-react";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);

  const stats = [
    {
      title: "Total Interviews",
      value: "0",
      icon: FileText,
      color: "text-primary-blue",
    },
    {
      title: "Active Candidates",
      value: "0",
      icon: Users,
      color: "text-primary-pink",
    },
    {
      title: "Completed",
      value: "0",
      icon: TrendingUp,
      color: "text-primary-yellow",
    },
    {
      title: "AI Sessions",
      value: "0",
      icon: Bot,
      color: "text-primary-purple",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your interviews today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <CardDescription className="text-xs mt-1">
                  No data available yet
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Getting Started</CardTitle>
          <CardDescription>
            Start your first AI interview session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your dashboard is ready. Begin by scheduling your first interview
            or exploring the available features based on your role.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

