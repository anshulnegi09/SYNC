import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, MessageSquare, X, Camera, Upload, Edit2, Check } from 'lucide-react'
import { gql, useMutation } from '@apollo/client'
import { toast } from 'react-toastify'

const UPDATE_PROFILE_PICTURE = gql`
  mutation UpdateProfilePicture($userId: ID!, $profilePicture: String!) {
    updateProfilePicture(userId: $userId, profilePicture: $profilePicture) {
      id
      username
      profilePicture
    }
  }
`;

const UPDATE_USERNAME = gql`
  mutation UpdateUsername($userId: ID!, $username: String!) {
    updateUsername(userId: $userId, username: $username) {
      id
      username
    }
  }
`;

const Header = () => {
  const [username, setUsername] = useState(localStorage.getItem('username'))
  const [email, setEmail] = useState(localStorage.getItem('email'))
  const [profilePicture, setProfilePicture] = useState(localStorage.getItem('profilePicture'))
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [newPicture, setNewPicture] = useState(null)
  
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  
  const userId = localStorage.getItem('userId')
  const navigate = useNavigate()

  const [updateProfilePicture, { loading: updatingPic }] = useMutation(UPDATE_PROFILE_PICTURE)
  const [updateUsername, { loading: updatingUsername }] = useMutation(UPDATE_USERNAME)

  useEffect(() => {
    const handleProfileUpdate = () => {
      setUsername(localStorage.getItem('username'))
      setEmail(localStorage.getItem('email'))
      setProfilePicture(localStorage.getItem('profilePicture'))
    }
    window.addEventListener('profileUpdated', handleProfileUpdate)
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
    localStorage.removeItem('email')
    localStorage.removeItem('profilePicture')
    window.dispatchEvent(new Event('profileUpdated'))
    navigate('/')
  }

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Compress image client-side to prevent 413 Payload Too Large
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let { width, height } = img;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // Convert to WebP or JPEG for massive size reduction
        setNewPicture(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePicture = async () => {
    if (!newPicture) return;
    try {
      const res = await updateProfilePicture({ variables: { userId, profilePicture: newPicture } });
      localStorage.setItem('profilePicture', res.data.updateProfilePicture.profilePicture);
      window.dispatchEvent(new Event('profileUpdated'));
      toast.success('Profile picture updated!');
      setNewPicture(null);
    } catch (error) {
      toast.error('Failed to update profile picture.');
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername === username) {
      setIsEditingUsername(false);
      return;
    }
    try {
      const res = await updateUsername({ variables: { userId, username: newUsername } });
      localStorage.setItem('username', res.data.updateUsername.username);
      window.dispatchEvent(new Event('profileUpdated'));
      toast.success('Username updated!');
      setIsEditingUsername(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update username.');
    }
  };

  return (
    <header className="w-full z-50 border-b border-white/5 glass sticky top-0">
      <nav className="container mx-auto flex justify-between items-center px-6 py-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="https://i.imgur.com/6186lid.png"
            alt="Sync"
            className="h-9 w-auto transition-transform duration-300 group-hover:scale-110"
          />
          <span className="text-xl font-bold text-white tracking-wide">SYNC</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {username ? (
            <>
              {/* Go to chats */}
              <Link
                to="/chat-rooms"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                Chats
              </Link>

              {/* Avatar + name (Clickable) */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm text-gray-200 hover:bg-white/5 transition-all duration-200 border-0"
              >
                <div className="relative">
                  {profilePicture && profilePicture !== 'null' ? (
                    <img src={profilePicture} alt={username} className="w-6 h-6 rounded-full object-cover border border-[#0f0f13]" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-[#0f0f13] rounded-full" />
                </div>
                <span className="hidden sm:block font-medium">{username}</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border-0 bg-transparent"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn-glow px-4 py-2 text-sm font-medium text-white rounded-full"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── User Profile Modal (Rendered via Portal to avoid CSS filter clipping) ── */}
      {showProfileModal && createPortal(
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm"
          onClick={() => { setShowProfileModal(false); setNewPicture(null); }}
          style={{ animation: 'fadeIn 0.2s ease' }}
        >
          <div
            className="glass-strong rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setShowProfileModal(false); setNewPicture(null); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white border-0 bg-transparent p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 mt-2">
              <h3 className="text-white font-bold text-lg">Your Profile</h3>
            </div>

            {/* Avatar Preview & Update */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                {(newPicture || (profilePicture && profilePicture !== 'null')) ? (
                  <img
                    src={newPicture || profilePicture}
                    alt={username}
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/40 shadow-lg shadow-purple-500/20 transition-all duration-300"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-purple-500/40 shadow-lg shadow-purple-500/20">
                    {username?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Upload overlay */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" onChange={handlePictureChange} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Click the avatar to change your picture
              </p>
            </div>

            {/* Save Picture Button (only shows when a new picture is selected) */}
            {newPicture && (
              <div className="flex justify-center mb-6">
                <button
                  onClick={handleUpdatePicture}
                  disabled={updatingPic}
                  className="btn-glow px-5 py-2 rounded-xl text-sm font-medium text-white border-0 w-full disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {updatingPic ? 'Saving...' : 'Save New Picture'}
                </button>
              </div>
            )}

            {/* Info Section */}
            <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Username</p>
                {isEditingUsername ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full px-3 py-1.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateUsername}
                      disabled={updatingUsername}
                      className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors border-0"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditingUsername(false)}
                      className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors border-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group/edit">
                    <p className="text-gray-200 font-medium">{username}</p>
                    <button
                      onClick={() => {
                        setNewUsername(username);
                        setIsEditingUsername(true);
                      }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white opacity-0 group-hover/edit:opacity-100 transition-all border-0 bg-transparent"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                <p className="text-gray-200 font-medium">{email || 'Not provided'}</p>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </header>
  )
}

export default Header
