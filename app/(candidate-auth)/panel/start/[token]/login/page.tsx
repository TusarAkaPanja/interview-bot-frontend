"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCandidateLogin } from "@/lib/hooks/useCandidateAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function CandidateLoginPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const loginMutation = useCandidateLogin();
  const [tokenError, setTokenError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid interview link. Token is missing.");
    }
  }, [token]);

  const onSubmit = async (data: LoginFormData) => {
    if (!token) {
      setTokenError("Invalid interview link. Token is missing.");
      return;
    }

    try {
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password,
        token: token,
      });
      
      // Redirect to interview page
      router.push(`/panel/start/${token}/interview`);
    } catch (err) {
      // Error is handled by the mutation
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary-purple">
            Candidate Login
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to start your interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokenError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
              {tokenError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {loginMutation.isError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                {loginMutation.error instanceof Error 
                  ? loginMutation.error.message 
                  : "Login failed. Please check your credentials."}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                {...register("username")}
                className="bg-white"
              />
              {errors.username && (
                <p className="text-sm text-primary-red">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className="bg-white"
              />
              {errors.password && (
                <p className="text-sm text-primary-red">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending || !token}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

