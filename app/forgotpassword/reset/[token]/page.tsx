"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage({ params }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // Unwrap params if it's a Promise (for future Next.js compatibility)
  const { token } = use(params);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/forgotpassword/reset/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (err) {
      setMessage("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 animate-fade-in"
      style={{
        background: "linear-gradient(135deg, #DCD7C9 0%, #A27B5C 100%)"
      }}
    >
      <Card className="w-full max-w-md animate-slide-up">
        <CardHeader className="text-center">
          <CardTitle className="text-responsive-2xl">Reset Password</CardTitle>
          <CardDescription className="text-responsive-sm">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1 h-10 sm:h-12 text-base"
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 h-10 sm:h-12 text-base"
            />
            <Button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 btn-responsive"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
          {message && <p className="mt-4 text-center text-sm">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
