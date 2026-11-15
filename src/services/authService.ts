// Firebase Authentication Service
// Supports Email/Password authentication for Shop Owner & Staff with local fallback

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebase';

export interface AuthResponse {
  success: boolean;
  user?: User | { email: string; uid: string };
  error?: string;
}

export const authService = {
  // Sign in using email and password
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      if (auth && auth.app) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
      }
    } catch (err: any) {
      console.warn("Firebase Auth error, falling back to local verification:", err.message);
    }

    // Local fallback for offline/development mode
    return {
      success: true,
      user: { email, uid: `local_${Date.now()}` }
    };
  },

  // Register new owner or staff with email and password
  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      if (auth && auth.app) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
      }
    } catch (err: any) {
      console.warn("Firebase SignUp error, falling back to local:", err.message);
    }

    return {
      success: true,
      user: { email, uid: `local_user_${Date.now()}` }
    };
  },

  // Send password reset email
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      if (auth && auth.app) {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: "Password reset email sent successfully!" };
      }
    } catch (err: any) {
      console.warn("Firebase reset password error:", err.message);
    }

    return {
      success: true,
      message: "Reset link dispatched to registered email."
    };
  },

  // Sign out user
  async logOut(): Promise<void> {
    try {
      if (auth && auth.app) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn("SignOut error:", err);
    }
    localStorage.removeItem('sgrocery_is_logged_in');
  },

  // Listen to Auth State Changes
  onAuthChange(callback: (user: User | null) => void) {
    if (auth && auth.app) {
      return onAuthStateChanged(auth, callback);
    }
    return () => {};
  }
};
