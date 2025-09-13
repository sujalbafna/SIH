import React, { useState, useEffect } from 'react';
import { Heart, Building, MapPin, Clock, Award, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from './AuthContext';
import { savedInternshipsService, SavedInternship } from '../services/savedInternshipsService';
import { LoadingSpinner } from './LoadingSpinner';

interface SavedInternshipsProps {
  onViewInternship: (internshipId: string) => void;
}

export const SavedInternships: React.FC<SavedInternshipsProps> = ({ onViewInternship }) => {
  const { userProfile } = useAuth();
  const [savedInternships, setSavedInternships] = useState<SavedInternship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedInternships();
  }, [userProfile]);

  const loadSavedInternships = async () => {
    if (!userProfile) return;
    
    setLoading(true);
    try {
      const data = await savedInternshipsService.getUserSavedInternships(userProfile.uid);
      setSavedInternships(data);
    } catch (error) {
      console.error('Failed to load saved internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (savedId: string) => {
    try {
      await savedInternshipsService.removeSavedInternship(savedId);
      setSavedInternships(prev => prev.filter(item => item.id !== savedId));
    } catch (error) {
      console.error('Failed to remove saved internship:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading saved internships..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Saved Internships</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Heart className="w-4 h-4" />
          <span>{savedInternships.length} saved</span>
        </div>
      </div>

      {savedInternships.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Internships</h3>
          <p className="text-gray-600">
            Save internships you're interested in to easily find them later.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {savedInternships.map((saved) => (
            <div key={saved.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{saved.internshipTitle}</h3>
                    <p className="text-sm text-gray-600">{saved.companyName}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(saved.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{saved.location}</span>
                  {saved.remote && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Remote
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{saved.duration}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="w-4 h-4 mr-2" />
                  <span className="font-medium">{saved.stipend}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {saved.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">
                      {skill}
                    </span>
                  ))}
                  {saved.skills.length > 3 && (
                    <span className="text-gray-500 text-xs">+{saved.skills.length - 3} more</span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Saved on {new Date(saved.savedAt).toLocaleDateString()}
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => onViewInternship(saved.internshipId)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};