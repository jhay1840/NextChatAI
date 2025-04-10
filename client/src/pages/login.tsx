import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent } from "@/components/ui/card";
import { Layers } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-pattern">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white mb-4">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PostPilot AI</h1>
          <p className="text-gray-600 mt-2">Automate Your Social Media Presence</p>
        </div>

        {/* Login/Register/Forgot Password Card */}
        <Card className="shadow-lg">
          <CardContent className="p-6 md:p-8">
            {showForgotPassword ? (
              <ForgotPasswordForm 
                onBackToLogin={() => setShowForgotPassword(false)} 
              />
            ) : showRegister ? (
              <RegisterForm 
                onBackToLogin={() => setShowRegister(false)} 
              />
            ) : (
              <LoginForm 
                onForgotPassword={() => setShowForgotPassword(true)}
                onSignUp={() => setShowRegister(true)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}