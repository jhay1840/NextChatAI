import { 
  User, InsertUser, 
  BusinessProfile, InsertBusinessProfile,
  users, businessProfiles 
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByFacebookId(facebookId: string): Promise<User | undefined>;
  
  // Business profile operations
  getBusinessProfiles(userId: string): Promise<BusinessProfile[]>;
  getBusinessProfile(id: string): Promise<BusinessProfile | undefined>;
  createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile>;
  updateBusinessProfile(id: string, profile: Partial<InsertBusinessProfile>): Promise<BusinessProfile | undefined>;
  deleteBusinessProfile(id: string): Promise<boolean>;
  
  // Custom operations
  countBusinessProfiles(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.google_id, googleId));
    return user;
  }

  async getUserByFacebookId(facebookId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.facebook_id, facebookId));
    return user;
  }

  // Business profile operations
  async getBusinessProfiles(userId: string): Promise<BusinessProfile[]> {
    return db.select().from(businessProfiles).where(eq(businessProfiles.user_id, userId));
  }

  async getBusinessProfile(id: string): Promise<BusinessProfile | undefined> {
    const [profile] = await db.select().from(businessProfiles).where(eq(businessProfiles.id, id));
    return profile;
  }

  async createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile> {
    const [newProfile] = await db.insert(businessProfiles).values(profile).returning();
    return newProfile;
  }

  async updateBusinessProfile(
    id: string, 
    profile: Partial<InsertBusinessProfile>
  ): Promise<BusinessProfile | undefined> {
    const [updatedProfile] = await db
      .update(businessProfiles)
      .set({ ...profile, updated_at: new Date() })
      .where(eq(businessProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  async deleteBusinessProfile(id: string): Promise<boolean> {
    const [deletedProfile] = await db
      .delete(businessProfiles)
      .where(eq(businessProfiles.id, id))
      .returning();
    return !!deletedProfile;
  }

  // Custom operations
  async countBusinessProfiles(userId: string): Promise<number> {
    const profiles = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.user_id, userId));
    return profiles.length;
  }
}

export const storage = new DatabaseStorage();
