import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register"
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Build a trusted student profile with college details, avatar, and secure login."
      switchHref="/login"
      switchLabel="Already registered?Login"
    >
      <RegisterForm />
    </AuthShell>
  );
}
