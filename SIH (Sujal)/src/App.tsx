import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Award, Building, Heart, User, Bell, BookOpen, Star, TrendingUp, Users, Target } from 'lucide-react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { RegistrationForm } from './components/RegistrationForm';
import { GovernmentRegistration } from './components/GovernmentRegistration';
import { GovernmentDashboard } from './components/GovernmentDashboard';
import { ProfileSettings } from './components/ProfileSettings';
import { ApplicationTracker } from './components/ApplicationTracker';
import { SavedInternships } from './components/SavedInternships';
import { NotificationCenter } from './components/NotificationCenter';
import { internshipService, Internship, InternshipFilters } from './services/internshipService';
import { aiRecommendationService } from './services/aiRecommendation';
import { savedInternshipsService } from './services/savedInternshipsService';
import { applicationService } from './services/applicationService';
import { LoadingSpinner } from './components/LoadingSpinner';

type ViewType = 'home' | 'register' | 'gov-register' | 'dashboard' | 'profile' | 'applications' | 'saved' | 'notifications' | 'internship-detail';

interface InternshipWithMatch extends Internship {
  matchScore?: number;
  reasoning?: string;
}

function AppContent() {
  const { currentUser, userProfile, signin, signout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [internships, setInternships] = useState<InternshipWithMatch[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<InternshipWithMatch[]>([]);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<InternshipFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    loadInternships();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [internships, searchQuery, filters]);

  const loadInternships = async () => {
    setLoading(true);
    try {
      const data = await internshipService.getAllInternships();
      
      // If user is logged in and has a profile, get AI recommendations
      if (userProfile && userProfile.role === 'student') {
        try {
          const recommendations = await aiRecommendationService.generateRecommendations(
            {
              name: userProfile.name,
              education: userProfile.education || '',
              field: userProfile.field || '',
              skills: userProfile.skills || [],
              interests: userProfile.interests || [],
              location: userProfile.state,
              duration: userProfile.duration || '',
              workType: userProfile.workType || ''
            },
            data
          );
          setInternships(recommendations);
        } catch (error) {
          console.error('AI recommendations failed, using regular data:', error);
          setInternships(data);
        }
      } else {
        setInternships(data);
      }
    } catch (error) {
      console.error('Failed to load internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...internships];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(internship =>
        internship.title.toLowerCase().includes(query) ||
        internship.company.toLowerCase().includes(query) ||
        internship.location.toLowerCase().includes(query) ||
        internship.skills.some(skill => skill.toLowerCase().includes(query)) ||
        internship.category.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.location) {
      filtered = filtered.filter(internship => 
        internship.state === filters.location
      );
    }

    if (filters.type) {
      filtered = filtered.filter(internship => 
        internship.type === filters.type
      );
    }

    if (filters.duration) {
      filtered = filtered.filter(internship => 
        internship.duration === filters.duration
      );
    }

    if (filters.remote !== undefined) {
      filtered = filtered.filter(internship => 
        internship.remote === filters.remote
      );
    }

    if (filters.category) {
      filtered = filtered.filter(internship => 
        internship.category === filters.category
      );
    }

    setFilteredInternships(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect, so this just prevents form submission
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      await signin(loginData.email, loginData.password);
      setShowLogin(false);
      setLoginData({ email: '', password: '' });
    } catch (error: any) {
      setLoginError(error.message || 'Login failed');
    }
  };

  const handleSaveInternship = async (internship: Internship) => {
    if (!currentUser || !userProfile) {
      setShowLogin(true);
      return;
    }

    try {
      await savedInternshipsService.saveInternship({
        userId: userProfile.uid,
        internshipId: internship.id,
        internshipTitle: internship.title,
        companyName: internship.company,
        location: internship.location,
        duration: internship.duration,
        stipend: internship.stipend,
        skills: internship.skills,
        remote: internship.remote
      });
      alert('Internship saved successfully!');
    } catch (error) {
      console.error('Failed to save internship:', error);
      alert('Failed to save internship. Please try again.');
    }
  };

  const handleApplyToInternship = async (internship: Internship) => {
    if (!currentUser || !userProfile) {
      setShowLogin(true);
      return;
    }

    try {
      await applicationService.submitApplication({
        userId: userProfile.uid,
        internshipId: internship.id,
        internshipTitle: internship.title,
        companyName: internship.company,
        location: internship.location,
        duration: internship.duration,
        status: 'pending'
      });
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  // Handle different views
  if (currentView === 'register') {
    return (
      <RegistrationForm
        onComplete={() => setCurrentView('home')}
        onBack={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'gov-register') {
    return (
      <GovernmentRegistration
        onComplete={() => setCurrentView('home')}
        onBack={() => setCurrentView('home')}
      />
    );
  }

  if (currentUser && userProfile?.role === 'government') {
    return (
      <GovernmentDashboard
        onSignOut={() => {
          signout();
          setCurrentView('home');
        }}
        onBackToHome={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'profile' && currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => setCurrentView('home')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Home
              </button>
              <button
                onClick={() => signout()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileSettings />
        </div>
      </div>
    );
  }

  if (currentView === 'applications' && currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => setCurrentView('home')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Home
              </button>
              <button
                onClick={() => signout()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ApplicationTracker />
        </div>
      </div>
    );
  }

  if (currentView === 'saved' && currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => setCurrentView('home')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Home
              </button>
              <button
                onClick={() => signout()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SavedInternships onViewInternship={(id) => {
            const internship = internships.find(i => i.id === id);
            if (internship) {
              setSelectedInternship(internship);
              setCurrentView('internship-detail');
            }
          }} />
        </div>
      </div>
    );
  }

  if (currentView === 'notifications' && currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => setCurrentView('home')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Home
              </button>
              <button
                onClick={() => signout()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NotificationCenter />
        </div>
      </div>
    );
  }

  if (currentView === 'internship-detail' && selectedInternship) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => setCurrentView('home')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Search
              </button>
              {currentUser && (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {userProfile?.name}</span>
                  <button
                    onClick={() => signout()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedInternship.title}</h1>
                  <p className="text-lg text-gray-600">{selectedInternship.company}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleSaveInternship(selectedInternship)}
                  className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{selectedInternship.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{selectedInternship.duration}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Stipend</p>
                  <p className="font-medium">{selectedInternship.stipend}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedInternship.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedInternship.skills.map((skill) => (
                    <span key={skill} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {selectedInternship.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              {selectedInternship.benefits && selectedInternship.benefits.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {selectedInternship.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t">
              <button
                onClick={() => handleApplyToInternship(selectedInternship)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main home view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PM Internship Portal</h1>
                <p className="text-xs text-gray-600">प्रधानमंत्री इंटर्नशिप योजना</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <button
                    onClick={() => setCurrentView('notifications')}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </button>
                  <button
                    onClick={() => setCurrentView('saved')}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentView('applications')}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <BookOpen className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentView('profile')}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <span className="text-gray-700">Welcome, {userProfile?.name}</span>
                  <button
                    onClick={() => signout()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setCurrentView('register')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register as Student
                  </button>
                  <button
                    onClick={() => setCurrentView('gov-register')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Government Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)'
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Internship
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              अपना आदर्श इंटर्नशिप खोजें - Connecting talent with opportunities across India
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 bg-white rounded-xl p-4 shadow-2xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search internships, companies, skills..."
                    className="w-full pl-12 pr-4 py-3 text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold">{internships.length}+</div>
                <div className="text-blue-200">Active Internships</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-blue-200">Partner Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-blue-200">Students Placed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">28</div>
                <div className="text-blue-200">States Covered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid md:grid-cols-5 gap-4">
              <select
                value={filters.location || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value || undefined }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
              </select>

              <select
                value={filters.type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Technical">Technical</option>
                <option value="Marketing">Marketing</option>
                <option value="Analytics">Analytics</option>
                <option value="Content">Content</option>
                <option value="Finance">Finance</option>
              </select>

              <select
                value={filters.duration || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value || undefined }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Durations</option>
                <option value="3 months">3 months</option>
                <option value="4 months">4 months</option>
                <option value="5 months">5 months</option>
                <option value="6 months">6 months</option>
              </select>

              <select
                value={filters.remote === undefined ? '' : filters.remote.toString()}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  remote: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Work Types</option>
                <option value="true">Remote</option>
                <option value="false">On-site</option>
              </select>

              <button
                onClick={() => {
                  setFilters({});
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose PM Internship Portal?</h2>
            <p className="text-xl text-gray-600">Empowering India's youth with world-class opportunities</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Matching</h3>
              <p className="text-gray-600">Our advanced AI algorithm matches you with internships that align with your skills and career goals.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Companies</h3>
              <p className="text-gray-600">All our partner companies are verified government and private organizations ensuring quality experiences.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Support</h3>
              <p className="text-gray-600">Get mentorship, skill development, and career guidance throughout your internship journey.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Internships List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchQuery || Object.keys(filters).length > 0 
              ? `Search Results (${filteredInternships.length})` 
              : 'Featured Internships'
            }
          </h2>
          {userProfile && (
            <div className="text-sm text-gray-600">
              Showing personalized recommendations based on your profile
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading internships..." />
          </div>
        ) : filteredInternships.length > 0 ? (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInternships.map((internship) => (
              <div key={internship.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{internship.title}</h3>
                      <p className="text-sm text-gray-600">{internship.company}</p>
                    </div>
                  </div>
                  {internship.matchScore && (
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      {internship.matchScore}% match
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{internship.location}</span>
                    {internship.remote && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Remote
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{internship.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="w-4 h-4 mr-2" />
                    <span className="font-medium">{internship.stipend}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {internship.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">
                        {skill}
                      </span>
                    ))}
                    {internship.skills.length > 3 && (
                      <span className="text-gray-500 text-xs">+{internship.skills.length - 3} more</span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{internship.description}</p>

                {internship.reasoning && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Why this matches:</strong> {internship.reasoning}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      setSelectedInternship(internship);
                      setCurrentView('internship-detail');
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleSaveInternship(internship)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters to find more opportunities.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({});
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Success Stories Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">Real stories from our successful interns</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src="https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1" 
                  alt="Success story" 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Priya Sharma</h4>
                  <p className="text-sm text-gray-600">Software Developer at TechCorp</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"The PM Internship Portal helped me land my dream job. The AI matching was spot-on and connected me with the perfect opportunity!"</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src="https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1" 
                  alt="Success story" 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Rahul Kumar</h4>
                  <p className="text-sm text-gray-600">Marketing Specialist at Creative Agency</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"From a small town to working with top brands - this platform made it possible. The mentorship and support were incredible."</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src="https://images.pexels.com/photos/3771118/pexels-photo-3771118.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1" 
                  alt="Success story" 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Anita Patel</h4>
                  <p className="text-sm text-gray-600">Data Analyst at DataViz Corp</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"The skills I learned during my internship transformed my career. Now I'm working on projects that impact millions of users."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">PM Internship Portal</h3>
                  <p className="text-xs text-gray-400">प्रधानमंत्री इंटर्नशिप योजना</p>
                </div>
              </div>
              <p className="text-gray-400">Connecting India's youth with world-class internship opportunities.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Students</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Find Internships</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Career Guidance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Skill Development</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Organizations</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Post Internships</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Find Talent</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partnership</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PM Internship Portal. All rights reserved. | Made with ❤️ for India's future</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Login to Your Account</h2>
            
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{loginError}</span>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false);
                    setLoginError('');
                    setLoginData({ email: '', password: '' });
                  }}
                  className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;