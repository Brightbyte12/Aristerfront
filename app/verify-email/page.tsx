// src/app/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getProfileDetails } = useAuth();

  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus("error");
        setMessage("Verification token not found in the URL.");
        toast({
          title: "Verification Failed",
          description: "No token provided for email verification.",
          variant: "destructive",
        });
        return;
      }

      setVerificationStatus("verifying");
      setMessage("Verifying your email address...");

      try {
        const response = await axios.get(`/api/auth/verify-email?token=${token}`);

        if (response.data.success) {
          setVerificationStatus("success");
          setMessage(response.data.message || "Email verified successfully!");
          toast({
            title: "Verification Successful!",
            description: response.data.message || "Your email has been successfully verified.",
          });

          await getProfileDetails();

          setTimeout(() => {
            router.push("/account");
          }, 1000); // 1 સેકન્ડનો વિલંબ, જરૂર મુજબ બદલી શકાય છે

        } else {
          setVerificationStatus("error");
          setMessage(response.data.message || "Email verification failed.");
          toast({
            title: "Verification Failed",
            description: response.data.message || "An error occurred during verification.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        setVerificationStatus("error");
        setMessage(
          error.response?.data?.message || "An unexpected error occurred during verification."
        );
        toast({
          title: "Verification Failed",
          description: error.response?.data?.message || "Please try again or register again to get a new link.",
          variant: "destructive",
        });
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [searchParams, router, getProfileDetails]);

  // --- MOVE renderContent FUNCTION HERE (BEFORE the return statement) ---
  const renderContent = () => {
    switch (verificationStatus) {
      case "verifying":
        return (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <h2 className="text-responsive-xl font-bold text-gray-800 mt-4">{message}</h2>
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle className="w-12 h-12 text-green-500" />
            <h2 className="text-responsive-xl font-bold text-gray-800 mt-4">{message}</h2>
            <p className="text-responsive-base text-gray-600 mt-2">
              Redirecting to your account page...
            </p>
          </>
        );
      case "error":
        return (
          <>
            <XCircle className="w-12 h-12 text-red-500" />
            <h2 className="text-responsive-xl font-bold text-gray-800 mt-4">{message}</h2>
            <p className="text-responsive-base text-gray-600 mt-2">
              Please check the link or try registering again.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="mt-6 px-6 py-3 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition-colors"
            >
              Go to Login
            </button>
          </>
        );
      default:
        return (
          <>
            <h2 className="text-responsive-xl font-bold text-gray-800 mt-4">
              Email Verification
            </h2>
            <p className="text-responsive-base text-gray-600 mt-2">
              Waiting for verification token...
            </p>
          </>
        );
    }
  };
  // --- END OF MOVED FUNCTION ---

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 animate-fade-in">
      <Card className="w-full max-w-md animate-slide-up text-center py-8">
        <CardHeader>
          <CardTitle className="text-responsive-2xl">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}