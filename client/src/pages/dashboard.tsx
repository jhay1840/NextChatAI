import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useBusinessProfiles } from "@/lib/db";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, LogOut, Plus, Settings, Calendar, Users, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { profiles, isLoading: profilesLoading, canCreateProfile } = useBusinessProfiles();
  const [, setLocation] = useLocation();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Redirect if no profiles are set up yet
  useEffect(() => {
    if (!profilesLoading && profiles && profiles.length === 0) {
      setLocation("/profile-setup");
    }
  }, [profilesLoading, profiles, setLocation]);

  // Show loading state or redirect state
  if (authLoading || profilesLoading || !isAuthenticated || !profiles) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only get current profile if profiles exist and have items
  const currentProfile = profiles && profiles.length > 0 ? profiles[0] : null;

  // If no profile exists, show a message
  if (!currentProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
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
            </div>
          </div>
        </header>
        <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Business Profile Found</h2>
            <p className="text-gray-600 mb-4">Please set up your business profile to continue</p>
            <Button onClick={() => setLocation("/profile-setup")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Business Profile
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email}
              </span>
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
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard: {currentProfile.business_name}
          </h1>
          
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            {canCreateProfile && (
              <Button size="sm" onClick={() => setLocation("/profile-setup")}>
                <Plus className="h-4 w-4 mr-2" />
                New Profile
              </Button>
            )}
          </div>
        </div>
        
        {/* Dashboard placeholder content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Upcoming Posts
              </CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-gray-500">No posts scheduled yet</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Audience Reach
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-gray-500">Connect your accounts to see metrics</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Engagement Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-gray-500">Publish content to see engagement</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Call to Action */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Ready to automate your social media?
            </h2>
            <p className="mb-4 text-gray-600">
              Set up your first post campaign to start reaching your audience
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
