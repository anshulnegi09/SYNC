import React, { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, Upload } from 'lucide-react'

const SIGNUP = gql`
  mutation Signup($username: String!, $email: String!, $password: String!, $profilePicture: String) {
    signup(username: $username, email: $email, password: $password, profilePicture: $profilePicture) {
      user {
        id
        username
        email
        profilePicture
      }
      token
    }
  }
`

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    profilePicture: null,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [signup, { loading }] = useMutation(SIGNUP)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

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
        
        setFormData((prev) => ({ ...prev, profilePicture: canvas.toDataURL('image/jpeg', 0.8) }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    try {
      const response = await signup({ variables: formData })
      const { token, user } = response.data.signup
      localStorage.setItem('token', token)
      localStorage.setItem('username', user.username)
      localStorage.setItem('userId', user.id)
      localStorage.setItem('email', user.email)
      localStorage.setItem('profilePicture', user.profilePicture || '')
      // Dispatch event so other components know profile changed
      window.dispatchEvent(new Event('profileUpdated'))
      
      const pendingJoinLink = localStorage.getItem('pendingJoinLink')
      if (pendingJoinLink) {
        localStorage.removeItem('pendingJoinLink')
        navigate(`/join/${pendingJoinLink}`)
      } else {
        navigate('/chat-rooms')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Signup failed. Please try again.')
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all duration-200 text-sm'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f13] px-4 relative overflow-hidden py-10">

      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-purple-700/20 top-[-80px] left-[-80px] pointer-events-none" />
      <div className="orb w-64 h-64 bg-indigo-600/15 bottom-[-60px] right-[-60px] pointer-events-none" />

      {/* Dotted grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(168,85,247,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-strong rounded-2xl p-8 shadow-2xl" style={{ animation: 'fadeIn 0.4s ease forwards' }}>

          {/* Logo + title */}
          <div className="text-center mb-8">
            <img src="https://i.imgur.com/6186lid.png" alt="Sync" className="h-12 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-gray-400 text-sm mt-1">Join SYNC and start chatting</p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
              <input name="username" type="text" required placeholder="cooluser123" value={formData.username} onChange={handleChange} className={inputClass} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input name="email" type="email" required placeholder="you@example.com" value={formData.email} onChange={handleChange} className={inputClass} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-0 border-0 bg-transparent"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Profile picture */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Profile Picture <span className="text-gray-500">(optional)</span></label>
              <label
                htmlFor="profile-picture"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white/5 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-200 text-gray-400 hover:text-gray-300 text-sm"
              >
                {formData.profilePicture ? (
                  <div className="flex items-center gap-3">
                    <img src={formData.profilePicture} alt="Preview" className="w-8 h-8 rounded-full object-cover border-2 border-purple-500" />
                    <span className="text-purple-400">Photo selected — click to change</span>
                  </div>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Upload a photo</span>
                  </>
                )}
                <input id="profile-picture" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup