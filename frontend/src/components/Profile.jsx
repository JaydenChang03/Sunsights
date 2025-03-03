import React, { useState, useEffect, useCallback } from 'react';
import { PencilIcon, CameraIcon, MapPinIcon, ChartBarIcon, PhotoIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from '../config/axios';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    location: '',
    bio: '',
    avatar_url: '',
    cover_url: '',
    stats: {
      photos: 0,
      followers: 0,
      following: 0
    },
    recentActivity: [],
    achievements: []
  });
  
  // Use useCallback to memoize the fetchProfile function
  const fetchProfile = useCallback(async () => {
    try {
      console.log('Fetching profile data...');
      setLoading(true);
      
      const response = await axios.get('/api/profile');
      console.log('Profile data received:', response.data);
      
      // Process the API response data
      const profileData = response.data;
      
      // Parse JSON strings if they're returned as strings from the API
      let stats = profileData.stats;
      let recentActivity = profileData.recentActivity;
      
      // Handle potential JSON strings from the backend
      if (typeof stats === 'string') {
        try {
          stats = JSON.parse(stats);
        } catch (e) {
          console.warn('Could not parse stats JSON:', e);
          stats = { photos: 0, followers: 0, following: 0 };
        }
      }
      
      if (typeof recentActivity === 'string') {
        try {
          recentActivity = JSON.parse(recentActivity);
        } catch (e) {
          console.warn('Could not parse recentActivity JSON:', e);
          recentActivity = [];
        }
      }
      
      // Ensure recentActivity is an array
      if (!Array.isArray(recentActivity)) {
        recentActivity = [];
      }
      
      // Set the profile state with properly formatted data
      setProfile({
        name: profileData.name || '',
        title: profileData.title || '',
        location: profileData.location || '',
        bio: profileData.bio || '',
        avatar_url: profileData.avatar_url || '',
        cover_url: profileData.cover_url || '',
        stats: stats || { photos: 0, followers: 0, following: 0 },
        recentActivity: recentActivity,
        achievements: [
          { id: 1, title: 'Early Adopter', description: 'Joined Sunsights in its early days', icon: ClockIcon },
          { id: 2, title: 'Photo Enthusiast', description: 'Analyzed 10+ photos', icon: PhotoIcon },
          { id: 3, title: 'Community Member', description: 'Connected with other photographers', icon: UserGroupIcon }
        ]
      });
    } catch (error) {
      console.error('Error in profile component:', error);
      toast.error('Failed to load profile data. Please try again later.');
      
      // Set minimal default data if API call fails
      setProfile({
        name: 'User',
        title: 'Sunsights User',
        location: 'Unknown',
        bio: 'No bio available',
        avatar_url: '',
        cover_url: '',
        stats: {
          photos: 0,
          followers: 0,
          following: 0
        },
        achievements: [
          { id: 1, title: 'New User', description: 'Joined Sunsights', icon: ClockIcon }
        ],
        recentActivity: [
          { id: 1, description: 'Joined Sunsights', time: 'Recently' }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    try {
      setIsEditing(false);
      
      // Format the data for the API
      const dataToSend = {
        name: profile.name,
        title: profile.title,
        location: profile.location,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        cover_url: profile.cover_url,
        stats: profile.stats,
        recentActivity: profile.recentActivity
      };
      
      // Send the update to the API
      await axios.put('/api/profile', dataToSend);
      toast.success('Profile updated successfully');
      
      // Refresh the profile data
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again later.');
    }
  };

  // Handle image upload
  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      toast.loading('Uploading image...');
      
      // In a real app, you would upload to a server endpoint
      // For now, we'll simulate by creating a local URL
      const imageUrl = URL.createObjectURL(file);
      
      // Update the profile with the new image URL
      if (type === 'avatar') {
        setProfile({
          ...profile,
          avatar_url: imageUrl
        });
      } else if (type === 'cover') {
        setProfile({
          ...profile,
          cover_url: imageUrl
        });
      }
      
      toast.dismiss();
      toast.success('Image updated');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.dismiss();
      toast.error('Failed to upload image');
    }
  };

  const content = (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-surface rounded-xl shadow-lg overflow-hidden border border-primary/10">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-primary to-primary-dark relative">
            {profile.cover_url && (
              <img 
                src={profile.cover_url} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )}
            <input
              type="file"
              id="cover-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'cover')}
            />
            <label htmlFor="cover-upload" className="absolute bottom-4 right-4 bg-surface/80 backdrop-blur-sm text-secondary px-4 py-2 rounded-lg hover:bg-surface transition-all flex items-center gap-2 group cursor-pointer">
              <CameraIcon className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
              <span>Edit Cover</span>
            </label>
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Profile Image */}
            <div className="absolute -top-16 left-6">
              <div className="relative group">
                <img
                  src={profile.avatar_url || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-32 h-32 rounded-xl object-cover border-4 border-surface shadow-xl group-hover:border-accent/20 transition-colors"
                />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'avatar')}
                />
                <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 bg-accent text-primary-dark p-2 rounded-lg hover:bg-accent-dark transition-all cursor-pointer">
                  <CameraIcon className="h-4 w-4" />
                </label>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-20">
              <div className="flex justify-between items-start mb-6">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="bg-background text-secondary text-2xl font-bold px-3 py-1 rounded-lg mb-1 border border-primary/20 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-secondary">{profile.name}</h2>
                  )}
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="bg-background text-accent px-3 py-1 rounded-lg border border-primary/20 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                    />
                  ) : (
                    <p className="text-accent">{profile.title}</p>
                  )}
                  <div className="flex items-center mt-1 text-secondary/70">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="bg-background text-secondary px-3 py-1 rounded-lg border border-primary/20 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                      />
                    ) : (
                      profile.location
                    )}
                  </div>
                </div>
                <button
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  className="bg-surface text-secondary px-4 py-2 rounded-lg hover:bg-accent hover:text-primary-dark transition-all flex items-center gap-2 border border-primary/10 hover:border-accent"
                >
                  <PencilIcon className="h-4 w-4" />
                  {isEditing ? 'Save Profile' : 'Edit Profile'}
                </button>
              </div>

              {/* Bio */}
              <div className="mb-6">
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-background text-secondary p-3 rounded-lg border border-primary/20 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                    rows="3"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-secondary/80">{profile.bio}</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-background p-4 rounded-lg border border-primary/10 hover:border-accent/20 transition-all group">
                  <div className="text-2xl font-bold text-accent group-hover:scale-105 transition-transform">
                    {profile.stats.photos}
                  </div>
                  <div className="text-secondary/70">Photos</div>
                </div>
                <div className="bg-background p-4 rounded-lg border border-primary/10 hover:border-accent/20 transition-all group">
                  <div className="text-2xl font-bold text-accent group-hover:scale-105 transition-transform">
                    {profile.stats.followers}
                  </div>
                  <div className="text-secondary/70">Followers</div>
                </div>
                <div className="bg-background p-4 rounded-lg border border-primary/10 hover:border-accent/20 transition-all group">
                  <div className="text-2xl font-bold text-accent group-hover:scale-105 transition-transform">
                    {profile.stats.following}
                  </div>
                  <div className="text-secondary/70">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-surface rounded-xl p-6 shadow-lg border border-primary/10">
          <h3 className="text-xl font-semibold text-secondary mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-6 w-6 text-accent" />
            Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.achievements.map((achievement) => (
              <div key={achievement.id} className="bg-background p-4 rounded-lg border border-primary/10 hover:border-accent/20 transition-all group">
                <div className="flex items-center gap-3">
                  <achievement.icon className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-medium text-secondary">{achievement.title}</h4>
                    <p className="text-sm text-secondary/70">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-surface rounded-xl p-6 shadow-lg border border-primary/10">
          <h3 className="text-xl font-semibold text-secondary mb-4 flex items-center gap-2">
            <ClockIcon className="h-6 w-6 text-accent" />
            Recent Activity
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {profile.recentActivity && profile.recentActivity.length > 0 ? (
              profile.recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="bg-background p-4 rounded-lg border border-primary/10 hover:border-accent/20 transition-all flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-accent group-hover:scale-150 transition-transform"></div>
                    <span className="text-secondary/80">{activity.description}</span>
                  </div>
                  <div className="text-secondary/50 text-sm">{activity.time}</div>
                </div>
              ))
            ) : (
              <div className="bg-background p-4 rounded-lg border border-primary/10 text-center text-secondary/50">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return content;
};

export default Profile;
