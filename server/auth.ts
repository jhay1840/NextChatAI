import { compare, hash } from "bcrypt";
import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";

// Configure local strategy for passport
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        // Skip password check for OAuth users who don't have a password
        if (!user.password && (user.google_id || user.facebook_id)) {
          return done(null, false, { 
            message: "This account uses social login. Please sign in with Google or Facebook." 
          });
        }
        
        if (!user.password || !(await compare(password, user.password))) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

// Auth middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Initialize passport middleware for Express
export function setupAuth(app: any) {
  app.use(passport.initialize());
  app.use(passport.session());
}

export default passport;
