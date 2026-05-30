import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login"
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Login with your email or Google account and jump straight into your campus marketplace."
      switchHref="/register"
      switchLabel="New here?Create account"
    >
      <LoginForm />
    </AuthShell>
  );
}
