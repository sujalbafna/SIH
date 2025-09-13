export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'government';
  state: string;
  district?: string;
  education?: string;
  field?: string;
  skills?: string[];
  interests?: string[];
  duration?: string;
  workType?: string;
  language?: string;
  // Government specific fields
  department?: string;
  designation?: string;
  organizationName?: string;
  createdAt: Date;
  profileComplete: boolean;
}