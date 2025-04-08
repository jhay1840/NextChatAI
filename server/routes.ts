import express, { Request, Response, NextFunction, type Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";

const { Pool } = pg;
import { storage } from "./storage";
import passport, { isAuthenticated, hashPassword, setupAuth } from "./auth";
import { 
  loginSchema, 
  resetPasswordSchema, 
  insertUserSchema, 
  insertBusinessProfileSchema 
} from "@shared/schema";
import { UserType } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session store
  const PgSession = connectPgSimple(session);
  const pgPool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });

  // Session configuration
  app.use(
    session({
      store: new PgSession({
        pool: pgPool,
        tableName: "session",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "postpilot-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // Set up authentication
  setupAuth(app);

  // Authentication routes
  const authRouter = express.Router();

  // Register user
  authRouter.post("/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Hash password if provided
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      // Create user in database
      const newUser = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      // Log in the user
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login
  authRouter.post("/login", (req, res, next) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          return res.status(401).json({ message: info.message || "Authentication failed" });
        }
        
        req.login(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          return res.json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout
  authRouter.post("/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Current user
  authRouter.get("/me", isAuthenticated, (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // Password reset request
  authRouter.post("/reset-password", async (req, res) => {
    try {
      const { email } = resetPasswordSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security reasons, don't disclose if the email exists or not
        return res.json({ message: "If your email is registered, you will receive a password reset link" });
      }
      
      // In a real implementation, send an email with a reset token
      // For now, we'll just return success
      res.json({ message: "If your email is registered, you will receive a password reset link" });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Password reset request failed" });
    }
  });

  // Business profile routes
  const profileRouter = express.Router();

  // Create business profile
  profileRouter.post("/", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Check if user is on free plan and already has a profile
      if ((req.user as any).user_type === UserType.FREE) {
        const profileCount = await storage.countBusinessProfiles(userId);
        if (profileCount > 0) {
          return res.status(403).json({ 
            message: "Free accounts are limited to 1 business profile. Upgrade to add more." 
          });
        }
      }
      
      const profileData = insertBusinessProfileSchema.parse(req.body);
      
      // Add user_id to profile data
      const newProfile = await storage.createBusinessProfile({
        ...profileData,
        user_id: userId
      });
      
      res.status(201).json(newProfile);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create business profile" });
    }
  });

  // Get all business profiles for a user
  profileRouter.get("/", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const profiles = await storage.getBusinessProfiles(userId);
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business profiles" });
    }
  });

  // Check if user can create a new profile (for free users)
  profileRouter.get("/can-create", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = req.user as any;
      
      if (user.user_type === UserType.FREE) {
        const profileCount = await storage.countBusinessProfiles(userId);
        return res.json({ canCreate: profileCount === 0 });
      }
      
      // Starter and Pro users can create more profiles
      return res.json({ canCreate: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to check profile creation eligibility" });
    }
  });

  // Get a specific business profile
  profileRouter.get("/:id", isAuthenticated, async (req, res) => {
    try {
      const profile = await storage.getBusinessProfile(req.params.id);
      
      if (!profile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      // Check if profile belongs to the user
      if (profile.user_id !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business profile" });
    }
  });

  // Update a business profile
  profileRouter.put("/:id", isAuthenticated, async (req, res) => {
    try {
      // First check if profile exists and belongs to user
      const profile = await storage.getBusinessProfile(req.params.id);
      
      if (!profile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      if (profile.user_id !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Parse and validate the data
      const profileData = insertBusinessProfileSchema.partial().parse(req.body);
      
      // Update the profile
      const updatedProfile = await storage.updateBusinessProfile(
        req.params.id,
        profileData
      );
      
      res.json(updatedProfile);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update business profile" });
    }
  });

  // Delete a business profile
  profileRouter.delete("/:id", isAuthenticated, async (req, res) => {
    try {
      // First check if profile exists and belongs to user
      const profile = await storage.getBusinessProfile(req.params.id);
      
      if (!profile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      if (profile.user_id !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Delete the profile
      const success = await storage.deleteBusinessProfile(req.params.id);
      
      if (success) {
        return res.json({ message: "Business profile deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete business profile" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete business profile" });
    }
  });

  // Register routers with API prefix
  app.use("/api/auth", authRouter);
  app.use("/api/business-profiles", profileRouter);

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
