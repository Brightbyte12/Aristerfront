// src/app/login/page.tsx
// (Provided in your message, included here for completeness, with only the toast variant changed)
"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [userIdForOtp, setUserIdForOtp] = useState<string | null>(null);
  const [emailForOtp, setEmailForOtp] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"login" | "register" | "verifyOtp">("login");

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
    otp?: string;
  }>({});

  const [resendCountdown, setResendCountdown] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, verifyOtp, resendOtp, state } = useAuth();
  const router = useRouter();
  const otpInputs = useRef<Array<HTMLInputElement | null>>([]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email address is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters long";
    return "";
  };

  const validateName = (name: string) => {
    if (!name) return "Name is required";
    return "";
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone)) return "Please enter a valid 10-digit phone number";
    return "";
  };

  const validateOtp = (otp: string) => {
    if (!otp) return "OTP is required";
    if (otp.length !== 6 || !/^\d+$/.test(otp)) return "Please enter a valid 6-digit OTP";
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setErrors((prev) => ({ ...prev, name: validateName(value) }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = otp.split("");
    newOtp[index] = value;
    const combinedOtp = newOtp.join("");
    setOtp(combinedOtp);
    setErrors((prev) => ({ ...prev, otp: validateOtp(combinedOtp) }));

    if (value && index < 5 && otpInputs.current[index + 1]) {
      otpInputs.current[index + 1]?.focus();
    }
    if (!value && index > 0 && otpInputs.current[index - 1]) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData);
      setErrors((prev) => ({ ...prev, otp: validateOtp(pastedData) }));
      otpInputs.current.forEach((input, i) => {
        if (input) input.value = pastedData[i];
      });
      otpInputs.current[5]?.focus();
    }
  };

  useEffect(() => {
    if (state.isLoading) {
      return;
    }

    if (state.isAuthenticated) {
      if (state.user?.emailVerified) {
        router.push("/account");
      } else {
        toast({
          title: "Email Not Verified",
          description: "Please verify your email to access your account.",
          variant: "error",
        });
        if (state.user?._id && state.user?.email) {
          setUserIdForOtp(state.user._id);
          setEmailForOtp(state.user.email);
          setCurrentStep("verifyOtp");
          setResendCountdown(60);
        } else {
          console.error("Authenticated user has no _id or email for OTP redirect.");
          router.push("/login");
        }
      }
    }
  }, [state.isLoading, state.isAuthenticated, state.user, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      setCanResendOtp(false);
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    } else if (resendCountdown === 0 && currentStep === "verifyOtp") {
      setCanResendOtp(true);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown, currentStep]);

  const handleResendOtp = async () => {
    if (!emailForOtp) {
      setErrors((prev) => ({ ...prev, email: "Email is missing for OTP resend" }));
      return;
    }
    setIsLoading(true);
    setCanResendOtp(false);
    setResendCountdown(60);

    try {
      await resendOtp(emailForOtp);
      setErrors({});
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, otp: error.message }));
      setResendCountdown(0);
      setCanResendOtp(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors: typeof errors = {};
    if (currentStep === "register") {
      newErrors.name = validateName(name);
      newErrors.email = validateEmail(email);
      newErrors.password = validatePassword(password);
      newErrors.phone = validatePhone(phone);
    } else if (currentStep === "login") {
      newErrors.email = validateEmail(email);
      newErrors.password = validatePassword(password);
    } else if (currentStep === "verifyOtp") {
      newErrors.otp = validateOtp(otp);
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      setIsLoading(false);
      return;
    }

    try {
      if (currentStep === "register") {
        const registrationResult = await register(name, email, password, phone);
        if (registrationResult.success && registrationResult.userId && registrationResult.email) {
          setUserIdForOtp(registrationResult.userId);
          setEmailForOtp(registrationResult.email);
          setCurrentStep("verifyOtp");
          setResendCountdown(60);
        } else {
          setErrors((prev) => ({ ...prev, email: "Registration issue: Could not redirect for OTP verification" }));
          setCurrentStep("login");
        }
      } else if (currentStep === "login") {
        const loginResult = await login(email, password);
        if (loginResult && "requiresOtpVerification" in loginResult && loginResult.requiresOtpVerification) {
          if (loginResult.userId && loginResult.email) {
            setUserIdForOtp(loginResult.userId);
            setEmailForOtp(loginResult.email);
            setCurrentStep("verifyOtp");
            setResendCountdown(60);
          } else {
            setErrors((prev) => ({ ...prev, email: "Login issue: Missing information for email verification" }));
          }
        }
      } else if (currentStep === "verifyOtp") {
        if (!userIdForOtp) {
          setErrors((prev) => ({ ...prev, otp: "User ID is missing for verification" }));
          return;
        }
        await verifyOtp(userIdForOtp, otp);
      }
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, [currentStep === "verifyOtp" ? "otp" : "email"]: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormContent = () => {
    if (currentStep === "register") {
      return (
        <>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              required
              value={name}
              onChange={handleNameChange}
              className={`mt-1 h-10 sm:h-12 text-base ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={handleEmailChange}
              className={`mt-1 h-10 sm:h-12 text-base ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={handlePasswordChange}
              className={`mt-1 h-10 sm:h-12 text-base ${errors.password ? "border-red-500" : ""}`}
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., 9876543210"
              required
              value={phone}
              onChange={handlePhoneChange}
              className={`mt-1 h-10 sm:h-12 text-base ${errors.phone ? "border-red-500" : ""}`}
            />
            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 btn-responsive"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </>
      );
    } else if (currentStep === "login") {
      return (
        <>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={handleEmailChange}
              className={`mt-1 h-10 sm:h-12 text-base ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={handlePasswordChange}
              className={`mt-1 h-10 sm:h-12 text-base ${errors.password ? "border-red-500" : ""}`}
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 btn-responsive"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </>
      );
    } else if (currentStep === "verifyOtp") {
      return (
        <>
          <CardDescription className="text-responsive-sm mb-4 text-center">
            We have sent a 6-digit OTP to your email <strong>{emailForOtp}</strong>. Please enter it below.
          </CardDescription>
          <div>
            <Label htmlFor="otp-0">OTP</Label>
            <div className="flex gap-2 justify-center mt-1">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index] || ""}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    ref={(el) => (otpInputs.current[index] = el)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 text-base text-center ${
                      errors.otp ? "border-red-500" : ""
                    }`}
                    required
                  />
                ))}
            </div>
            {errors.otp && <p className="text-sm text-red-500 mt-2 text-center">{errors.otp}</p>}
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 btn-responsive mt-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
          <div className="mt-6 text-center text-responsive-sm">
            {canResendOtp ? (
              <>
                Didn't receive OTP?{" "}
                <Button
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="p-0 h-auto text-emerald-700 hover:text-emerald-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    "Resend"
                  )}
                </Button>
              </>
            ) : (
              <p>Please wait {resendCountdown} seconds to resend.</p>
            )}
          </div>
        </>
      );
    }
    return null;
  };

  const getCardTitle = () => {
    if (currentStep === "register") return "Create New Account";
    if (currentStep === "login") return "Welcome Back";
    if (currentStep === "verifyOtp") return "Verify Your Email";
    return "";
  };

  const getCardDescription = () => {
    if (currentStep === "register") return "Enter your details to get started";
    if (currentStep === "login") return "Sign in to your account";
    if (currentStep === "verifyOtp") return "Please enter the OTP to proceed.";
    return "";
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
        
        <span className="ml-2 text-lg text-emerald-700">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 animate-fade-in">
      <Card className="w-full max-w-md animate-slide-up">
        <CardHeader className="text-center">
          <CardTitle className="text-responsive-2xl">{getCardTitle()}</CardTitle>
          <CardDescription className="text-responsive-sm">{getCardDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {renderFormContent()}
            {/* Add forgot password link for login step only */}
            {currentStep === "login" && (
              <div className="mt-4 text-center">
                <a
                  href="/forgotpassword"
                  className="text-emerald-700 hover:text-emerald-800 text-sm underline"
                >
                  Forgot password?
                </a>
              </div>
            )}
          </form>
          {currentStep !== "verifyOtp" && (
            <div className="mt-6 text-center text-responsive-sm">
              {currentStep === "register" ? (
                <>
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    onClick={() => setCurrentStep("login")}
                    className="p-0 h-auto text-emerald-700 hover:text-emerald-800"
                  >
                    Login
                  </Button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    onClick={() => setCurrentStep("register")}
                    className="p-0 h-auto text-emerald-700 hover:text-emerald-800"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}