import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface SavedInternship {
  id: string;
  userId: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  location: string;
  duration: string;
  stipend: string;
  skills: string[];
  remote: boolean;
  savedAt: Date;
}

class SavedInternshipsService {
  async saveInternship(savedData: Omit<SavedInternship, 'id' | 'savedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'savedInternships'), {
        ...savedData,
        savedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving internship:', error);
      throw error;
    }
  }

  async getUserSavedInternships(userId: string): Promise<SavedInternship[]> {
    try {
      const q = query(
        collection(db, 'savedInternships'),
        where('userId', '==', userId),
        orderBy('savedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SavedInternship));
    } catch (error) {
      console.error('Error fetching saved internships:', error);
      return this.getMockSavedInternships(userId);
    }
  }

  async removeSavedInternship(savedId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'savedInternships', savedId));
    } catch (error) {
      console.error('Error removing saved internship:', error);
      throw error;
    }
  }

  async isInternshipSaved(userId: string, internshipId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'savedInternships'),
        where('userId', '==', userId),
        where('internshipId', '==', internshipId)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if internship is saved:', error);
      return false;
    }
  }

  private getMockSavedInternships(userId: string): SavedInternship[] {
    return [
      {
        id: '1',
        userId,
        internshipId: '1',
        internshipTitle: 'Software Development Intern',
        companyName: 'TechCorp Solutions',
        location: 'Bangalore, Karnataka',
        duration: '3 months',
        stipend: '₹15,000/month',
        skills: ['JavaScript', 'React', 'Python', 'Git'],
        remote: true,
        savedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        userId,
        internshipId: '4',
        internshipTitle: 'Content Writing Intern',
        companyName: 'MediaHub Communications',
        location: 'Chennai, Tamil Nadu',
        duration: '3 months',
        stipend: '₹10,000/month',
        skills: ['Content Writing', 'SEO', 'WordPress', 'Research'],
        remote: true,
        savedAt: new Date('2024-01-12')
      }
    ];
  }
}

export const savedInternshipsService = new SavedInternshipsService();