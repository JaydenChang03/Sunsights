import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  CameraIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import axios from '../config/axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchNotes();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('Profile: Attempting to fetch profile from /api/auth/profile');
      const response = await axios.get('/api/auth/profile');
      console.log('Profile: Successfully fetched profile:', response.data);
      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        bio: response.data.bio || ''
      });
    } catch (error) {
      console.error('Profile: Error fetching profile:', error);
      console.error('Profile: Error response:', error.response?.data);
      console.error('Profile: Error status:', error.response?.status);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      console.log('Profile: Attempting to fetch notes from /api/notes');
      const response = await axios.get('/api/notes');
      console.log('Profile: Successfully fetched notes:', response.data);
      setNotes(response.data || []);
    } catch (error) {
      console.error('Profile: Error fetching notes:', error);
      console.error('Profile: Error response:', error.response?.data);
      console.error('Profile: Error status:', error.response?.status);
      toast.error('Failed to load notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log('Profile: Attempting to save profile to /api/auth/profile');
      const response = await axios.put('/api/auth/profile', formData);
      console.log('Profile: Successfully saved profile:', response.data);
      setUser(response.data.user);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile: Error updating profile:', error);
      console.error('Profile: Error response:', error.response?.data);
      console.error('Profile: Error status:', error.response?.status);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      bio: user.bio || ''
    });
    setEditing(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    console.log('Profile: Avatar upload started, file:', file);
    
    if (!file) {
      console.log('Profile: No file selected for avatar upload');
      return;
    }

    console.log('Profile: File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    if (file.size > 5 * 1024 * 1024) {
      console.log('Profile: File too large:', file.size);
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    
    console.log('Profile: FormData created, making request to /api/auth/upload-avatar');

    try {
      const response = await axios.post('/api/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Profile: Avatar upload successful:', response.data);
      setUser(prev => ({ ...prev, avatar: response.data.avatar }));
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Profile: Avatar upload error:', error);
      console.error('Profile: Avatar upload error response:', error.response?.data);
      console.error('Profile: Avatar upload error status:', error.response?.status);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleAddNote = async () => {
    console.log('Profile: Adding note, content:', newNote);
    
    if (!newNote.trim()) {
      console.log('Profile: Note content is empty');
      toast.error('Please enter a note');
      return;
    }

    setAddingNote(true);
    console.log('Profile: Making request to /api/notes with content:', newNote);
    
    try {
      const response = await axios.post('/api/notes', {
        content: newNote
      });
      console.log('Profile: Note added successfully:', response.data);
      setNotes(prev => [response.data, ...prev]);
      setNewNote('');
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Profile: Error adding note:', error);
      console.error('Profile: Note error response:', error.response?.data);
      console.error('Profile: Note error status:', error.response?.status);
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    console.log('Profile: Deleting note with ID:', noteId);
    
    try {
      await axios.delete(`/api/notes/${noteId}`);
      console.log('Profile: Note deleted successfully');
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Profile: Error deleting note:', error);
      console.error('Profile: Delete note error response:', error.response?.data);
      console.error('Profile: Delete note error status:', error.response?.status);
      toast.error('Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Profile</h1>
          <p className="text-text-muted">Manage your account settings and preferences</p>
        </div>

        {/* Profile Header */}
        <div className="card p-6 mb-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-bg-light overflow-hidden flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-text-muted" />
                )}
              </div>
              
              {/* Upload Button */}
              <label className="absolute bottom-0 right-0 bg-primary text-bg rounded-full p-2 cursor-pointer hover:bg-primary/80 transition-colors">
                <CameraIcon className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
              
              {uploading && (
                <div className="absolute inset-0 bg-bg/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-b-2 border-primary"></div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {editing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field text-2xl font-bold"
                    placeholder="Your name"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                    placeholder="Your email"
                  />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="input-field h-24"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-text mb-2">{user?.name || 'Anonymous User'}</h2>
                  <p className="text-text-muted mb-4">{user?.email}</p>
                  {user?.bio && (
                    <p className="text-text">{user.bio}</p>
                  )}
                </div>
              )}
            </div>

            {/* Edit Button */}
            <div className="flex space-x-2">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="btn-primary"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-bg-light text-text rounded-xl hover:bg-bg-light/80 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-text mb-4">Personal Notes</h3>
          
          {/* Add Note */}
          <div className="card p-4 mb-6">
            <div className="flex space-x-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a personal note..."
                className="input-field flex-1 h-20"
              />
              <button
                onClick={handleAddNote}
                disabled={addingNote || !newNote.trim()}
                className="btn-primary h-fit disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingNote ? (
                  <div className="animate-spin h-4 w-4 border-b-2 border-bg"></div>
                ) : (
                  <PlusIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Notes List */}
          {loadingNotes ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="card p-4 animate-pulse">
                  <div className="h-4 bg-bg-light rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-bg-light rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="card p-4 text-center">
              <p className="text-text-muted">No notes yet. Add your first note above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="card p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-text">{note.content}</p>
                      <p className="text-sm text-text-muted mt-2">
                        {new Date(note.createdAt || note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-danger hover:text-danger/80 ml-4"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
