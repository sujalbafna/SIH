import React, { useState } from 'react';
import { User, Save, Edit, Camera, Mail, Phone, MapPin, GraduationCap, Target } from 'lucide-react';
import { useAuth } from './AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export const ProfileSettings: React.FC = () => {
  const { userProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    state: userProfile?.state || '',
    district: userProfile?.district || '',
    education: userProfile?.education || '',
    field: userProfile?.field || '',
    skills: userProfile?.skills || [],
    interests: userProfile?.interests || [],
    duration: userProfile?.duration || '',
    workType: userProfile?.workType || '',
    language: userProfile?.language || 'English'
  });

  const skillOptions = [
    'JavaScript', 'Python', 'Java', 'C++', 'HTML/CSS', 'React', 'Node.js',
    'Content Writing', 'Social Media Marketing', 'SEO', 'Digital Marketing',
    'Excel', 'Data Analysis', 'Statistics', 'SQL', 'Power BI',
    'Photoshop', 'Canva', 'Video Editing', 'UI/UX Design',
    'Communication', 'Leadership', 'Teamwork', 'Problem Solving'
  ];

  const interestOptions = [
    'Technology', 'Marketing', 'Data Science', 'Design', 'Finance',
    'Content Creation', 'Sales', 'Human Resources', 'Operations',
    'Research', 'Customer Service', 'Project Management'
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'skills' | 'interests', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item) 
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, this would update the user profile in Firebase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return <LoadingSpinner size="lg" text="Loading profile..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Picture Section */}
        <div className="flex items-center space-x-6 mb-8 pb-6 border-b">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            {editing && (
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{userProfile.name}</h3>
            <p className="text-gray-600">{userProfile.email}</p>
            <p className="text-sm text-gray-500 capitalize">{userProfile.role} Account</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Personal Information</span>
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg">{userProfile.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    {userProfile.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location</span>
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg">{userProfile.state}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg">{userProfile.district || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>Education</span>
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg">{userProfile.education}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.field}
                    onChange={(e) => handleInputChange('field', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg">{userProfile.field}</p>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Skills & Interests</span>
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                {editing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {skillOptions.map(skill => (
                      <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.skills.includes(skill)}
                          onChange={() => toggleArrayItem('skills', skill)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userProfile.skills?.map(skill => (
                      <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                {editing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {interestOptions.map(interest => (
                      <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(interest)}
                          onChange={() => toggleArrayItem('interests', interest)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{interest}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userProfile.interests?.map(interest => (
                      <span key={interest} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Duration</label>
                {editing ? (
                  <select
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1-2 months">1-2 months</option>
                    <option value="3-4 months">3-4 months</option>
                    <option value="5-6 months">5-6 months</option>
                    <option value="6+ months">6+ months</option>
                  </select>
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg">{userProfile.duration}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                {editing ? (
                  <select
                    value={formData.workType}
                    onChange={(e) => handleInputChange('workType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="remote">Remote</option>
                    <option value="office">Office</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="any">No preference</option>
                  </select>
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg capitalize">{userProfile.workType}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                {editing ? (
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Both">Both</option>
                  </select>
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg">{userProfile.language}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};