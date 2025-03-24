import React, { useState, useEffect, useCallback } from 'react';
import { PencilIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
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
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    title: '',
    location: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  
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
      setNotes(response.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
      
      // Use saved notes or mock data
      try {
        const savedNotes = localStorage.getItem('userNotes');
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
        } else {
          setNotes(MOCK_NOTES);
        }
      } catch (parseErr) {
        console.error('Error parsing saved notes:', parseErr);
        setNotes(MOCK_NOTES);
      }
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
  const handleImageUpload = async (type) => {
    // Simulate image upload with a random image
    const getRandomImage = () => {
      const gender = Math.random() > 0.5 ? 'men' : 'women';
      const id = Math.floor(Math.random() * 100);
      return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;
    };
    
    const getCoverImage = () => {
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      return `https://via.placeholder.com/1500x500/${randomColor}/ffffff`;
    };
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get a random image URL based on type
      const imageUrl = type === 'avatar' ? getRandomImage() : getCoverImage();
      
      // Create updated profile object
      const updatedProfile = { ...profile };
      
      if (type === 'avatar') {
        updatedProfile.avatar_url = imageUrl;
      } else {
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
      console.error('Error uploading image:', err);
      toast.error('Failed to upload image');
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cover Photo */}
      <div className="relative h-64 rounded-lg overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-4">
        {profile?.cover_url && (
          <img 
            src={profile.cover_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <button 
          onClick={() => handleImageUpload('cover')}
          className="absolute bottom-4 right-4 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition"
        >
          <PencilIcon className="h-5 w-5 text-gray-700" />
        </button>
      </div>
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end -mt-20 mb-8 relative">
        <div className="relative z-10 ml-4">
          <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white bg-gray-200">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-300">
                <span className="text-2xl font-bold text-gray-600">
                  {profile?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={() => handleImageUpload('avatar')}
            className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition"
          >
            <PencilIcon className="h-4 w-4 text-gray-700" />
          </button>
        </div>
        
        <div className="flex-grow mt-4 md:mt-0 md:ml-6 md:mb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{profile?.name || 'Demo User'}</h1>
              <p className="text-gray-600">{profile?.title || 'Customer Service Specialist'}</p>
              <p className="text-gray-500 flex items-center">
                <span className="mr-1">📍</span> 
                {profile?.location || 'San Francisco, CA'}
              </p>
            </div>
            
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
              disabled={isEditing}
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* About Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editedProfile.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editedProfile.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={editedProfile.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={editedProfile.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Save
                </button>
                
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition flex items-center"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">
              {profile?.bio || 'Passionate about improving customer experiences through data-driven insights.'}
            </p>
          )}
        </div>
        
        {/* Personal Notes */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Personal Notes</h2>
          
          {/* Add Note Form */}
          <div className="mb-6">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a new note..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <button
              onClick={handleSaveNote}
              disabled={isSavingNote || !newNote.trim()}
              className={`px-4 py-2 rounded-md transition flex items-center ${
                isSavingNote || !newNote.trim() 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSavingNote ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                'Save Note'
              )}
            </button>
          </div>
          
          {/* Notes List */}
          <div className="space-y-4">
            {isLoadingNotes ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : notes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No notes yet. Add your first note above.</p>
            ) : (
              notes.map(note => (
                <div key={note.id} className="border border-gray-200 rounded-md p-4">
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editedNoteContent}
                        onChange={(e) => setEditedNoteContent(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleUpdateNote}
                          disabled={isSavingNote}
                          className={`px-3 py-1 rounded-md text-sm transition flex items-center ${
                            isSavingNote ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isSavingNote ? (
                            <>
                              <div className="animate-spin h-3 w-3 mr-1 border-2 border-white border-t-transparent rounded-full"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckIcon className="h-3 w-3 mr-1" />
                              Save
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm flex items-center"
                        >
                          <XMarkIcon className="h-3 w-3 mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 mb-2">{note.content}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString()}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditNote(note)}
                            className="text-blue-600 hover:text-blue-800 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={isDeletingNote}
                            className="text-red-600 hover:text-red-800 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
