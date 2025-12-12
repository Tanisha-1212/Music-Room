import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

export const setUpPassport = () => {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // User exists, return user
            return done(null, user);
          }

          // Create new user
          const username = profile.emails[0].value.split('@')[0] + '_' + Math.random().toString(36).substring(7);
          
          user = await User.create({
            username,
            email: profile.emails[0].value,
            password: Math.random().toString(36).slice(-8) + 'Aa1!', // Random password (won't be used)
            avatar: profile.photos[0]?.value || 'https://ui-avatars.com/api/?background=random',
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};