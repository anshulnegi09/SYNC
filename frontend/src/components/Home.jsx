import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const username = localStorage.getItem('username')

  return (
    <div className="relative min-h-screen bg-[#0f0f13] flex flex-col overflow-hidden">

      {/* Animated background orbs */}
      <div className="orb w-[500px] h-[500px] bg-purple-700/20 top-[-100px] left-[-150px] animate-[float_8s_ease-in-out_infinite]" />
      <div className="orb w-[400px] h-[400px] bg-indigo-600/15 bottom-[-80px] right-[-100px] animate-[float_10s_ease-in-out_infinite_2s]" />
      <div className="orb w-[250px] h-[250px] bg-violet-500/10 top-[40%] left-[50%] animate-[float_6s_ease-in-out_infinite_1s]" />

      {/* Dotted grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(168,85,247,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Main content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4">
        <div className="text-center max-w-3xl mx-auto">
          {/* Headline */}
          <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Sync up your{' '}
            <span>conversations</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Private rooms, instant delivery, live subscriptions, SYNC keeps your team connected in real time.
          </p>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to={username ? '/chat-rooms' : '/signup'}
              className="bg-white text-black px-8 py-3.5 text-base font-semibold rounded-full hover:bg-gray-200 transition-all duration-300"
            >
              {username ? '🚀 Go to Chats' : 'Get Started Free'}
            </Link>
            {!username && (
              <Link
                to="/login"
                className="px-8 py-3.5 text-base font-semibold text-gray-300 rounded-full border border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-4 border-t border-white/5">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          © 2025 SYNC — WDP Major Project
        </div>
      </footer>
    </div>
  )
}

export default Home