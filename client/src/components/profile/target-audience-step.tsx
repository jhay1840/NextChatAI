import { useState } from "react";
import { Control } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { InsertBusinessProfile } from "@shared/schema";

interface TargetAudienceStepProps {
  control: Control<InsertBusinessProfile>;
}

export function TargetAudienceStep({ control }: TargetAudienceStepProps) {
  const [tags, setTags] = useState<string[]>([]);
  
  // Function to extract tags from comma-separated string
  const handleTagsChange = (value: string) => {
    if (value) {
      const tagArray = value.split(',').map(tag => tag.trim()).filter(Boolean);
      setTags(tagArray);
    } else {
      setTags([]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Target Audience</h2>
      <p className="text-gray-600 mb-6">
        Tell us about your audience to help us optimize your content
      </p>
      
      {/* Target Audience Description */}
      <FormField
        control={control}
        name="target_audience_description"
        render={({ field }) => (
          <FormItem className="mb-6">
            <FormLabel className="text-gray-700">
              Audience Description <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your target audience (age range, interests, demographics, etc.)"
                rows={4}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Target Audience Keywords */}
      <FormField
        control={control}
        name="target_audience_keywords"
        render={({ field }) => (
          <FormItem className="mb-6">
            <FormLabel className="text-gray-700">
              Audience Keywords <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="marketing, technology, fitness, etc."
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  handleTagsChange(e.target.value);
                }}
              />
            </FormControl>
            <FormDescription className="text-xs text-gray-500 mt-1">
              Enter keywords separated by commas
            </FormDescription>
            
            {/* Display tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-200">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
