import { useState, useRef } from "react";
import { Control } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { User } from "lucide-react";
import type { InsertBusinessProfile } from "@shared/schema";

interface BasicInfoStepProps {
  control: Control<InsertBusinessProfile>;
}

export function BasicInfoStep({ control }: BasicInfoStepProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const industries = [
    { value: "retail", label: "Retail & E-commerce" },
    { value: "food", label: "Food & Beverage" },
    { value: "tech", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance & Banking" },
    { value: "education", label: "Education" },
    { value: "travel", label: "Travel & Hospitality" },
    { value: "entertainment", label: "Entertainment & Media" },
    { value: "fitness", label: "Fitness & Wellness" },
    { value: "real-estate", label: "Real Estate" },
    { value: "other", label: "Other" }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Preview the selected image
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // In a real app, you'd upload the file to storage and set the URL in the form
      // For this demo, we'll just store the file data URL
      
      // Set the URL in the form
      // setValue("profile_picture_url", url); // This would be set after upload
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
      
      {/* Business Name */}
      <FormField
        control={control}
        name="business_name"
        render={({ field }) => (
          <FormItem className="mb-6">
            <FormLabel className="text-gray-700">
              Business Name <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Your Business Name"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Profile Picture Upload */}
      <div className="mb-6">
        <FormLabel className="text-gray-700 block mb-1">Profile Picture</FormLabel>
        <div className="flex items-center space-x-6">
          <div className="shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border border-gray-300 overflow-hidden">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-gray-400" />
              )}
            </div>
          </div>
          
          <div className="block">
            <input
              type="file"
              id="profile-picture"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
              accept="image/*"
            />
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
          </div>
        </div>
      </div>
      
      {/* Industry Dropdown */}
      <FormField
        control={control}
        name="industry"
        render={({ field }) => (
          <FormItem className="mb-6">
            <FormLabel className="text-gray-700">
              Industry <span className="text-red-500">*</span>
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
