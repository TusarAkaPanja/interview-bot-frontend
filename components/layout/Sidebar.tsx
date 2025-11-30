"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Users, LogOut, Building2, Clipboard } from "lucide-react";
import { UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    title: "Home",
    href: "/home",
    icon: Home,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Question Bank",
    href: "/question-bank",
    icon: BookOpen,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Panels",
    href: "/panels",
    icon: Clipboard,
    roles: ["admin", "superadmin", "hr"],
  },
  {
    title: "Organization",
    href: "/organization",
    icon: Building2,
    roles: ["admin"],
  },
  {
    title: "Candidates",
    href: "/candidates",
    icon: Users,
    roles: ["admin", "superadmin", "hr"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const visibleItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="bg-white w-64 min-h-screen p-4 border-r border-gray-200 flex flex-col">
      <nav className="space-y-2 flex-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-primary-blue/10 text-primary-blue border border-primary-blue/20"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="font-medium">
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </span>
        </Button>
      </div>
    </aside>
  );
}

