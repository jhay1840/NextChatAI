import { Control } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaPlusCircle
} from "react-icons/fa";
import type { InsertBusinessProfile } from "@shared/schema";

interface SocialMediaStepProps {
  control: Control<InsertBusinessProfile>;
}

export function SocialMediaStep({ control }: SocialMediaStepProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Social Media Handles</h2>
      <p className="text-gray-600 mb-6">Connect your social media accounts to automate posting</p>
      
      {/* Facebook */}
      <FormField
        control={control}
        name="facebook_page_url"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel className="flex items-center text-gray-700">
              <FaFacebook className="text-[#1877F2] mr-2" />
              Facebook Page URL
            </FormLabel>
            <FormControl>
              <Input
                placeholder="https://facebook.com/yourbusiness"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Twitter */}
      <FormField
        control={control}
        name="twitter_handle"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel className="flex items-center text-gray-700">
              <FaTwitter className="text-[#1DA1F2] mr-2" />
              Twitter Handle
            </FormLabel>
            <FormControl>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  @
                </span>
                <Input
                  className="rounded-l-none"
                  placeholder="username"
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Instagram */}
      <FormField
        control={control}
        name="instagram_handle"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel className="flex items-center text-gray-700">
              <FaInstagram className="text-[#E1306C] mr-2" />
              Instagram Handle
            </FormLabel>
            <FormControl>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  @
                </span>
                <Input
                  className="rounded-l-none"
                  placeholder="username"
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* LinkedIn */}
      <FormField
        control={control}
        name="linkedin_page_url"
        render={({ field }) => (
          <FormItem className="mb-6">
            <FormLabel className="flex items-center text-gray-700">
              <FaLinkedin className="text-[#0A66C2] mr-2" />
              LinkedIn Page URL
            </FormLabel>
            <FormControl>
              <Input
                placeholder="https://linkedin.com/company/yourbusiness"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Add More Social Media Button */}
      <Button
        type="button"
        variant="ghost"
        className="text-primary hover:text-primary-600 font-medium text-sm flex items-center p-0 h-auto"
      >
        <FaPlusCircle className="mr-2" />
        Add another social platform
      </Button>
    </div>
  );
}
