import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaGoogle, FaFacebook, FaSignInAlt } from "react-icons/fa";
import type { LoginCredentials } from "@shared/schema";

interface LoginFormProps {
  onForgotPassword: () => void;
  onSignUp: () => void;
}

export function LoginForm({ onForgotPassword, onSignUp }: LoginFormProps) {
  const { login, googleLogin, facebookLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    setError(null);
    try {
      await login.mutateAsync(data);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register("email")}
            className={`w-full ${errors.email ? "border-red-500" : ""}`}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </Label>
            <Button
              type="button"
              variant="link"
              className="text-sm font-medium text-primary p-0 h-auto"
              onClick={onForgotPassword}
            >
              Forgot password?
            </Button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className={`w-full ${errors.password ? "border-red-500" : ""}`}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <div className="flex items-center mb-6">
          <Checkbox
            id="remember"
            {...register("remember")}
            className="h-4 w-4 text-primary border-gray-300 rounded"
          />
          <Label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
            Remember me
          </Label>
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      
      <div className="relative flex items-center mt-6 mb-5">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-600 text-sm">or continue with</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={googleLogin}
          className="flex items-center justify-center"
        >
          <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={facebookLogin}
          className="flex items-center justify-center"
        >
          <FaFacebook className="mr-2 h-4 w-4 text-blue-600" />
          Facebook
        </Button>
      </div>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Don't have an account?</span>
        <Button 
          variant="link" 
          className="font-medium text-primary p-0 h-auto ml-1" 
          onClick={onSignUp}
        >
          Sign up
        </Button>
      </div>
    </div>
  );
}
