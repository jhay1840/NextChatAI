import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, LoginCredentials, ResetPasswordRequest } from "@shared/schema";

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Get the current user
  const { 
    data: user, 
    isLoading, 
    isError 
  } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  // Check if user is authenticated
  const isAuthenticated = Boolean(user);

  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data);
      // Determine where to redirect based on business profile setup
      checkProfileSetup(data);
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive"
      });
    }
  });

  // Register mutation
  const register = useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data);
      // After registration, take user to profile setup
      setLocation("/profile-setup");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive"
      });
    }
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout", {});
      return res.json();
    },
    onSuccess: () => {
      // Clear user data and redirect to login
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries();
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Logout Failed",
        description: error.message || "An error occurred during logout.",
        variant: "destructive"
      });
    }
  });

  // Reset password mutation
  const resetPassword = useMutation({
    mutationFn: async (resetData: ResetPasswordRequest) => {
      const res = await apiRequest("POST", "/api/auth/reset-password", resetData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Email Sent",
        description: "If your email is registered, you will receive password reset instructions."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Password Reset Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Google OAuth login
  const googleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  // Facebook OAuth login
  const facebookLogin = () => {
    window.location.href = "/api/auth/facebook";
  };

  // Check if user has set up a business profile
  const checkProfileSetup = async (userData: User) => {
    try {
      const res = await fetch("/api/business-profiles");
      const profiles = await res.json();
      
      if (profiles.length === 0) {
        // No profiles yet, take user to setup flow
        setLocation("/profile-setup");
      } else {
        // User has profiles, take them to dashboard
        setLocation("/dashboard");
      }
    } catch (error) {
      // On error, assume no profiles and go to setup
      setLocation("/profile-setup");
    }
  };

  return {
    user,
    isLoading,
    isError,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
    googleLogin,
    facebookLogin
  };
}

// Define custom query function
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = ({ on401 }: { on401: UnauthorizedBehavior }) => {
  return async ({ queryKey }: { queryKey: string[] }): Promise<any> => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include"
    });

    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }

    return res.json();
  };
};
