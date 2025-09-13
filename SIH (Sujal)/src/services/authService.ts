import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile } from '../types/user';

class AuthService {
  async registerStudent(email: string, password: string, profileData: Omit<UserProfile, 'uid' | 'createdAt' | 'role'>): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        uid: user.uid,
        role: 'student',
        createdAt: new Date(),
        profileComplete: true
      });

      return user;
    } catch (error) {
      console.error('Student registration error:', error);
      throw error;
    }
  }

  async registerGovernment(email: string, password: string, profileData: {
    name: string;
    email: string;
    phone: string;
    state: string;
    department: string;
    designation: string;
    organizationName: string;
  }): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save government user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        uid: user.uid,
        role: 'government',
        createdAt: new Date(),
        profileComplete: true
      });

      return user;
    } catch (error) {
      console.error('Government registration error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
}

export const authService = new AuthService();