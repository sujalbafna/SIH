import React, { useState, useEffect } from 'react';
import { Plus, Building, MapPin, Clock, Award, Edit, Trash2, Eye, Users, BarChart3 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { internshipService, Internship } from '../services/internshipService';
import { LoadingSpinner } from './LoadingSpinner';
import { InternshipForm } from './InternshipForm';

interface GovernmentDashboardProps {
  onSignOut: () => void;
  onBackToHome: () => void;
}

export const GovernmentDashboard: React.FC<GovernmentDashboardProps> = ({ onSignOut, onBackToHome }) => {
  const { userProfile } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'edit'>('dashboard');
  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGovernmentInternships();
  }, []);

  const loadGovernmentInternships = async () => {
    setLoading(true);
    try {
      // In a real app, this would filter by the government user's ID
      const data = await internshipService.getAllInternships();
      setInternships(data);
    } catch (error) {
      console.error('Failed to load internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInternship = () => {
    setSelectedInternship(null);
    setCurrentView('create');
  };

  const handleEditInternship = (internship: Internship) => {
    setSelectedInternship(internship);
    setCurrentView('edit');
  };

  const handleInternshipSaved = () => {
    setCurrentView('dashboard');
    loadGovernmentInternships();
  };

  if (currentView === 'create' || currentView === 'edit') {
    return (
      <InternshipForm
        internship={selectedInternship}
        onSave={handleInternshipSaved}
        onCancel={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Government Dashboard</h1>
                <p className="text-sm text-gray-600">{userProfile?.organizationName}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onBackToHome}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Home
              </button>
              <button
                onClick={onSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {userProfile?.name}! 👋</h1>
          <p className="text-blue-100 text-lg mb-4">
            {userProfile?.designation} at {userProfile?.department}
          </p>
          <button
            onClick={handleCreateInternship}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Post New Internship</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Internships</p>
                <p className="text-2xl font-bold text-gray-900">{internships.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Postings</p>
                <p className="text-2xl font-bold text-green-600">{internships.filter(i => i.isActive).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-orange-600">245</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600">87%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Internships List */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Posted Internships</h2>
              <button
                onClick={handleCreateInternship}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading internships..." />
              </div>
            ) : internships.length > 0 ? (
              <div className="space-y-4">
                {internships.map((internship) => (
                  <div key={internship.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{internship.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            internship.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {internship.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{internship.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{internship.duration}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Award className="w-4 h-4 mr-2" />
                            <span>{internship.stipend}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {internship.skills.slice(0, 4).map((skill) => (
                            <span key={skill} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">
                              {skill}
                            </span>
                          ))}
                          {internship.skills.length > 4 && (
                            <span className="text-gray-500 text-xs">+{internship.skills.length - 4} more</span>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2">{internship.description}</p>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditInternship(internship)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Internships Posted Yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by creating your first internship opportunity for students.
                </p>
                <button
                  onClick={handleCreateInternship}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Post Your First Internship
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};