import { useEffect } from "react";
import { ProfileSetupForm } from "@/components/profile/profile-setup-form";
import { useAuth } from "@/lib/auth";
import { useBusinessProfiles } from "@/lib/db";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Layers, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSetupPage() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { profiles, isLoading: profilesLoading } = useBusinessProfiles();
  const [, setLocation] = useLocation();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Redirect if user already has profiles and they're loaded
  useEffect(() => {
    if (!profilesLoading && profiles && profiles.length > 0) {
      setLocation("/dashboard");
    }
  }, [profilesLoading, profiles, setLocation]);

  // Show loading state if we're checking auth or profiles
  if (authLoading || profilesLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </header>
        
        <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto mt-2" />
          </div>
          
          <Skeleton className="h-96 w-full rounded-lg" />
        </main>
      </div>
    );
  }

  // If not authenticated, return empty (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
                  <Layers className="h-5 w-5" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">PostPilot AI</span>
              </div>
            </div>
            <div>
              <Button 
                variant="ghost" 
                onClick={() => logout.mutate()}
                className="text-gray-600 hover:text-primary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Set Up Your Business Profile</h1>
          <p className="mt-2 text-gray-600">
            Tell us about your business to help us personalize your experience
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <ProfileSetupForm />
        </div>
      </main>
    </div>
  );
}
