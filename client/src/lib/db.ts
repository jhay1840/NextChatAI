import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BusinessProfile, InsertBusinessProfile } from "@shared/schema";

export function useBusinessProfiles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all business profiles for current user
  const { 
    data: profiles = [], 
    isLoading, 
    isError 
  } = useQuery<BusinessProfile[]>({
    queryKey: ["/api/business-profiles"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Check if user can create a profile (free users are limited to 1)
  const { data: canCreateStatus } = useQuery<{ canCreate: boolean }>({
    queryKey: ["/api/business-profiles/can-create"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const canCreateProfile = canCreateStatus?.canCreate ?? true;

  // Create a new business profile
  const createProfile = useMutation({
    mutationFn: async (profileData: InsertBusinessProfile) => {
      const res = await apiRequest("POST", "/api/business-profiles", profileData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profiles"] });
      toast({
        title: "Profile Created",
        description: "Your business profile has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Profile Creation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Get a specific business profile
  const getProfile = async (id: string): Promise<BusinessProfile | null> => {
    try {
      const res = await fetch(`/api/business-profiles/${id}`, {
        credentials: "include"
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }
      
      return await res.json();
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  // Update a business profile
  const updateProfile = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBusinessProfile> }) => {
      const res = await apiRequest("PUT", `/api/business-profiles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profiles"] });
      toast({
        title: "Profile Updated",
        description: "Your business profile has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Profile Update Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Delete a business profile
  const deleteProfile = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/business-profiles/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profiles"] });
      toast({
        title: "Profile Deleted",
        description: "Your business profile has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Profile Deletion Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  return {
    profiles,
    isLoading,
    isError,
    canCreateProfile,
    createProfile,
    getProfile,
    updateProfile,
    deleteProfile
  };
}
