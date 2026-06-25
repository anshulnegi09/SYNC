import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './components/Home'
import Signup from './components/Signup'
import Login from './components/Login'
import ChatRoom from './components/ChatRoom'
import JoinChatRoom from './components/JoinChatRoom'
import Header from './components/Header'
import ChatDashboard from './components/ChatDashboard'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <div className="App">
      <Header />

      <div style={{ overflow: 'hidden', height: 'calc(100vh - 57px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat-rooms" element={<ChatDashboard />} />
          <Route path="/chat-room/:id" element={<ChatRoom />} />
          <Route path="/join/:joinLink" element={<JoinChatRoom />} />
        </Routes>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: 'rgba(20, 20, 28, 0.95)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          color: '#e2e8f0',
          fontSize: '14px',
        }}
      />
    </div>
  )
}

export default App