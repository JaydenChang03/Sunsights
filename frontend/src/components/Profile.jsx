import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile data...');
      const response = await axios.get('/api/profile');
      console.log('Profile data received:', response.data);
      setProfile({
        ...response.data,
        achievements: [
          { id: 1, title: 'Early Adopter', description: 'Joined Sunsights in its early days', icon: ClockIcon },
          { id: 2, title: 'Photo Enthusiast', description: 'Analyzed 10+ photos', icon: PhotoIcon },
          { id: 3, title: 'Community Member', description: 'Connected with other photographers', icon: UserGroupIcon }
        ],
        recentActivity: [
          { id: 1, description: 'Analyzed a new photo', time: '2 hours ago' },
          { id: 2, description: 'Updated profile information', time: '1 day ago' },
          { id: 3, description: 'Joined Sunsights', time: '1 week ago' }
        ]
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put('/api/profile', profile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const content = (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-surface rounded-xl shadow-lg overflow-hidden border border-primary/10">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-primary to-primary-dark relative">
            <button className="absolute bottom-4 right-4 bg-surface/80 backdrop-blur-sm text-secondary px-4 py-2 rounded-lg hover:bg-surface transition-all flex items-center gap-2 group">
              <CameraIcon className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
              <span>Edit Cover</span>
            </button>
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
                <button className="absolute bottom-2 right-2 bg-accent text-primary-dark p-2 rounded-lg hover:bg-accent-dark transition-all">
                  <CameraIcon className="h-4 w-4" />
                </button>
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
          <div className="space-y-4">
            {profile.recentActivity.map((activity) => (
              <div key={activity.id} className="bg-background p-4 rounded-lg border border-primary/10 hover:border-accent/20 transition-all flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-accent group-hover:scale-150 transition-transform"></div>
                  <span className="text-secondary/80">{activity.description}</span>
                </div>
                <div className="text-secondary/50 text-sm">{activity.time}</div>
              </div>
            ))}
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
