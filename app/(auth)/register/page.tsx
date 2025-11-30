import { RegisterForm } from "@/components/auth/RegisterForm";
import { Logo } from "@/components/common/Logo";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo className="justify-center mb-4" />
          <p className="text-muted-foreground">
            Create your account to get started
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

