import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import type { ResetPasswordRequest } from "@shared/schema";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordRequest) => {
    try {
      await resetPassword.mutateAsync(data);
      setSuccess(true);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        onClick={onBackToLogin}
        className="flex items-center text-gray-600 mb-4 hover:text-primary p-0 h-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Button>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Reset Password</h2>
      <p className="text-gray-600 mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200 text-green-600">
          <AlertDescription>
            Password reset link sent! Check your email.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <Label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </Label>
          <Input
            id="reset-email"
            type="email"
            placeholder="name@example.com"
            {...register("email")}
            error={errors.email?.message}
            className="w-full"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting || success}
          className="w-full"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </div>
  );
}
