import type { Metadata } from "next";
import { StudentVerification } from "@/components/auth/student-verification";

export const metadata: Metadata = {
  title: "Student Verification"
};

export default function VerifyStudentPage() {
  return <StudentVerification />;
}
