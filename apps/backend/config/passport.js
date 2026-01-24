// backend/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('🔌 Configuring Passport Google Strategy...');

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ Google OAuth credentials are missing!');
  console.error('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
} else {
  console.log('✅ Google OAuth credentials found');
  
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google profile received:', profile.emails[0].value);

          // Check if user exists with Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log('Existing Google user found:', user.email);
            return done(null, user);
          }

          // Check if user exists with email
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            if (!user.avatar || user.avatar.includes('ui-avatars')) {
              user.avatar = profile.photos?.[0]?.value;
            }
            await user.save();
            console.log('Linked Google to existing user:', user.email);
            return done(null, user);
          }

          // Create new user
          const baseUsername = profile.displayName
            ?.replace(/\s+/g, '_')
            .toLowerCase() 
            || profile.emails[0].value.split('@')[0];

          // Ensure unique username
          let username = baseUsername;
          let counter = 1;
          while (await User.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          user = await User.create({
            googleId: profile.id,
            username,
            email: profile.emails[0].value,
            password: Math.random().toString(36).slice(-16) + 'Aa1!', // Random secure password
            avatar: profile.photos?.[0]?.value || 'https://ui-avatars.com/api/?background=random',
            isOnline: true,
          });

          console.log('New Google user created:', user.email);
          return done(null, user);
        } catch (error) {
          console.error('Google strategy error:', error);
          return done(error, null);
        }
      }
    )
  );

  console.log('✅ Google Strategy configured');
}

// Serialize user (for session - optional since you're using JWT)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user (for session - optional since you're using JWT)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;