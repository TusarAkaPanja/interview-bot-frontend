"use client";

import { useParams } from "next/navigation";
import InterviewComponent from "@/components/candidate/InterviewComponent";

export default function InterviewPage() {
  const params = useParams();
  const token = params.token as string;
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Interview Link</h1>
          <p className="text-gray-600">Token is missing from the URL.</p>
        </div>
      </div>
    );
  }

  return (
    <InterviewComponent 
      token={token}
      wsUrl={wsUrl}
    />
  );
}

