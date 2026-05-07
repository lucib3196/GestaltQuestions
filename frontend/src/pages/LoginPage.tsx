import { useEffect } from "react";
import { Navigate } from "react-router-dom";

import { AuthModeProvider, UseAuthMode } from "../context/AuthMode";
import { useAuth } from "../features/Auth";
import { LogInForm } from "../features/Auth/components/login/LogInForm";
import { SignUpForm } from "../features/Auth/components/login/SignUpForm";

function LoginPageContent() {
  const { user } = useAuth();
  const { setMode, mode } = UseAuthMode();

  useEffect(() => {
    setMode("login");
  }, [setMode]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-bg text-text">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        {mode === "login" ? <LogInForm /> : <SignUpForm />}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <AuthModeProvider>
      <LoginPageContent />
    </AuthModeProvider>
  );
}
