import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PencilIcon, CameraIcon, UserCircleIcon, MapPinIcon, BriefcaseIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PaperClipIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/solid';
import axios from '../config/axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get('/api/profile');
      const profileData = response.data;
      
      // Parse JSON strings if they come as strings
      let parsedStats = profileData.stats;
      let parsedActivity = profileData.recentActivity;
      
      if (typeof profileData.stats === 'string') {
        try {
          parsedStats = JSON.parse(profileData.stats);
        } catch (e) {
          console.error('Failed to parse stats JSON:', e);
          parsedStats = { photos: 0, followers: 0, following: 0 };
        }
      }
      
      if (typeof profileData.recentActivity === 'string') {
        try {
          parsedActivity = JSON.parse(profileData.recentActivity);
        } catch (e) {
          console.error('Failed to parse recentActivity JSON:', e);
          parsedActivity = [];
        }
      }
      
      // Ensure activity is an array
      if (!Array.isArray(parsedActivity)) {
        parsedActivity = [];
      }
      
      setProfile({
        ...profileData,
        stats: undefined,
        recentActivity: undefined
      });
      
      setStats(parsedStats || { photos: 0, followers: 0, following: 0 });
      setRecentActivity(parsedActivity || []);
      setEditedProfile({
        name: profileData.name,
        title: profileData.title,
        location: profileData.location,
        bio: profileData.bio
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
      toast.error('Failed to load profile data');
      
      // Fallback data for development or when API is unavailable
      setProfile({
        name: 'Demo User',
        title: 'Sentiment Analyst',
        location: 'San Francisco, CA',
        bio: 'This is a fallback profile shown when the API is unavailable.',
        avatar_url: null,
        cover_url: null
      });
      
      setStats({ 
        photos: 0, 
        followers: 0, 
        following: 0 
      });
      
      setRecentActivity([]);
      
      setEditedProfile({
        name: 'Demo User',
        title: 'Sentiment Analyst',
        location: 'San Francisco, CA',
        bio: 'This is a fallback profile shown when the API is unavailable.'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch analytics summary
  const fetchAnalyticsSummary = useCallback(async () => {
    setIsLoadingAnalytics(true);
    
    try {
      const response = await axios.get('/api/analytics/summary');
      setAnalyticsSummary({
        averageSentiment: parseFloat(response.data.averageSentiment || 0).toFixed(2),
        responseRate: '85%', // This would come from the API in a real implementation
        avgResponseTime: '4.2 hours', // This would come from the API in a real implementation
        highPriorityCases: '12%' // This would come from the API in a real implementation
      });
    } catch (err) {
      console.error('Error fetching analytics summary:', err);
      // Fallback data when API fails
      setAnalyticsSummary({
        averageSentiment: "0.00",
        responseRate: "0%",
        avgResponseTime: "N/A",
        highPriorityCases: "0%"
      });
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    setIsLoadingNotes(true);
    
    try {
      const response = await axios.get('/api/notes');
      setNotes(response.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
      toast.error('Failed to load notes');
      
      // Fallback empty notes array when API fails
      setNotes([]);
    } finally {
      setIsLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    // Wrap in a try-catch to prevent unhandled promise rejections
    const fetchData = async () => {
      try {
        await fetchProfile();
        await fetchAnalyticsSummary();
        await fetchNotes();
      } catch (error) {
        console.error("Error in data fetching:", error);
      }
    };
    
    fetchData();
  }, [fetchProfile, fetchAnalyticsSummary, fetchNotes]);

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      const updatedProfile = {
        ...profile,
        ...editedProfile,
        stats: stats,
        recentActivity: recentActivity
      };
      
      await axios.put('/api/profile', updatedProfile);
      setProfile({
        ...profile,
        ...editedProfile
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
      
      // Refresh profile data
      fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    }
  };

  // Handle image upload
  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    setUploadType(type);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      // In a production environment, you would upload to a server
      // For now, we'll use a local URL and update the profile directly
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const imageUrl = e.target.result;
        
        try {
          // Update the profile with the new image URL
          if (type === 'avatar') {
            // In a real app, you would send the file to the server
            await axios.put('/api/profile', {
              ...profile,
              avatar_url: imageUrl
            });
            
            setProfile({
              ...profile,
              avatar_url: imageUrl
            });
            
            // Update recent activity
            const now = new Date().toISOString();
            const newActivity = {
              description: "Updated profile picture",
              time: now
            };
            
            const updatedActivity = [newActivity, ...recentActivity];
            setRecentActivity(updatedActivity);
            
            toast.success('Profile picture updated');
          } else if (type === 'cover') {
            // In a real app, you would send the file to the server
            await axios.put('/api/profile', {
              ...profile,
              cover_url: imageUrl
            });
            
            setProfile({
              ...profile,
              cover_url: imageUrl
            });
            
            // Update recent activity
            const now = new Date().toISOString();
            const newActivity = {
              description: "Updated cover photo",
              time: now
            };
            
            const updatedActivity = [newActivity, ...recentActivity];
            setRecentActivity(updatedActivity);
            
            toast.success('Cover photo updated');
          }
        } catch (err) {
          console.error(`Error updating ${type}:`, err);
          toast.error(`Failed to update ${type}`);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(`Error uploading ${type} image:`, err);
      toast.error(`Failed to upload ${type} image`);
    } finally {
      setIsUploading(false);
      setUploadType(null);
    }
  };

  // Handle saving a new note
  const handleSaveNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }
    
    setIsSavingNote(true);
    
    try {
      const response = await axios.post('/api/notes', {
        content: newNote
      });
      
      // Add the new note to the notes list
      setNotes([response.data, ...notes]);
      
      // Clear the input
      setNewNote('');
      
      // Update stats to reflect the new note count
      if (stats) {
        const updatedStats = { ...stats };
        updatedStats.followers = (updatedStats.followers || 0) + 1;
        setStats(updatedStats);
      }
      
      toast.success('Note saved');
    } catch (err) {
      console.error('Error saving note:', err);
      toast.error('Failed to save note');
    } finally {
      setIsSavingNote(false);
    }
  };
  
  // Handle editing a note
  const handleEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditedNoteContent(note.content);
  };
  
  // Handle updating a note
  const handleUpdateNote = async () => {
    if (!editedNoteContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }
    
    setIsSavingNote(true);
    
    try {
      const response = await axios.put(`/api/notes/${editingNoteId}`, {
        content: editedNoteContent
      });
      
      // Update the note in the notes list
      const updatedNotes = notes.map(note => 
        note.id === editingNoteId 
          ? { ...note, content: editedNoteContent, updatedAt: response.data.updatedAt }
          : note
      );
      
      setNotes(updatedNotes);
      setEditingNoteId(null);
      setEditedNoteContent('');
      
      toast.success('Note updated');
    } catch (err) {
      console.error('Error updating note:', err);
      toast.error('Failed to update note');
    } finally {
      setIsSavingNote(false);
    }
  };
  
  // Handle canceling note edit
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditedNoteContent('');
  };
  
  // Handle deleting a note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    setIsDeletingNote(true);
    
    try {
      await axios.delete(`/api/notes/${noteId}`);
      
      // Remove the note from the notes list
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      
      // Update stats to reflect the reduced note count
      if (stats) {
        const updatedStats = { ...stats };
        updatedStats.followers = Math.max((updatedStats.followers || 0) - 1, 0);
        setStats(updatedStats);
      }
      
      toast.success('Note deleted');
    } catch (err) {
      console.error('Error deleting note:', err);
      toast.error('Failed to delete note');
    } finally {
      setIsDeletingNote(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return timestamp; // Return as is if not a valid date
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp || 'Unknown time';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Cover Photo */}
        <div className="relative h-64 rounded-xl overflow-hidden mb-20 bg-surface">
          {profile?.cover_url ? (
            <img 
              src={profile.cover_url} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/30 to-accent/30 flex items-center justify-center">
              <p className="text-secondary opacity-50">No cover photo</p>
            </div>
          )}
          
          {/* Cover Photo Upload Button */}
          <button 
            onClick={() => coverInputRef.current.click()}
            className="absolute top-4 right-4 p-2 bg-surface/80 backdrop-blur-sm rounded-lg text-secondary hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
            disabled={isUploading}
          >
            {isUploading && uploadType === 'cover' ? (
              <div className="animate-spin h-5 w-5 border-b-2 border-accent"></div>
            ) : (
              <CameraIcon className="h-5 w-5" />
            )}
            <input 
              type="file" 
              ref={coverInputRef}
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'cover')}
            />
          </button>
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative h-32 w-32 rounded-full border-4 border-background overflow-hidden bg-surface">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-full h-full text-primary/50" />
              )}
              
              {/* Avatar Upload Button */}
              <button 
                onClick={() => avatarInputRef.current.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-accent rounded-full text-white hover:bg-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
                disabled={isUploading}
              >
                {isUploading && uploadType === 'avatar' ? (
                  <div className="animate-spin h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CameraIcon className="h-4 w-4" />
                )}
                <input 
                  type="file" 
                  ref={avatarInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'avatar')}
                />
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-xl p-6 border border-primary/10 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                      className="text-2xl font-bold text-secondary bg-background border border-primary/20 rounded-lg p-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-accent/50"
                      placeholder="Your name"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-secondary">{profile?.name || 'User'}</h1>
                  )}
                  
                  {isEditing ? (
                    <div className="flex items-center mt-2">
                      <BriefcaseIcon className="h-4 w-4 text-secondary/70 mr-2" />
                      <input
                        type="text"
                        value={editedProfile.title}
                        onChange={(e) => setEditedProfile({...editedProfile, title: e.target.value})}
                        className="text-sm text-secondary/70 bg-background border border-primary/20 rounded-lg p-1.5 w-full focus:outline-none focus:ring-2 focus:ring-accent/50"
                        placeholder="Your title"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center mt-2">
                      <BriefcaseIcon className="h-4 w-4 text-secondary/70 mr-2" />
                      <p className="text-sm text-secondary/70">{profile?.title || 'No title set'}</p>
                    </div>
                  )}
                  
                  {isEditing ? (
                    <div className="flex items-center mt-2">
                      <MapPinIcon className="h-4 w-4 text-secondary/70 mr-2" />
                      <input
                        type="text"
                        value={editedProfile.location}
                        onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                        className="text-sm text-secondary/70 bg-background border border-primary/20 rounded-lg p-1.5 w-full focus:outline-none focus:ring-2 focus:ring-accent/50"
                        placeholder="Your location"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center mt-2">
                      <MapPinIcon className="h-4 w-4 text-secondary/70 mr-2" />
                      <p className="text-sm text-secondary/70">{profile?.location || 'No location set'}</p>
                    </div>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateProfile}
                      className="p-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedProfile({
                          name: profile.name,
                          title: profile.title,
                          location: profile.location,
                          bio: profile.bio
                        });
                      }}
                      className="p-2 bg-red-500 hover:bg-red-500/80 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-secondary mb-2">About</h2>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                    className="w-full h-32 p-3 bg-background border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 text-secondary placeholder-secondary/50"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-secondary/80 whitespace-pre-wrap">{profile?.bio || 'No bio available'}</p>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background rounded-lg border border-primary/10">
                  <p className="text-2xl font-bold text-accent">{stats?.photos || 0}</p>
                  <p className="text-sm text-secondary/70">Analyses</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg border border-primary/10">
                  <p className="text-2xl font-bold text-accent">{stats?.followers || 0}</p>
                  <p className="text-sm text-secondary/70">Notes</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg border border-primary/10">
                  <p className="text-2xl font-bold text-accent">{stats?.following || 0}</p>
                  <p className="text-sm text-secondary/70">Uploads</p>
                </div>
              </div>
            </div>
            
            {/* Notes Section */}
            <div className="bg-surface rounded-xl p-6 border border-primary/10 mb-8">
              <h2 className="text-lg font-semibold text-secondary mb-4">Personal Notes</h2>
              <div className="space-y-4">
                <div className="bg-background rounded-lg p-4 border border-primary/10">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full h-32 p-3 bg-background border-none focus:outline-none focus:ring-2 focus:ring-accent/50 text-secondary placeholder-secondary/50 resize-none"
                    placeholder="Add your personal notes here..."
                    disabled={isSavingNote}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex space-x-2">
                      <p className="text-xs text-secondary/50">All notes are saved automatically to your profile</p>
                    </div>
                    <button 
                      onClick={handleSaveNote}
                      className="px-4 py-1.5 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      disabled={isSavingNote || !newNote.trim()}
                    >
                      {isSavingNote ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Note'
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Notes list with loading state */}
                {isLoadingNotes ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="bg-background rounded-lg p-4 border border-primary/10 animate-pulse">
                        <div className="h-16 bg-surface/50 rounded"></div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="h-4 w-24 bg-surface/50 rounded"></div>
                          <div className="flex space-x-2">
                            <div className="h-6 w-6 bg-surface/50 rounded"></div>
                            <div className="h-6 w-6 bg-surface/50 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notes.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-background rounded-lg p-4 border border-primary/10">
                        {editingNoteId === note.id ? (
                          <textarea
                            value={editedNoteContent}
                            onChange={(e) => setEditedNoteContent(e.target.value)}
                            className="w-full h-32 p-3 bg-background border-none focus:outline-none focus:ring-2 focus:ring-accent/50 text-secondary placeholder-secondary/50 resize-none"
                            disabled={isSavingNote}
                          />
                        ) : (
                          <p className="text-secondary/80 whitespace-pre-wrap">{note.content}</p>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-secondary/50">
                            {note.updatedAt ? 
                              `Updated ${formatTimestamp(note.updatedAt)}` : 
                              `Created ${formatTimestamp(note.createdAt)}`}
                          </p>
                          <div className="flex space-x-2">
                            {editingNoteId === note.id ? (
                              <>
                                <button 
                                  onClick={handleUpdateNote}
                                  className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-50"
                                  disabled={isSavingNote}
                                >
                                  {isSavingNote ? (
                                    <div className="animate-spin h-4 w-4 border-b-2 border-accent"></div>
                                  ) : (
                                    <CheckIcon className="h-4 w-4" />
                                  )}
                                </button>
                                <button 
                                  onClick={handleCancelEdit}
                                  className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                  disabled={isSavingNote}
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleEditNote(note)}
                                  className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                  disabled={isDeletingNote}
                                >
                                  {isDeletingNote ? (
                                    <div className="animate-spin h-4 w-4 border-b-2 border-red-500"></div>
                                  ) : (
                                    <TrashIcon className="h-4 w-4" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-background rounded-lg p-4 border border-primary/10 text-center">
                    <p className="text-secondary/50">No notes yet. Create your first note above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Recent Activity Card */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-xl p-6 border border-primary/10 h-[600px] overflow-y-auto">
              <h2 className="text-lg font-semibold text-secondary mb-4">Recent Activity</h2>
              
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="relative pl-5 pb-4 border-b border-primary/10 last:border-b-0">
                      <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-green-500"></div>
                      <p className="text-secondary/80">{activity.description}</p>
                      <div className="flex items-center mt-1 text-xs text-secondary/50">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        <span>{formatTimestamp(activity.time)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-secondary/50">No recent activity</p>
                </div>
              )}
            </div>
            
            {/* Analytics Summary */}
            <div className="bg-surface rounded-xl p-6 border border-primary/10 mt-8">
              <h2 className="text-lg font-semibold text-secondary mb-4">Analytics Summary</h2>
              
              {isLoadingAnalytics ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="flex justify-between items-center animate-pulse">
                      <div className="h-4 bg-background rounded w-1/3"></div>
                      <div className="h-4 bg-background rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : analyticsSummary ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-secondary/80">Average Sentiment</p>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <p className="text-secondary">{analyticsSummary.averageSentiment}%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-secondary/80">Response Rate</p>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <p className="text-secondary">{analyticsSummary.responseRate}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-secondary/80">Avg. Response Time</p>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                      <p className="text-secondary">{analyticsSummary.avgResponseTime}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-secondary/80">High Priority Cases</p>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                      <p className="text-secondary">{analyticsSummary.highPriorityCases}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-secondary/50">Analytics data unavailable</p>
                </div>
              )}
              
              <button 
                onClick={() => window.location.href = '/analytics'}
                className="w-full mt-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
              >
                View Full Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
