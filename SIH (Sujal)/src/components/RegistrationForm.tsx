import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, User, GraduationCap, Target, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  phone: string;
  state: string;
  district: string;
  education: string;
  field: string;
  skills: string[];
  interests: string[];
  duration: string;
  workType: string;
  language: string;
}

interface RegistrationFormProps {
  onComplete: () => void;
  onBack: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onComplete, onBack }) => {
  const { registerStudent } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    state: '',
    district: '',
    education: '',
    field: '',
    skills: [],
    interests: [],
    duration: '',
    workType: '',
    language: 'English'
  });

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const educationLevels = [
    'High School (10th)', 'Higher Secondary (12th)', 'Diploma', 
    'Undergraduate (Pursuing)', 'Undergraduate (Completed)', 
    'Postgraduate (Pursuing)', 'Postgraduate (Completed)'
  ];

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

  const handleInputChange = (field: keyof RegistrationData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleArrayItem = (field: 'skills' | 'interests', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item) 
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.email && formData.password && formData.phone);
      case 2:
        return !!(formData.state && formData.education && formData.field);
      case 3:
        return formData.skills.length > 0 && formData.interests.length > 0;
      case 4:
        return !!(formData.duration && formData.workType);
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registerStudent(formData.email, formData.password, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
        district: formData.district,
        education: formData.education,
        field: formData.field,
        skills: formData.skills,
        interests: formData.interests,
        duration: formData.duration,
        workType: formData.workType,
        language: formData.language,
        profileComplete: true
      });

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      setError('Please fill in all required fields to continue');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Creating your account..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                पंजीकरण / Registration
              </h1>
              <p className="text-gray-600">Step {currentStep} of 4</p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Home
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name / पूरा नाम *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address / ईमेल *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password / पासवर्ड *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number / फ़ोन नंबर *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Educational Background</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State / राज्य *
                      </label>
                      <select 
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select your state</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District / जिला
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your district"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Education Level / शिक्षा स्तर *
                      </label>
                      <select 
                        value={formData.education}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select education level</option>
                        {educationLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field of Study / अध्ययन क्षेत्र *
                      </label>
                      <input
                        type="text"
                        value={formData.field}
                        onChange={(e) => handleInputChange('field', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Computer Science, Commerce, Arts"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Skills & Interests</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Skills / कौशल * (Select at least 3)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {skillOptions.map(skill => (
                        <label key={skill} className="flex items-center space-x-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.skills.includes(skill)}
                            onChange={() => toggleArrayItem('skills', skill)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                            {skill}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Selected: {formData.skills.length} skills
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Areas of Interest / रुचि के क्षेत्र * (Select at least 2)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {interestOptions.map(interest => (
                        <label key={interest} className="flex items-center space-x-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.interests.includes(interest)}
                            onChange={() => toggleArrayItem('interests', interest)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                            {interest}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Selected: {formData.interests.length} interests
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Preferences</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Duration / अवधि प्राथमिकता *
                      </label>
                      <select 
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select duration</option>
                        <option value="1-2 months">1-2 months</option>
                        <option value="3-4 months">3-4 months</option>
                        <option value="5-6 months">5-6 months</option>
                        <option value="6+ months">6+ months</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Type / काम का प्रकार *
                      </label>
                      <select 
                        value={formData.workType}
                        onChange={(e) => handleInputChange('workType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select work type</option>
                        <option value="remote">Remote / दूरस्थ</option>
                        <option value="office">Office / कार्यालय</option>
                        <option value="hybrid">Hybrid / हाइब्रिड</option>
                        <option value="any">No preference / कोई प्राथमिकता नहीं</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Language / भाषा प्राथमिकता
                    </label>
                    <select 
                      value={formData.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi / हिंदी</option>
                      <option value="Both">Both / दोनों</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={currentStep === 1 ? onBack : prevStep}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{currentStep === 1 ? 'Back to Home' : 'Previous'}</span>
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateStep(4)}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete Registration</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};