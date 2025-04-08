import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBusinessProfileSchema } from "@shared/schema";
import { useBusinessProfiles } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ProfileLimitModal } from "./profile-limit-modal";
import { BasicInfoStep } from "./basic-info-step";
import { SocialMediaStep } from "./social-media-step";
import { TargetAudienceStep } from "./target-audience-step";
import type { InsertBusinessProfile } from "@shared/schema";

export function ProfileSetupForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { createProfile, canCreateProfile } = useBusinessProfiles();
  const [, setLocation] = useLocation();

  const form = useForm<InsertBusinessProfile>({
    resolver: zodResolver(insertBusinessProfileSchema),
    defaultValues: {
      business_name: "",
      profile_picture_url: "",
      industry: "",
      facebook_page_url: "",
      twitter_handle: "",
      instagram_handle: "",
      linkedin_page_url: "",
      target_audience_description: "",
      target_audience_keywords: "",
    },
  });

  const steps = [
    { title: "Basic Info", icon: "building" },
    { title: "Social Media", icon: "hashtag" },
    { title: "Audience", icon: "users" },
  ];

  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    let isValid = false;
    
    // Validate current step fields
    if (currentStep === 0) {
      isValid = await form.trigger(["business_name", "industry"]);
    } else if (currentStep === 2) {
      isValid = await form.trigger(["target_audience_description", "target_audience_keywords"]);
    } else {
      isValid = true; // Social media step is optional
    }

    if (!isValid) return;

    // If it's the last step, submit the form
    if (isLastStep) {
      const valid = await form.trigger();
      if (valid) {
        if (!canCreateProfile) {
          setShowLimitModal(true);
          return;
        }
        try {
          await createProfile.mutateAsync(form.getValues());
          setLocation("/dashboard");
        } catch (error) {
          console.error("Profile creation error:", error);
        }
      }
    } else {
      // Otherwise move to the next step
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const onSubmit = async (data: InsertBusinessProfile) => {
    if (!canCreateProfile) {
      setShowLimitModal(true);
      return;
    }

    try {
      await createProfile.mutateAsync(data);
      // Redirect to dashboard after successful submission
      setLocation("/dashboard");
    } catch (error) {
      console.error("Profile creation error:", error);
      // Error is handled by the mutation
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="step-indicator flex flex-col items-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full mb-2 ${
                  index <= currentStep 
                    ? "bg-primary text-white" 
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {index === 0 && <i className="fas fa-building"></i>}
                  {index === 1 && <i className="fas fa-hashtag"></i>}
                  {index === 2 && <i className="fas fa-users"></i>}
                </div>
                <span className={`text-xs font-medium ${
                  index <= currentStep ? "" : "text-gray-500"
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="h-1 flex-1 bg-gray-200 mx-2">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: index < currentStep ? "100%" : "0%" }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {currentStep === 0 && (
            <BasicInfoStep control={form.control} />
          )}

          {currentStep === 1 && (
            <SocialMediaStep control={form.control} />
          )}

          {currentStep === 2 && (
            <TargetAudienceStep control={form.control} />
          )}

          <div className="flex justify-between pt-4 border-t border-gray-200 mt-8">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}

            <div className="ml-auto">
              <Button
                type="submit"
                onClick={() => handleNext()}
                disabled={createProfile.isPending}
                className="flex items-center"
              >
                {isLastStep ? (
                  createProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <ProfileLimitModal 
        isOpen={showLimitModal} 
        onClose={() => setShowLimitModal(false)}
        onUpgrade={() => {
          // Handle upgrade flow - redirect to pricing page or similar
          setShowLimitModal(false);
        }}
      />
    </>
  );
}