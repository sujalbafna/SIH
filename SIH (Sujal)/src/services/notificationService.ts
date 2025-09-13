import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Notification {
  id: string;
  userId: string;
  type: 'application_update' | 'new_internship' | 'deadline_reminder' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

class NotificationService {
  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return this.getMockNotifications(userId);
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId);
      return notifications.filter(notif => !notif.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  private getMockNotifications(userId: string): Notification[] {
    return [
      {
        id: '1',
        userId,
        type: 'application_update',
        title: 'Application Status Update',
        message: 'Your application for Software Development Intern at TechCorp Solutions has been accepted! Check your email for next steps.',
        read: false,
        createdAt: new Date('2024-01-20T10:30:00')
      },
      {
        id: '2',
        userId,
        type: 'new_internship',
        title: 'New Internship Match',
        message: 'We found a new internship that matches your profile: UI/UX Design Intern at Creative Studio.',
        read: false,
        createdAt: new Date('2024-01-19T14:15:00')
      },
      {
        id: '3',
        userId,
        type: 'deadline_reminder',
        title: 'Application Deadline Reminder',
        message: 'The application deadline for Data Analysis Trainee at DataViz Corp is in 3 days. Don\'t miss out!',
        read: true,
        createdAt: new Date('2024-01-18T09:00:00')
      },
      {
        id: '4',
        userId,
        type: 'system',
        title: 'Profile Completion',
        message: 'Complete your profile to get better internship recommendations. Add your portfolio and skills.',
        read: true,
        createdAt: new Date('2024-01-15T16:45:00')
      }
    ];
  }
}

export const notificationService = new NotificationService();