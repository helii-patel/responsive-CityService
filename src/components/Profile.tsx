import React, { useState, useEffect } from 'react';
import { User, Settings, Bell, Shield } from 'lucide-react';
import { supabase } from '../config/supabase';

interface ProfileProps {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    profession?: string;
    company?: string;
  };
  onAuthRequired?: () => void;
}

// Separate ProfileTab component to prevent re-creation
interface ProfileTabProps {
  profileData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    profession: string;
    company: string;
  };
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onProfessionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCompanyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  message: string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  profileData,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onCityChange,
  onProfessionChange,
  onCompanyChange,
  onSave,
  onCancel,
  isLoading,
  message,
}) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <User className="w-8 h-8 text-white" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-800">
          {profileData.name || 'User'}
        </h3>
        <p className="text-slate-600">
          {profileData.email || 'No email provided'}
        </p>
        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
          Premium Member
        </span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input
            key="name-input"
            type="text"
            value={profileData.name}
            onChange={onNameChange}
            placeholder="Enter your full name"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
            key="email-input"
            type="email"
            value={profileData.email}
            onChange={onEmailChange}
            placeholder="Enter your email address"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
            key="phone-input"
            type="tel"
            value={profileData.phone}
            onChange={onPhoneChange}
            placeholder="Enter your phone number"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Current City</label>
                    <select 
            key="city-select"
            value={profileData.city}
            onChange={onCityChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a city</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Pune">Pune</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Gandhinagar">Gandhinagar</option>
            <option value="Surat">Surat</option>
            <option value="Rajkot">Rajkot</option>
            <option value="Vadodara">Vadodara</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Profession</label>
          <input
            type="text"
            value={profileData.profession}
            onChange={onProfessionChange}
            placeholder="Enter your profession"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
          <input
            type="text"
            value={profileData.company}
            onChange={onCompanyChange}
            placeholder="Enter your company name"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    {/* Success/Error Message */}
    {message && (
      <div className={`p-3 rounded-lg text-sm ${
        message.includes('successfully') 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {message}
      </div>
    )}

    <div className="flex justify-end space-x-3 pt-4">
      <button 
        onClick={onCancel}
        disabled={isLoading}
        className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button 
        onClick={onSave}
        disabled={isLoading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </div>
);

export const Profile: React.FC<ProfileProps> = ({ user, onAuthRequired }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    profession: user?.profession || '',
    company: user?.company || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch profile data from Supabase when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        console.log('🔍 Fetching profile data for user:', user.email);
        
        // Get current user from Supabase
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('❌ Error getting Supabase user:', error);
          throw error;
        }

        if (currentUser) {
          // Use user metadata for profile data
          const metadata = currentUser.user_metadata || {};
          
          console.log('✅ User metadata loaded:', metadata);
          console.log('✅ User info:', { email: currentUser.email, id: currentUser.id });
          
          setProfileData({
            name: metadata.name || metadata.full_name || user.name || '',
            email: currentUser.email || user.email || '',
            phone: metadata.phone || user.phone || '',
            city: metadata.city || user.city || '',
            profession: metadata.profession || user.profession || '',
            company: metadata.company || user.company || '',
          });
        } else {
          console.log('🔍 No authenticated user found, using local user data');
          setProfileData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            city: user.city || '',
            profession: user.profession || '',
            company: user.company || '',
          });
        }
      } catch (error) {
        console.error('❌ Error fetching profile data:', error);
        // Fallback to user data on error
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          city: user.city || '',
          profession: user.profession || '',
          company: user.company || '',
        });
      }
    };

    fetchProfileData();
  }, [user]);

  // Simple change handlers that don't use useCallback
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({ ...prev, email: e.target.value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({ ...prev, phone: e.target.value }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProfileData(prev => ({ ...prev, city: e.target.value }));
  };

  const handleProfessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({ ...prev, profession: e.target.value }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({ ...prev, company: e.target.value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      console.log('🔍 Profile data to save:', profileData);
      
      // Update user metadata in Supabase
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          phone: profileData.phone,
          city: profileData.city,
          profession: profileData.profession,
          company: profileData.company,
        }
      });

      if (error) {
        console.error('❌ Supabase update error:', error);
        setMessage(error.message || 'Failed to update profile');
        return;
      }

      console.log('✅ Save successful:', data);
      setMessage('Profile updated successfully!');
      
      // Update localStorage with new user data
      const updatedUser = { 
        ...user, 
        name: profileData.name,
        phone: profileData.phone,
        city: profileData.city,
        profession: profileData.profession,
        company: profileData.company,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Profile update error:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelProfile = () => {
    // Reset form data to original user data
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        profession: user.profession || '',
        company: user.company || '',
      });
    }
    setMessage('');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];



  const PreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Budget Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Budget</label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>₹20,000 - ₹30,000</option>
              <option>₹30,000 - ₹50,000</option>
              <option>₹50,000 - ₹75,000</option>
              <option>₹75,000+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Cost-effective</option>
              <option>Quality</option>
              <option>Convenience</option>
              <option>Location</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Service Preferences</h3>
        <div className="space-y-3">
          {['Accommodation', 'Food', 'Transport', 'Coworking', 'Utilities'].map((service) => (
            <div key={service} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <span className="font-medium text-slate-700">{service}</span>
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Preferred Cities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Jaipur', 'Kolkata'].map((city) => (
            <label key={city} className="flex items-center space-x-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span className="text-sm text-slate-700">{city}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Notification Settings</h3>
        <div className="space-y-4">
          {[
            { label: 'New service recommendations', description: 'Get notified when we find services matching your preferences' },
            { label: 'Price alerts', description: 'Alert when prices drop for services in your wishlist' },
            { label: 'Weekly cost summary', description: 'Receive weekly spending analysis and tips' },
            { label: 'City updates', description: 'Updates about new services in your preferred cities' },
            { label: 'Marketing emails', description: 'Promotional offers and feature updates' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div>
                <div className="font-medium text-slate-800">{item.label}</div>
                <div className="text-sm text-slate-600">{item.description}</div>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="p-4 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-800">Password</span>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Change Password
              </button>
            </div>
            <p className="text-sm text-slate-600">Last changed 30 days ago</p>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-800">Two-Factor Authentication</span>
              <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Enabled
              </button>
            </div>
            <p className="text-sm text-slate-600">Extra security for your account</p>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-800">Login Sessions</span>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Manage Sessions
              </button>
            </div>
            <p className="text-sm text-slate-600">2 active sessions</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Profile Settings
          </h2>
          <p className="text-slate-600">
            Manage your account and preferences
          </p>
        </div>

        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Login to Access Your Profile</h3>
              <p className="text-gray-600 mb-6">
                Sign in to manage your profile, preferences, and account settings
              </p>
              <button 
                onClick={() => onAuthRequired?.()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Profile Settings
        </h2>
        <p className="text-slate-600">
          Manage your account and preferences
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <ProfileTab 
              profileData={profileData}
              onNameChange={handleNameChange}
              onEmailChange={handleEmailChange}
              onPhoneChange={handlePhoneChange}
              onCityChange={handleCityChange}
              onProfessionChange={handleProfessionChange}
              onCompanyChange={handleCompanyChange}
              onSave={handleSaveProfile}
              onCancel={handleCancelProfile}
              isLoading={isLoading}
              message={message}
            />
          )}
          {activeTab === 'preferences' && <PreferencesTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
};
