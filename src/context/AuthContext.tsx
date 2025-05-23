"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "./../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { EMPTY_USER, User } from "@/types/userTypes";
import emailjs from 'emailjs-com';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { NOTIFICATIONS } from "@/constants/notifications";
import router from "next/router";


interface AuthContextType {
  user: User | null;
  loading: boolean;
  
  role: string
  setRole: React.Dispatch<React.SetStateAction<string>>
  authenticated: boolean
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>

  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  verifyEmail: (user: User) => Promise<void>;
  sendWelcomeEmail: (email: string, password: string) => void;

  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>; // new
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>('user')
  const [authenticated, setAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      
      if (user) {
        // User is signed in, fetch user data from Firestore
        const accountRef = doc(db, "accounts", user.uid);
        getDoc(accountRef).then((accountSnap) => {
          if (accountSnap.exists()) {
            const accountData = accountSnap.data();
            setUser({
              ...EMPTY_USER,
              ...accountData,
              id: user.uid,
              email: user.email ?? "",
              role: accountData.role ?? "user",
              status: accountData.status ?? "active",
            });
            setAuthenticated(true);
            setRole(accountData.role || "user");
            console.log("User signed in and account fetched successfully.");
          } else {
            console.warn("No account document found for this user.");
          }
        });
      } else {
        // User is signed out
        setUser(null);
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Fetch corresponding account from Firestore
      const accountRef = doc(db, "accounts", user.uid);
      const accountSnap = await getDoc(accountRef);

      if (accountSnap.exists()) {
        const accountData = accountSnap.data();

        // Update global user state here
        setUser({
          ...EMPTY_USER,
          ...accountData,
          id: user.uid,
          email: user.email ?? "",
          role: accountData.role ?? "user",
          status: accountData.status ?? "active",
        });
        setAuthenticated(true);
        setRole(accountData.role || "user");

        console.log("User signed in and account fetched successfully.");
      } else {
        console.warn("No account document found for this user.");
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const verifyEmail = async (user: User) => {
    try {
      if (!user.email) {
        throw new Error("User email is missing.");
      }
      // // Optionally, you can check if the current Firebase user matches
      // const currentUser = auth.currentUser;
      // if (currentUser && currentUser.email === user.email) {
      //   await sendEmailVerification(currentUser);
      //   toast.success("Verification email sent. Please check your inbox.");
      // } else {
      //   // Optionally, sign in as the user to send verification
      //   const userCredential = await signInWithEmailAndPassword(auth, user.email, 'abc123');
      //   await sendEmailVerification(userCredential.user);
      //   toast.success("Verification email sent. Please check your inbox.");
      // }
      const userRef = doc(db, "accounts", user.uid);
      await setDoc(userRef, {
        emailVerified: true,
      }, { merge: true });
      toast.success("Email verified successfully.");
      window.location.reload();
      
    } catch (error) {
      console.error("Error sending email verification:", error);
      toast.error("Error sending verification email. Please try again.");
    }
  }

  const sendWelcomeEmail = (email: string, password: string) => {
    const templateParams = {
      to_email: email,
      to_name: email,
      message: `Welcome to BlockBeats! Your account has been created successfully. Your temporary password is: ${password}. Please change it after logging in.`,
      from_name: "BlockBeats",
      subject: "Welcome to BlockBeats!",
      user_id: uuidv4(),
      user_email: email,
      user_password: password,
    };
    emailjs.send(
      'service_3x2j5gq',
      'template_4v8z6r7',
      templateParams,
      'user_9X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q'
    )
    .then((response) => {
      console.log('Email sent successfully:', response);
      toast.success("Welcome email sent successfully.");
    })
    .catch((error) => {
      console.error('Error sending email:', error);
      toast.error("Error sending welcome email. Please try again.");
    });
  }

  const signUp = async (email: string, password: string = 'abc123') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const _user = {
        ...EMPTY_USER,
        uid: user.uid,
        email: user.email,
      };

      // Create associated account in Firestore
      await setDoc(doc(db, "accounts", user.uid), {
        ..._user,
        notifications: NOTIFICATIONS
      });
  
      setUser(_user as any);
      setAuthenticated(true);
      setRole(_user.role);

      sendEmailVerification(userCredential.user)
      .then(() => {
        // Email verification sent. Inform the user.
        toast.success("Verification email sent. Please check your inbox.");
      })
      .catch((error) => {
        // An error occurred. Show a message to the user.
        toast.error("Error sending verification email. Please try again.");
      });

      // Send a welcome email using EmailJS
      // sendWelcomeEmail(email, password);

      console.log("User and profile created successfully.");
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Fetch corresponding account from Firestore
      const accountRef = doc(db, "accounts", user.uid);
      const accountSnap = await getDoc(accountRef);
  
      if (accountSnap.exists()) {
        const accountData = accountSnap.data();
  
        // Update global user state here
        setUser({
          ...EMPTY_USER,
          ...accountData,
          id: user.uid,
          email: user.email ?? "",
          role: accountData.role ?? "user",
          status: accountData.status ?? "active",
        });
        setAuthenticated(true);
        setRole(accountData.role || "user");
  
        console.log("User signed in and account fetched successfully.");
      } else {
        console.warn("No account document found for this user.");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setAuthenticated(false);
    setRole('user') // Reset the role to default;
    console.log("User signed out successfully.");
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, 
        role,
        setRole,
        authenticated,
        setAuthenticated,
        signUp, 
        signIn, 
        signInWithGoogle,
        verifyEmail,
        sendWelcomeEmail,
        logout, 
        resetPassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
