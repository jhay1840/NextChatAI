import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import type { InsertUser } from "@shared/schema";

interface RegisterFormProps {
  onBackToLogin: () => void;
}

export function RegisterForm({ onBackToLogin }: RegisterFormProps) {
  const { register: registerMutation } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Extend the schema to add password confirmation
  const registerSchema = insertUserSchema.extend({
    passwordConfirm: insertUserSchema.shape.password,
  }).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  });

  type RegisterFormValues = InsertUser & { passwordConfirm: string };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      user_type: "free",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    try {
      // Remove passwordConfirm field before sending to server
      const { passwordConfirm, ...userData } = data;
      await registerMutation.mutateAsync(userData);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="p-0 h-8 w-8 mr-2"
          onClick={onBackToLogin}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
      </div>
      
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
          <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </Label>
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
        
        <div className="mb-6">
          <Label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </Label>
          <Input
            id="passwordConfirm"
            type="password"
            placeholder="••••••••"
            {...register("passwordConfirm")}
            className={`w-full ${errors.passwordConfirm ? "border-red-500" : ""}`}
          />
          {errors.passwordConfirm && (
            <p className="text-sm text-red-500 mt-1">{errors.passwordConfirm.message}</p>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Already have an account?</span>
        <Button 
          variant="link" 
          className="font-medium text-primary p-0 h-auto ml-1"
          onClick={onBackToLogin}
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}