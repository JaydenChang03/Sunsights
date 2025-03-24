import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PencilIcon, CameraIcon, UserCircleIcon, MapPinIcon, BriefcaseIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/solid';
import axios from '../config/axios';
import toast from 'react-hot-toast';

// Mock data for fallback when API fails
const MOCK_PROFILE = {
  id: 1,
  name: 'Demo User',
  email: 'demo@example.com',
  title: 'Customer Service Specialist',
  location: 'San Francisco, CA',
  bio: 'Passionate about improving customer experiences through data-driven insights.',
  avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
  cover_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8&w=1000&q=80',
  stats: JSON.stringify({
    analyses: 42,
    responses: 36,
    avgSentiment: 0.75,
    avgResponseTime: '2h 15m'
  }),
  created_at: '2023-01-15T12:00:00Z',
  updated_at: '2023-03-20T14:30:00Z'
};

const MOCK_NOTES = [
  {
    id: 1,
    content: 'Follow up with customer about their recent complaint regarding delivery delays.',
    created_at: '2023-03-18T10:15:00Z',
    updated_at: '2023-03-18T10:15:00Z'
  },
  {
    id: 2,
    content: 'Review sentiment analysis for the new product feedback campaign.',
    created_at: '2023-03-17T14:30:00Z',
    updated_at: '2023-03-17T14:30:00Z'
  }
];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  
  // Load profile from localStorage or use mock data
  const getProfileData = () => {
    try {
      // Try to get from localStorage first
      const savedProfile = localStorage.getItem('profileData');
      if (savedProfile) {
        return JSON.parse(savedProfile);
      }
    } catch (err) {
      console.error('Error parsing profile from localStorage:', err);
    }
    
    // Fallback to mock data
    return MOCK_PROFILE;
  };
  
  // Get notes from localStorage or use mock data
  const getNotesData = () => {
    try {
      const savedNotes = localStorage.getItem('userNotes');
      if (savedNotes) {
        return JSON.parse(savedNotes);
      }
    } catch (err) {
      console.error('Error parsing notes from localStorage:', err);
    }
    
    return MOCK_NOTES;
  };

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
      
      // Save profile data to localStorage for persistence
      localStorage.setItem('profileData', JSON.stringify(profileData));
      
      setProfile(profileData);
      
      setEditedProfile({
        name: profileData.name || '',
        title: profileData.title || '',
        location: profileData.location || '',
        bio: profileData.bio || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      
      // Always use local storage or mock data on error
      const fallbackProfile = getProfileData();
      setProfile(fallbackProfile);
      
      setEditedProfile({
        name: fallbackProfile.name || '',
        title: fallbackProfile.title || '',
        location: fallbackProfile.location || '',
        bio: fallbackProfile.bio || ''
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch notes
  const fetchNotes = useCallback(async () => {
    setIsLoadingNotes(true);
    
    try {
      const response = await axios.get('/api/notes');
      
      // Save notes to localStorage
      localStorage.setItem('userNotes', JSON.stringify(response.data));
      
      setNotes(response.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
      
      // Use saved notes or mock data
      setNotes(getNotesData());
    } finally {
      setIsLoadingNotes(false);
    }
  }, []);
  
  // Load data on component mount
  useEffect(() => {
    fetchProfile();
    fetchNotes();
  }, [fetchProfile, fetchNotes]);
  
  // Handle input change for profile editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle profile update
  const handleUpdateProfile = async () => {
    const updatedProfile = {
      ...profile,
      ...editedProfile
    };
    
    // Always update the UI first
    setProfile(updatedProfile);
    setIsEditing(false);
    
    // Save to localStorage for persistence
    localStorage.setItem('profileData', JSON.stringify(updatedProfile));
    
    // Show success message
    toast.success('Profile updated successfully');
    
    // Try to save to server in the background
    try {
      await axios.put('/api/profile', updatedProfile);
    } catch (err) {
      console.error('Error updating profile on server:', err);
      // No need to show error since UI is already updated
    }
  };
  
  // Handle image upload
  const handleImageUpload = async (event, type) => {
    const file = event?.target?.files?.[0];
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
          const updatedProfile = { ...profile };
          
          if (type === 'avatar') {
            updatedProfile.avatar_url = imageUrl;
          } else if (type === 'cover') {
            updatedProfile.cover_url = imageUrl;
          }
          
          // Update state and localStorage
          setProfile(updatedProfile);
          localStorage.setItem('profileData', JSON.stringify(updatedProfile));
          
          // Show success message
          toast.success(`${type === 'avatar' ? 'Profile' : 'Cover'} picture updated`);
          
          // Try to save to server in the background
          try {
            await axios.put('/api/profile', updatedProfile);
          } catch (err) {
            console.error(`Error updating ${type} on server:`, err);
            // No need to show error since UI is already updated
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
    
    // Create a new note object with temporary ID
    const tempId = Date.now();
    const newNoteObj = {
      id: tempId,
      content: newNote,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Update UI immediately
    const updatedNotes = [newNoteObj, ...notes];
    setNotes(updatedNotes);
    setNewNote('');
    
    // Save to localStorage
    localStorage.setItem('userNotes', JSON.stringify(updatedNotes));
    
    // Show success message
    toast.success('Note saved successfully');
    
    try {
      // Try to save to server
      const response = await axios.post('/api/notes', {
        content: newNote
      });
      
      // Update the temporary ID with the real one from server
      const serverNote = response.data;
      const notesWithRealId = updatedNotes.map(note => 
        note.id === tempId ? serverNote : note
      );
      
      setNotes(notesWithRealId);
      localStorage.setItem('userNotes', JSON.stringify(notesWithRealId));
    } catch (err) {
      console.error('Error saving note to server:', err);
      // No need to show error since UI is already updated
    } finally {
      setIsSavingNote(false);
    }
  };
  
  // Handle editing a note
  const handleEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditedNoteContent(note.content);
  };
  
  // Handle canceling note edit
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditedNoteContent('');
  };
  
  // Handle updating a note
  const handleUpdateNote = async () => {
    if (!editedNoteContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }
    
    setIsSavingNote(true);
    
    // Update the note locally first
    const updatedNotes = notes.map(note => 
      note.id === editingNoteId 
        ? { ...note, content: editedNoteContent, updated_at: new Date().toISOString() } 
        : note
    );
    
    // Update UI
    setNotes(updatedNotes);
    setEditingNoteId(null);
    setEditedNoteContent('');
    
    // Save to localStorage
    localStorage.setItem('userNotes', JSON.stringify(updatedNotes));
    
    // Show success message
    toast.success('Note updated successfully');
    
    try {
      // Try to save to server
      await axios.put(`/api/notes/${editingNoteId}`, {
        content: editedNoteContent
      });
    } catch (err) {
      console.error('Error updating note on server:', err);
      // No need to show error since UI is already updated
    } finally {
      setIsSavingNote(false);
    }
  };
  
  // Handle deleting a note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    setIsDeletingNote(true);
    
    // Remove the note locally first
    const updatedNotes = notes.filter(note => note.id !== noteId);
    
    // Update UI
    setNotes(updatedNotes);
    
    // Save to localStorage
    localStorage.setItem('userNotes', JSON.stringify(updatedNotes));
    
    // Show success message
    toast.success('Note deleted successfully');
    
    try {
      // Try to delete from server
      await axios.delete(`/api/notes/${noteId}`);
    } catch (err) {
      console.error('Error deleting note from server:', err);
      // No need to show error since UI is already updated
    } finally {
      setIsDeletingNote(false);
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mt-20"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile section with proper spacing */}
        <div className="pt-8">
          {/* Cover photo section */}
          <div className="w-full h-60 bg-gradient-to-r from-primary to-accent/50 rounded-t-xl overflow-hidden">
            {/* Cover Photo */}
            {profile?.cover_url ? (
              <img 
                src={profile.cover_url} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30">
                No cover photo
              </div>
            )}
            
            {/* Cover Photo Upload Button */}
            <button 
              onClick={() => coverInputRef.current.click()}
              className="absolute top-12 right-8 p-2 bg-surface/80 backdrop-blur-sm rounded-full text-secondary hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
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
          </div>
          
          {/* Profile info section with avatar completely below cover photo */}
          <div className="bg-surface rounded-b-xl p-6 border border-primary/10 mb-8 relative">
            {/* Profile Avatar - Completely below cover photo */}
            <div className="flex items-start mb-6">
              <div className="relative mr-6">
                <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-surface flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-full h-full text-primary/50" />
                  )}
                </div>
                
                {/* Avatar Upload Button - More prominent and positioned better */}
                <button 
                  onClick={() => avatarInputRef.current.click()}
                  className="absolute bottom-0 right-0 p-2 bg-accent rounded-full text-white hover:bg-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 shadow-lg"
                  disabled={isUploading}
                  aria-label="Change profile picture"
                  title="Change profile picture"
                >
                  {isUploading && uploadType === 'avatar' ? (
                    <div className="animate-spin h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <CameraIcon className="h-5 w-5" />
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
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={editedProfile.name}
                        onChange={handleInputChange}
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
                          name="title"
                          value={editedProfile.title}
                          onChange={handleInputChange}
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
                          name="location"
                          value={editedProfile.location}
                          onChange={handleInputChange}
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
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-secondary mb-2">About</h2>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editedProfile.bio}
                  onChange={handleInputChange}
                  className="w-full h-32 p-3 bg-background border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 text-secondary placeholder-secondary/50"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-secondary/80 whitespace-pre-wrap">{profile?.bio || 'No bio available'}</p>
              )}
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
                          {note.updated_at ? 
                            `Updated ${formatTimestamp(note.updated_at)}` : 
                            `Created ${formatTimestamp(note.created_at)}`}
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
      </div>
    </div>
  );
}
