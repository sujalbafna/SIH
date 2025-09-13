import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Internship {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  state: string;
  duration: string;
  stipend: string;
  skills: string[];
  type: string;
  category: string;
  remote: boolean;
  description: string;
  requirements: string[];
  benefits: string[];
  applicationDeadline: Date;
  startDate: Date;
  isActive: boolean;
  suitableForFirstTimers: boolean;
  languageRequirement: string[];
  createdAt: Date;
}

export interface InternshipFilters {
  location?: string;
  type?: string;
  duration?: string;
  remote?: boolean;
  skills?: string[];
  category?: string;
}

class InternshipService {
  async getAllInternships(): Promise<Internship[]> {
    try {
      const internshipsRef = collection(db, 'internships');
      const q = query(
        internshipsRef, 
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Internship));
    } catch (error) {
      console.error('Error fetching internships:', error);
      return this.getMockInternships();
    }
  }

  async getFilteredInternships(filters: InternshipFilters): Promise<Internship[]> {
    try {
      let q = query(collection(db, 'internships'), where('isActive', '==', true));

      if (filters.location) {
        q = query(q, where('state', '==', filters.location));
      }
      
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      if (filters.remote !== undefined) {
        q = query(q, where('remote', '==', filters.remote));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Internship));
    } catch (error) {
      console.error('Error filtering internships:', error);
      return this.getMockInternships();
    }
  }

  async getInternshipById(id: string): Promise<Internship | null> {
    try {
      const docRef = doc(db, 'internships', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Internship;
      }
      return null;
    } catch (error) {
      console.error('Error fetching internship:', error);
      return null;
    }
  }

  async createInternship(internshipData: Omit<Internship, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'internships'), internshipData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating internship:', error);
      throw error;
    }
  }

  async updateInternship(id: string, internshipData: Partial<Internship>): Promise<void> {
    try {
      const docRef = doc(db, 'internships', id);
      await updateDoc(docRef, internshipData);
    } catch (error) {
      console.error('Error updating internship:', error);
      throw error;
    }
  }

  async deleteInternship(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'internships', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting internship:', error);
      throw error;
    }
  }

  private getMockInternships(): Internship[] {
    return [
      {
        id: '1',
        title: 'Software Development Intern',
        company: 'TechCorp Solutions',
        location: 'Bangalore, Karnataka',
        state: 'Karnataka',
        duration: '3 months',
        stipend: '₹15,000/month',
        skills: ['JavaScript', 'React', 'Python', 'Git'],
        type: 'Technical',
        category: 'Information Technology',
        remote: true,
        description: 'Join our development team and work on real-world projects using modern technologies. Perfect for beginners with basic programming knowledge.',
        requirements: ['Basic programming knowledge', 'Willingness to learn', 'Good communication skills'],
        benefits: ['Mentorship program', 'Flexible working hours', 'Certificate of completion', 'Job placement assistance'],
        applicationDeadline: new Date('2024-03-15'),
        startDate: new Date('2024-04-01'),
        isActive: true,
        suitableForFirstTimers: true,
        languageRequirement: ['English', 'Hindi'],
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'Digital Marketing Assistant',
        company: 'Creative Agency Pvt Ltd',
        location: 'Mumbai, Maharashtra',
        state: 'Maharashtra',
        duration: '4 months',
        stipend: '₹12,000/month',
        skills: ['Social Media Marketing', 'Content Writing', 'Google Analytics', 'Canva'],
        type: 'Marketing',
        category: 'Marketing & Sales',
        remote: false,
        description: 'Learn digital marketing strategies and help manage social media campaigns for clients. Great opportunity for creative minds.',
        requirements: ['Creative thinking', 'Basic computer skills', 'English proficiency', 'Social media familiarity'],
        benefits: ['Industry exposure', 'Skill development workshops', 'Portfolio building', 'Networking opportunities'],
        applicationDeadline: new Date('2024-03-20'),
        startDate: new Date('2024-04-05'),
        isActive: true,
        suitableForFirstTimers: true,
        languageRequirement: ['English', 'Hindi', 'Marathi'],
        createdAt: new Date()
      },
      {
        id: '3',
        title: 'Data Analysis Trainee',
        company: 'DataViz Corp',
        location: 'Delhi NCR',
        state: 'Delhi',
        duration: '6 months',
        stipend: '₹18,000/month',
        skills: ['Excel', 'Statistics', 'SQL', 'Power BI'],
        type: 'Analytics',
        category: 'Data Science',
        remote: true,
        description: 'Work with data teams to analyze business metrics and create insightful reports. Learn industry-standard tools and techniques.',
        requirements: ['Analytical mindset', 'Excel proficiency', 'Attention to detail', 'Basic mathematics'],
        benefits: ['Data certification', 'Remote work opportunity', 'Performance bonus', 'Career guidance'],
        applicationDeadline: new Date('2024-03-25'),
        startDate: new Date('2024-04-10'),
        isActive: true,
        suitableForFirstTimers: true,
        languageRequirement: ['English', 'Hindi'],
        createdAt: new Date()
      },
      {
        id: '4',
        title: 'Content Writing Intern',
        company: 'MediaHub Communications',
        location: 'Chennai, Tamil Nadu',
        state: 'Tamil Nadu',
        duration: '3 months',
        stipend: '₹10,000/month',
        skills: ['Content Writing', 'SEO', 'WordPress', 'Research'],
        type: 'Content',
        category: 'Media & Communications',
        remote: true,
        description: 'Create engaging content for websites, blogs, and social media. Perfect for those passionate about writing and storytelling.',
        requirements: ['Excellent writing skills', 'Creativity', 'Research abilities', 'Time management'],
        benefits: ['Portfolio development', 'Byline opportunities', 'SEO training', 'Writing workshops'],
        applicationDeadline: new Date('2024-03-18'),
        startDate: new Date('2024-04-02'),
        isActive: true,
        suitableForFirstTimers: true,
        languageRequirement: ['English', 'Tamil'],
        createdAt: new Date()
      },
      {
        id: '5',
        title: 'Finance & Accounting Assistant',
        company: 'FinanceFirst Services',
        location: 'Pune, Maharashtra',
        state: 'Maharashtra',
        duration: '4 months',
        stipend: '₹14,000/month',
        skills: ['Accounting', 'Excel', 'Tally', 'Financial Analysis'],
        type: 'Finance',
        category: 'Finance & Banking',
        remote: false,
        description: 'Support financial operations and learn accounting principles. Great stepping stone for finance careers.',
        requirements: ['Commerce background preferred', 'Numerical aptitude', 'Attention to detail', 'Professional attitude'],
        benefits: ['Professional certification', 'Industry mentorship', 'Job placement support', 'Skill development'],
        applicationDeadline: new Date('2024-03-22'),
        startDate: new Date('2024-04-08'),
        isActive: true,
        suitableForFirstTimers: true,
        languageRequirement: ['English', 'Hindi', 'Marathi'],
        createdAt: new Date()
      },
      {
      id: '6',
      title: 'Machine Learning Intern',
  company: 'NeuroTech Labs',
  location: 'Bengaluru',
  state: 'Karnataka',
  duration: '3 months',
  stipend: '₹15,000/month',
  skills: ['Python', 'TensorFlow', 'scikit-learn', 'Data Preprocessing'],
  type: 'AI/ML',
  category: 'Artificial Intelligence',
  remote: false,
  description: 'Assist in building predictive models and training machine learning pipelines on real-world datasets.',
  requirements: ['Strong Python skills', 'Basic ML concepts', 'Problem-solving ability'],
  benefits: ['Hands-on ML projects', 'Mentorship from experts', 'Full-time offer for top performers'],
  applicationDeadline: new Date('2024-04-15'),
  startDate: new Date('2024-05-01'),
  isActive: true,
  suitableForFirstTimers: false,
  languageRequirement: ['English'],
  createdAt: new Date()
},
{
  id: '7',
  title: 'Frontend Development Intern',
  company: 'PixelWave Solutions',
  location: 'Hyderabad',
  state: 'Telangana',
  duration: '4 months',
  stipend: '₹12,000/month',
  skills: ['React.js', 'HTML', 'CSS', 'JavaScript'],
  type: 'Development',
  category: 'Web Development',
  remote: true,
  description: 'Work on user-facing applications, improve UI/UX, and optimize performance for web platforms.',
  requirements: ['Knowledge of React.js', 'Understanding of responsive design', 'Basic Git/GitHub'],
  benefits: ['Remote work', 'Project certificate', 'Exposure to real clients'],
  applicationDeadline: new Date('2024-04-05'),
  startDate: new Date('2024-04-20'),
  isActive: true,
  suitableForFirstTimers: true,
  languageRequirement: ['English', 'Hindi'],
  createdAt: new Date()
},
{
  id: '8',
  title: 'Cybersecurity Intern',
  company: 'SecureNet Pvt Ltd',
  location: 'Pune',
  state: 'Maharashtra',
  duration: '6 months',
  stipend: '₹20,000/month',
  skills: ['Networking', 'Linux', 'Penetration Testing', 'Ethical Hacking'],
  type: 'Security',
  category: 'Cybersecurity',
  remote: false,
  description: 'Assist in vulnerability assessment, penetration testing, and network security audits.',
  requirements: ['Basic knowledge of OSI model', 'Linux fundamentals', 'Interest in cybersecurity'],
  benefits: ['Cybersecurity certification', 'Job referral', 'Industry mentorship'],
  applicationDeadline: new Date('2024-04-10'),
  startDate: new Date('2024-04-25'),
  isActive: true,
  suitableForFirstTimers: false,
  languageRequirement: ['English'],
  createdAt: new Date()
},
{
  id: '9',
  title: 'Cloud Computing Intern',
  company: 'CloudSphere Technologies',
  location: 'Chennai',
  state: 'Tamil Nadu',
  duration: '5 months',
  stipend: '₹18,500/month',
  skills: ['AWS', 'Docker', 'Kubernetes', 'DevOps Basics'],
  type: 'Cloud',
  category: 'Cloud Engineering',
  remote: true,
  description: 'Support cloud engineers in building and maintaining scalable cloud infrastructure.',
  requirements: ['Basic AWS knowledge', 'Linux commands', 'Understanding of containers'],
  benefits: ['AWS free credits', 'Chance to work on production systems', 'Career mentoring'],
  applicationDeadline: new Date('2024-04-18'),
  startDate: new Date('2024-05-05'),
  isActive: true,
  suitableForFirstTimers: true,
  languageRequirement: ['English'],
  createdAt: new Date()
},
{
  id: '10',
  title: 'Data Engineering Intern',
  company: 'BigData Works',
  location: 'Mumbai',
  state: 'Maharashtra',
  duration: '6 months',
  stipend: '₹22,000/month',
  skills: ['Python', 'SQL', 'Hadoop', 'Spark'],
  type: 'Analytics',
  category: 'Big Data',
  remote: false,
  description: 'Assist in building ETL pipelines, managing big data clusters, and optimizing data flows.',
  requirements: ['Knowledge of SQL', 'Basics of distributed systems', 'Python scripting'],
  benefits: ['Big Data tools training', 'Certificate', 'Full-time conversion'],
  applicationDeadline: new Date('2024-04-12'),
  startDate: new Date('2024-04-30'),
  isActive: true,
  suitableForFirstTimers: false,
  languageRequirement: ['English'],
  createdAt: new Date()
},
{
  id: '11',
  title: 'Backend Development Intern',
  company: 'CodeNest Solutions',
  location: 'Pune',
  state: 'Maharashtra',
  duration: '4 months',
  stipend: '₹14,000/month',
  skills: ['Node.js', 'Express.js', 'MongoDB', 'API Development'],
  type: 'Development',
  category: 'Software Engineering',
  remote: true,
  description: 'Design and implement REST APIs, integrate databases, and optimize server performance.',
  requirements: ['Strong JavaScript basics', 'Database understanding', 'Problem-solving mindset'],
  benefits: ['Remote flexibility', 'Certification', 'Full-time opportunity'],
  applicationDeadline: new Date('2024-04-14'),
  startDate: new Date('2024-05-01'),
  isActive: true,
  suitableForFirstTimers: true,
  languageRequirement: ['English', 'Hindi'],
  createdAt: new Date()
},
{
  id: '12',
  title: 'Blockchain Development Intern',
  company: 'CryptoEdge Labs',
  location: 'Bengaluru',
  state: 'Karnataka',
  duration: '5 months',
  stipend: '₹20,000/month',
  skills: ['Solidity', 'Ethereum', 'Smart Contracts', 'Web3.js'],
  type: 'Research & Development',
  category: 'Blockchain',
  remote: false,
  description: 'Work on decentralized applications, implement smart contracts, and test blockchain protocols.',
  requirements: ['Knowledge of blockchain basics', 'Good coding skills', 'Interest in crypto/DeFi'],
  benefits: ['Hands-on DApp development', 'Networking with blockchain experts', 'Certificate'],
  applicationDeadline: new Date('2024-04-20'),
  startDate: new Date('2024-05-10'),
  isActive: true,
  suitableForFirstTimers: false,
  languageRequirement: ['English'],
  createdAt: new Date()
},
{
  id: '13',
  title: 'Database Management Intern',
  company: 'DataHive Systems',
  location: 'Noida',
  state: 'Uttar Pradesh',
  duration: '3 months',
  stipend: '₹12,500/month',
  skills: ['SQL', 'MySQL', 'PostgreSQL', 'Data Modeling'],
  type: 'Database',
  category: 'DBMS',
  remote: true,
  description: 'Assist in designing, maintaining, and optimizing relational databases for enterprise applications.',
  requirements: ['Strong SQL queries', 'Normalization knowledge', 'Analytical mindset'],
  benefits: ['Certificate', 'Database admin exposure', 'Remote flexibility'],
  applicationDeadline: new Date('2024-04-18'),
  startDate: new Date('2024-05-02'),
  isActive: true,
  suitableForFirstTimers: true,
  languageRequirement: ['English', 'Hindi'],
  createdAt: new Date()
},
{
  id: '14',
  title: 'IoT Development Intern',
  company: 'SmartTech Innovations',
  location: 'Ahmedabad',
  state: 'Gujarat',
  duration: '6 months',
  stipend: '₹18,000/month',
  skills: ['Arduino', 'Raspberry Pi', 'C++', 'IoT Protocols (MQTT, CoAP)'],
  type: 'Embedded Systems',
  category: 'IoT',
  remote: false,
  description: 'Build IoT prototypes, integrate sensors, and implement real-time data transmission modules.',
  requirements: ['Basic electronics knowledge', 'Programming in C++/Python', 'Interest in IoT'],
  benefits: ['Hardware kits provided', 'IoT certification', 'Hands-on projects'],
  applicationDeadline: new Date('2024-04-22'),
  startDate: new Date('2024-05-08'),
  isActive: true,
  suitableForFirstTimers: false,
  languageRequirement: ['English'],
  createdAt: new Date()
},
{
  id: '15',
  title: 'Mobile App Development Intern',
  company: 'AppWave Technologies',
  location: 'Gurugram',
  state: 'Haryana',
  duration: '4 months',
  stipend: '₹16,000/month',
  skills: ['Flutter', 'Dart', 'Firebase', 'UI/UX'],
  type: 'Development',
  category: 'Mobile Development',
  remote: true,
  description: 'Contribute to cross-platform mobile apps using Flutter and integrate APIs for new features.',
  requirements: ['Basics of Flutter', 'Understanding of Firebase', 'Good problem-solving skills'],
  benefits: ['Remote work', 'Certificate', 'Opportunity for app publishing on Play Store'],
  applicationDeadline: new Date('2024-04-25'),
  startDate: new Date('2024-05-12'),
  isActive: true,
  suitableForFirstTimers: true,
  languageRequirement: ['English', 'Hindi'],
  createdAt: new Date()
},
      {
  id: '16',
  title: 'AI Research Intern',
  company: 'VisionAI Labs',
  location: 'Bengaluru',
  state: 'Karnataka',
  duration: '6 months',
  stipend: '₹22,000/month',
  skills: ['Python', 'PyTorch', 'NLP', 'Computer Vision'],
  type: 'Research',
  category: 'Artificial Intelligence',
  remote: false,
  description: 'Work with research teams on NLP and computer vision projects, focusing on deep learning innovations.',
  requirements: ['Strong ML knowledge', 'Research mindset', 'Experience with PyTorch or TensorFlow'],
  benefits: ['Research publication support', 'Certificate', 'Networking with AI experts'],
  applicationDeadline: new Date('2024-05-05'),
  startDate: new Date('2024-05-20'),
  isActive: true,
  suitableForFirstTimers: false,
  languageRequirement: ['English'],
  createdAt: new Date()
},
{
  id: '17',
  title: 'Full Stack Development Intern',
  company: 'CodeForge Pvt Ltd',
  location: 'Hyderabad',
  state: 'Telangana',
  duration: '5 months',
  stipend: '₹18,000/month',
  skills: ['React.js', 'Node.js', 'MongoDB', 'REST APIs'],
  type: 'Development',
  category: 'Full Stack',
  remote: true,
  description: 'Build scalable web applications from frontend to backend, working in agile teams.',
  requirements: ['Basic React knowledge', 'Understanding of Node.js', 'Git/GitHub familiarity'],
  benefits: ['Remote internship', 'Certificate', 'Chance to work on live client projects'],
  applicationDeadline: new Date('2024-05-02'),
  startDate: new Date('2024-05-18'),
  isActive: true,
  suitableForFirstTimers: true,
  languageRequirement: ['English', 'Hindi'],
  createdAt: new Date()
},
{
  id: '18',
  title: 'Game Development Intern',
  company: 'PlayVerse Studios',
  location: 'Mumbai',
  state: 'Maharashtra',
  duration: '4 months',
  stipend: '₹15,500/month',
  skills: ['Unity', 'C#', 'Game Physics', '3D Modeling Basics'],
  type: 'Development',
  category: 'Game Development',
  remote: false,
  description: 'Assist in designing interactive 2D/3D games using Unity engine and contribute to gameplay mechanics.',
  requirements: ['C# coding skills', 'Interest in gaming industry', 'Basic Unity knowledge'],
  benefits: ['Certificate', 'Opportunity to publish games', 'Mentorship from senior game devs'],
  applicationDeadline: new Date('2024-05-08'),
  startDate: new Date('2024-05-25'),
  isActive: true,
  suitableForFirstTimers: true,
  languageRequirement: ['English'],
  createdAt: new Date()
},
{
  id: '19',
  title: 'DevOps Intern',
  company: 'NextGen CloudOps',
  location: 'Chennai',
  state: 'Tamil Nadu',
  duration: '6 months',
  stipend: '₹20,000/month',
  skills: ['CI/CD', 'Docker', 'Kubernetes', 'Jenkins'],
  type: 'Cloud',
  category: 'DevOps',
  remote: true,
  description: 'Work on continuous integration pipelines, containerized deployments, and automation scripts.',
  requirements: ['Linux basics', 'Scripting knowledge', 'Understanding of CI/CD tools'],
  benefits: ['Cloud certification support', 'Remote flexibility', 'Job offer for high performers'],
  applicationDeadline: new Date('2024-05-10'),
  startDate: new Date('2024-05-28'),
  isActive: true,
  suitableForFirstTimers: false,
  languageRequirement: ['English'],
  createdAt: new Date()
},
{
  id: '20',
  title: 'Software Testing Intern',
  company: 'QualitySoft Solutions',
  location: 'Delhi NCR',
  state: 'Delhi',
  duration: '3 months',
  stipend: '₹12,000/month',
  skills: ['Selenium', 'Test Cases', 'Automation Testing', 'Bug Tracking'],
  type: 'Quality Assurance',
  category: 'Software Testing',
  remote: false,
  description: 'Perform manual and automated testing of software modules, identify bugs, and ensure quality standards.',
  requirements: ['Basic testing knowledge', 'Attention to detail', 'Understanding of SDLC'],
  benefits: ['Testing certification', 'Certificate of internship', 'Hands-on automation experience'],
  applicationDeadline: new Date('2024-05-12'),
  startDate: new Date('2024-06-01'),
  isActive: true,
  suitableForFirstTimers: true,
  languageRequirement: ['English', 'Hindi'],
  createdAt: new Date()
}


    ];
  }

  getCategories(): string[] {
    return [
      'Information Technology',
      'Marketing & Sales', 
      'Data Science',
      'Media & Communications',
      'Finance & Banking',
      'Human Resources',
      'Operations',
      'Design & Creative',
      'Research & Development',
      'Customer Service'
    ];
  }

  getSkillSuggestions(): string[] {
    return [
      'JavaScript', 'Python', 'React', 'HTML/CSS', 'Java', 'SQL',
      'Content Writing', 'Social Media Marketing', 'SEO', 'Digital Marketing',
      'Excel', 'Data Analysis', 'Statistics', 'Power BI', 'Tableau',
      'Photoshop', 'Canva', 'UI/UX Design', 'Video Editing',
      'Communication', 'Teamwork', 'Leadership', 'Problem Solving',
      'Research', 'Project Management', 'Time Management'
    ];
  }
}

export const internshipService = new InternshipService();