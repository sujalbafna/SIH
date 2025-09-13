import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Application {
  id: string;
  userId: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  location: string;
  duration: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: Date;
  updatedAt: Date;
  notes?: string;
  resume?: string;
  coverLetter?: string;
}

class ApplicationService {
  async submitApplication(applicationData: Omit<Application, 'id' | 'appliedAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'applications'), {
        ...applicationData,
        appliedAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  async getUserApplications(userId: string): Promise<Application[]> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('userId', '==', userId),
        orderBy('appliedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application));
    } catch (error) {
      console.error('Error fetching applications:', error);
      return this.getMockApplications(userId);
    }
  }

  async updateApplicationStatus(applicationId: string, status: Application['status'], notes?: string): Promise<void> {
    try {
      const docRef = doc(db, 'applications', applicationId);
      await updateDoc(docRef, {
        status,
        notes,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  private getMockApplications(userId: string): Application[] {
    return [
      {
        id: '1',
        userId,
        internshipId: '1',
        internshipTitle: 'Software Development Intern',
        companyName: 'TechCorp Solutions',
        location: 'Bangalore, Karnataka',
        duration: '3 months',
        status: 'pending',
        appliedAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        notes: 'Application submitted successfully. Waiting for initial screening.'
      },
      {
        id: '2',
        userId,
        internshipId: '2',
        internshipTitle: 'Digital Marketing Assistant',
        companyName: 'Creative Agency Pvt Ltd',
        location: 'Mumbai, Maharashtra',
        duration: '4 months',
        status: 'accepted',
        appliedAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-20'),
        notes: 'Congratulations! You have been selected for the internship. Please check your email for next steps.'
      },
      {
        id: '3',
        userId,
        internshipId: '3',
        internshipTitle: 'Data Analysis Trainee',
        companyName: 'DataViz Corp',
        location: 'Delhi NCR',
        duration: '6 months',
        status: 'rejected',
        appliedAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-18'),
        notes: 'Thank you for your interest. We have decided to move forward with other candidates.'
      }
    ];
  }
}

export const applicationService = new ApplicationService();