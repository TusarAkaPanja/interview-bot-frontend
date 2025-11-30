import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/common/Logo";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo className="justify-center mb-4" />
          <p className="text-muted-foreground">
            AI-powered interview bot platform
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

