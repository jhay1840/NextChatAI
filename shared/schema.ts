import { pgTable, text, serial, uuid, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user types
export const UserType = {
  FREE: "free",
  STARTER: "starter",
  PRO: "pro"
} as const;

// Users table schema
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"),
  user_type: text("user_type").notNull().default(UserType.FREE),
  google_id: text("google_id"),
  facebook_id: text("facebook_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});

// Business profiles table schema
export const businessProfiles = pgTable("business_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  business_name: text("business_name").notNull(),
  profile_picture_url: text("profile_picture_url"),
  industry: text("industry").notNull(),
  facebook_page_url: text("facebook_page_url"),
  twitter_handle: text("twitter_handle"),
  instagram_handle: text("instagram_handle"),
  linkedin_page_url: text("linkedin_page_url"),
  target_audience_description: text("target_audience_description"),
  target_audience_keywords: text("target_audience_keywords"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});

// User schema for insertion
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  user_type: z.enum([UserType.FREE, UserType.STARTER, UserType.PRO]).default(UserType.FREE),
  google_id: z.string().optional(),
  facebook_id: z.string().optional(),
}).omit({ id: true, created_at: true, updated_at: true });

// Business profile schema for insertion
export const insertBusinessProfileSchema = createInsertSchema(businessProfiles, {
  business_name: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry selection is required"),
  target_audience_description: z.string().min(10, "Please provide a description of at least 10 characters"),
  target_audience_keywords: z.string().min(1, "Please add at least one keyword"),
}).omit({ id: true, created_at: true, updated_at: true });

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional()
});

// Password reset schema
export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email")
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
