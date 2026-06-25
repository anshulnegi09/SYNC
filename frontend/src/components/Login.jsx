import React, { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
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

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [login, { loading }] = useMutation(LOGIN)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    try {
      const response = await login({ variables: { email, password } })
      const { token, user } = response.data.login
      localStorage.setItem('token', token)
      localStorage.setItem('username', user.username)
      localStorage.setItem('userId', user.id)
      localStorage.setItem('email', user.email)
      localStorage.setItem('profilePicture', user.profilePicture || '')
      window.dispatchEvent(new Event('profileUpdated'))
      
      const pendingJoinLink = localStorage.getItem('pendingJoinLink')
      if (pendingJoinLink) {
        localStorage.removeItem('pendingJoinLink')
        navigate(`/join/${pendingJoinLink}`)
      } else {
        navigate('/chat-rooms')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f13] px-4 relative overflow-hidden">

      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-purple-700/20 top-[-80px] right-[-80px] pointer-events-none" />
      <div className="orb w-64 h-64 bg-indigo-600/15 bottom-[-60px] left-[-60px] pointer-events-none" />

      {/* Dotted grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(168,85,247,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-2xl" style={{ animation: 'fadeIn 0.4s ease forwards' }}>

          {/* Logo + title */}
          <div className="text-center mb-8">
            <img src="https://i.imgur.com/6186lid.png" alt="Sync" className="h-12 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to continue to SYNC</p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all duration-200 text-sm"
              />
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all duration-200 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-0 border-0 bg-transparent"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login