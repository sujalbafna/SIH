import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';
import { UserProfile } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  registerStudent: (email: string, password: string, profileData: any) => Promise<void>;
  registerGovernment: (email: string, password: string, profileData: any) => Promise<void>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signin = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const registerStudent = async (email: string, password: string, profileData: any) => {
    await authService.registerStudent(email, password, profileData);
  };

  const registerGovernment = async (email: string, password: string, profileData: any) => {
    await authService.registerGovernment(email, password, profileData);
  };

  const signout = async () => {
    await authService.signOut();
    setUserProfile(null);
  };

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const profile = await authService.getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signin,
    registerStudent,
    registerGovernment,
    signout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};