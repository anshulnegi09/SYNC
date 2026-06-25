import React from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'

const Header = () => {
  const username = localStorage.getItem('username')
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
    navigate('/')
  }

  return (
    <header className="w-full p-4 bg-gray-900  top-0 z-50" >
      <nav className="container mx-auto flex justify-between items-center">
        {username ? (
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="https://i.imgur.com/6186lid.png" 
              alt="Sync" 
              className="h-12 w-auto" 
            />
            <span className="text-2xl font-bold text-white">SYNC</span>
          </Link>
        ) : (
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="https://i.imgur.com/6186lid.png" 
              alt="Sync" 
              className="h-12 w-auto" 
            />
            <span className="text-2xl font-bold text-white">SYNC</span>
          </Link>
        )}
        {/* <div>
        <Switch />

        </div> */}
        <div className="space-x-4">
          {username ? (
            <div>
              <span className="text-white">Welcome {username} </span>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/Login"
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header
