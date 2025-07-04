// src/components/auth-provider.tsx
"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

// Axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role?: "user" | "admin";
  emailVerified: boolean;
  createdAt?: string;
}

interface AuthContextType {
  state: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  };
  login: (
    email: string,
    password: string
  ) => Promise<User | { requiresOtpVerification: boolean; userId: string; email: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string
  ) => Promise<{ success: boolean; message: string; userId?: string; email?: string }>;
  verifyOtp: (userId: string, otp: string) => Promise<User>;
  resendOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  getProfileDetails: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextType["state"]>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const router = useRouter();

  const getProfileDetails = useCallback(async () => {
    setState((prevState) => ({ ...prevState, isLoading: true }));
    try {
      const config = {
        headers: {
          "X-Debug-Request": "ProfileFetch",
        },
        withCredentials: true,
      };
      console.log("Sending profile request with config:", config);
      const response = await axios.get("/api/users/profile", config);

      console.log("Profile fetch response:", {
        data: response.data,
        headers: response.headers,
      });

      if (response.data.success && response.data.user) {
        setState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return response.data.user;
      } else {
        console.warn("Profile fetch succeeded but no user data:", response.data);
        setState({ user: null, isAuthenticated: false, isLoading: false });
        return null;
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setState({ user: null, isAuthenticated: false, isLoading: false });
        } else {
          toast({
            title: "Profile Loading Failed",
            description: error.response?.data?.message || "An error occurred while fetching profile.",
            variant: "error",
          });
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        console.error("Unexpected error fetching profile:", error);
        toast({
          title: "Profile Loading Failed",
          description: "An unexpected error occurred.",
          variant: "error",
        });
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
      return null;
    }
  }, []);

  useEffect(() => {
    let retries = 3;
    const attemptProfileFetch = async () => {
      while (retries > 0) {
        try {
          await getProfileDetails();
          break;
        } catch (error) {
          retries--;
          console.warn(`Profile fetch retry ${4 - retries} failed`);
          if (retries === 0) {
            console.error("All profile fetch retries failed");
            setState({ user: null, isAuthenticated: false, isLoading: false });
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    };
    attemptProfileFetch();
  }, [getProfileDetails]);

  const login = useCallback(async (email: string, password: string) => {
    setState((prevState) => ({ ...prevState, isLoading: true }));
    try {
      const config = { headers: { "Content-Type": "application/json" }, withCredentials: true };
      console.log("Sending login request with config:", config);
      const response = await axios.post("/api/auth/login", { email, password }, config);

      console.log("Login response:", response.data);

      if (response.data.success && response.data.user) {
        const loggedInUser: User = response.data.user;
        setState({
          user: loggedInUser,
          isAuthenticated: true,
          isLoading: false,
        });
        toast({ title: "Login Successful!", description: response.data.message || "Welcome back!" });
        return loggedInUser;
      } else if (response.data.requiresOtpVerification) {
        setState((prevState) => ({ ...prevState, isLoading: false }));
        toast({ title: "Email Not Verified", description: response.data.message });
        return {
          requiresOtpVerification: true,
          userId: response.data.userId,
          email: response.data.email,
        };
      } else {
        throw new Error(response.data.message || "Invalid email or password.");
      }
    } catch (error: any) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      if (error.response?.data?.requiresOtpVerification) {
        toast({ title: "Email Not Verified", description: error.response.data.message });
        return {
          requiresOtpVerification: true,
          userId: error.response.data.userId,
          email: error.response.data.email,
        };
      }
      console.error("Login error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || "Login failed, please try again.");
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone: string) => {
    setState((prevState) => ({ ...prevState, isLoading: true }));
    try {
      const config = { headers: { "Content-Type": "application/json" }, withCredentials: true };
      console.log("Sending register request with config:", config);
      const response = await axios.post("/api/auth/register", { name, email, password, phone }, config);

      console.log("Register response:", response.data);

      if (response.data.success) {
        toast({ title: "Registration Status", description: response.data.message });
        setState((prevState) => ({ ...prevState, isLoading: false }));
        return {
          success: true,
          message: response.data.message,
          userId: response.data.userId,
          email: response.data.email,
        };
      } else {
        throw new Error(response.data.message || "Registration failed.");
      }
    } catch (error: any) {
      setState((prevState) => ({ ...prevState, isLoading: false }));
      console.error("Register error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || "Registration failed, please try again.");
    }
  }, []);

  const verifyOtp = useCallback(async (userId: string, otp: string) => {
    setState((prevState) => ({ ...prevState, isLoading: true }));
    try {
      const config = { headers: { "Content-Type": "application/json" }, withCredentials: true };
      console.log("Sending verify-otp request with config:", config);
      const response = await axios.post("/api/auth/verify-otp", { userId, otp }, config);

      console.log("Verify OTP response:", response.data);

      if (response.data.success && response.data.user) {
        const verifiedUser: User = response.data.user;
        setState({
          user: verifiedUser,
          isAuthenticated: true,
          isLoading: false,
        });
        toast({
          title: "Verification Successful!",
          description: response.data.message || "Your email has been successfully verified!",
        });
        return verifiedUser;
      } else {
        throw new Error(response.data.message || "OTP verification failed.");
      }
    } catch (error: any) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      console.error("Verify OTP error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || "OTP verification failed, please try again.");
    }
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    setState((prevState) => ({ ...prevState, isLoading: true }));
    try {
      const config = { headers: { "Content-Type": "application/json" }, withCredentials: true };
      console.log("Sending resend-otp request with config:", config);
      const response = await axios.post("/api/auth/resend-otp", { email }, config);

      console.log("Resend OTP response:", response.data);

      if (response.data.success) {
        toast({ title: "OTP Sent", description: response.data.message });
        setState((prevState) => ({ ...prevState, isLoading: false }));
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || "Failed to resend OTP.");
      }
    } catch (error: any) {
      setState((prevState) => ({ ...prevState, isLoading: false }));
      console.error("Resend OTP error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.message || "Failed to resend OTP, please try again.");
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prevState) => ({ ...prevState, isLoading: true }));
    try {
      const config = { headers: { "Content-Type": "application/json" }, withCredentials: true };
      console.log("Sending logout request with config:", config);
      await axios.post("/api/auth/logout", {}, config);
      setState({ user: null, isAuthenticated: false, isLoading: false });
      toast({
        title: "Logout",
        description: "You have successfully logged out.",
      });
      router.push("/login");
    } catch (error: any) {
      console.error("Logout error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
      });
      toast({
        title: "Logout Failed",
        description: error.response?.data?.message || "An error occurred during logout.",
        variant: "error",
      });
      setState({ user: null, isAuthenticated: false, isLoading: false });
      router.push("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ state, login, register, verifyOtp, resendOtp, logout, getProfileDetails }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}