import { Bot } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Bot className="h-8 w-8 text-primary-blue" />
      <span className="text-2xl font-bold text-primary-purple">Vecna</span>
    </div>
  );
}

