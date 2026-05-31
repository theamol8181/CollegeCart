"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, FileText, DollarSign, CheckCircle2 } from "lucide-react";
import { bangaloreColleges, years } from "@/lib/bangalore-colleges";
import { useAuthStore } from "@/stores/auth-store";
import type { DeliveryPartnerApplication } from "@/lib/types";

const collegeOptions = [
  "MSRIT", "BMSCE", "RVCE", "PES University", "DSCE", "BIT",
  "New Horizon", "CMRIT", "Reva University", "Jain University",
  "Christ University", "Presidency University", "Alliance University",
  "Dayananda Sagar University", "Other"
];

export function DeliveryPartnerForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [formData, setFormData] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    whatsappNumber: "",
    usn: user?.usn ?? "",
    collegeName: user?.collegeName ?? "",
    year: user?.year ?? "",
    department: user?.department ?? "",
    address: "",
    emergencyContact: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    agreeToTerms: false
  });

  const [files, setFiles] = useState({
    idCardFront: null as File | null,
    idCardBack: null as File | null,
    profilePhoto: null as File | null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showOtherCollege, setShowOtherCollege] = useState(formData.collegeName === "Other");

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === "collegeName") {
        setShowOtherCollege(value === "Other");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [name]: file }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      setMessage("You must agree to the terms and conditions");
      return;
    }

    if (!files.idCardFront || !files.idCardBack || !files.profilePhoto) {
      setMessage("Please upload all required documents");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Import Firestore functions
      const { uploadIdCardImage } = await import("@/lib/firestore");
      const { saveUserProfile } = await import("@/lib/firestore");
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");

      // Upload all documents to Firebase Storage
      const [idCardFrontUrl, idCardBackUrl, profilePhotoUrl] = await Promise.all([
        uploadIdCardImage(user.uid, files.idCardFront),
        uploadIdCardImage(user.uid, files.idCardBack),
        uploadIdCardImage(user.uid, files.profilePhoto)
      ]);

      const applicationId = `dp_${user.uid}_${Date.now()}`;
      const application: DeliveryPartnerApplication = {
        id: applicationId,
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        usn: formData.usn,
        collegeName: formData.collegeName,
        year: formData.year,
        department: formData.department,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        upiId: formData.upiId,
        idCardFront: idCardFrontUrl,
        idCardBack: idCardBackUrl,
        profilePhoto: profilePhotoUrl,
        status: "pending",
        rating: 0,
        completedDeliveries: 0,
        totalEarnings: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to Firestore
      if (db) {
        await setDoc(doc(db, "delivery-applications", applicationId), application, { merge: true });
        console.log(`✅ Delivery partner application saved to Firestore: ${applicationId}`);
      }

      // Also save to localStorage for fallback
      if (typeof window !== "undefined") {
        const applications = JSON.parse(localStorage.getItem("delivery-applications") || "[]");
        applications.push(application);
        localStorage.setItem("delivery-applications", JSON.stringify(applications));
      }

      setMessage("Application submitted successfully!");
      setTimeout(() => router.push("/delivery-partner/status"), 1500);
    } catch (error) {
      console.error("Error submitting application:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : "Failed to submit application"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-ocean to-ocean/70 p-8 text-white shadow-premium">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Become a CollegeCart Delivery Partner</h1>
        <p className="mt-4 text-sm leading-7 text-white/80">
          Earn money by delivering products within your college campus. Flexible timings, no vehicle required.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="flex gap-3">
            <div className="size-8 rounded-full bg-white/20 grid place-items-center">✓</div>
            <div>
              <p className="font-black">Flexible Timings</p>
              <p className="text-sm text-white/70">Work when you want</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="size-8 rounded-full bg-white/20 grid place-items-center">✓</div>
            <div>
              <p className="font-black">Earn Per Delivery</p>
              <p className="text-sm text-white/70">Get paid for each delivery</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="size-8 rounded-full bg-white/20 grid place-items-center">✓</div>
            <div>
              <p className="font-black">No Vehicle Required</p>
              <p className="text-sm text-white/70">Campus delivery only</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="size-8 rounded-full bg-white/20 grid place-items-center">✓</div>
            <div>
              <p className="font-black">Student-Friendly</p>
              <p className="text-sm text-white/70">Part-time income</p>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <FormSection title="Personal Details" icon={<FileText className="size-5" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="WhatsApp Number"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="USN / Student ID"
              name="usn"
              value={formData.usn}
              onChange={handleInputChange}
              required
            />
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-200">College Name</label>
              <select
                name="collegeName"
                value={formData.collegeName}
                onChange={handleInputChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 dark:border-white/10 dark:bg-white/10 dark:text-white"
              >
                <option value="">Select your college</option>
                {collegeOptions.map(college => (
                  <option key={college} value={college}>{college}</option>
                ))}
              </select>
            </div>
            {showOtherCollege && (
              <FormInput
                label="Enter Your College Name"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleInputChange}
                placeholder="Your college name"
              />
            )}
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-200">Year of Study</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 dark:border-white/10 dark:bg-white/10 dark:text-white"
              >
                <option value="">Select year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <FormInput
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Current Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Your college address"
              required
            />
            <FormInput
              label="Emergency Contact Number"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              required
            />
          </div>
        </FormSection>

        {/* Bank Details */}
        <FormSection title="Bank Details" icon={<DollarSign className="size-5" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Account Holder Name"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Account Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="IFSC Code"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="UPI ID"
              name="upiId"
              value={formData.upiId}
              onChange={handleInputChange}
              placeholder="yourname@upi"
              required
            />
          </div>
        </FormSection>

        {/* Document Uploads */}
        <FormSection title="Document Uploads" icon={<Upload className="size-5" />}>
          <div className="grid gap-6 sm:grid-cols-3">
            <FileUploadBox
              label="College ID Front"
              name="idCardFront"
              file={files.idCardFront}
              onChange={handleFileChange}
              required
            />
            <FileUploadBox
              label="College ID Back"
              name="idCardBack"
              file={files.idCardBack}
              onChange={handleFileChange}
              required
            />
            <FileUploadBox
              label="Profile Photo"
              name="profilePhoto"
              file={files.profilePhoto}
              onChange={handleFileChange}
              required
            />
          </div>
        </FormSection>

        {/* Terms & Conditions */}
        <div className="rounded-lg border border-slate-300 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="mt-1 size-5 rounded border-slate-300 accent-ocean"
              required
            />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              I agree to CollegeCart Delivery Partner Terms & Conditions
            </span>
          </label>
        </div>

        {message && (
          <div className={`rounded-lg p-4 text-sm font-semibold ${
            message.includes("successfully")
              ? "bg-mint/12 text-emerald-700 dark:text-mint"
              : "bg-coral/10 text-coral"
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ocean px-8 py-4 text-sm font-black text-white shadow-glow disabled:opacity-60 w-full"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
          {loading ? "Submitting..." : "Apply Now"}
        </button>
      </form>
    </div>
  );
}

function FormSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
      <div className="mb-6 flex items-center gap-3">
        <div className="text-ocean">{icon}</div>
        <h2 className="text-xl font-black text-ink dark:text-white">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-black text-slate-700 dark:text-slate-200">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-white"
      />
    </div>
  );
}

function FileUploadBox({
  label,
  name,
  file,
  onChange,
  required
}: {
  label: string;
  name: string;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ocean/30 bg-ocean/5 p-6 text-center transition hover:border-ocean hover:bg-ocean/10">
      <Upload className="size-8 text-ocean" />
      <span className="mt-2 text-sm font-black text-ink dark:text-white">
        {file ? file.name : label}
      </span>
      <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
        PNG, JPG up to 10MB
      </span>
      <input
        type="file"
        name={name}
        onChange={onChange}
        accept="image/*"
        required={required}
        className="hidden"
      />
    </label>
  );
}
