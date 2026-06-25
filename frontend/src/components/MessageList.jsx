import React, { useEffect, useRef, useState } from 'react';

const MessageList = ({ messages, onUserClick, loggedInUser }) => {
  const messagesEndRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
  );

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderAvatar = (user) =>
    user.profilePicture ? (
      <img
        src={user.profilePicture}
        alt={user.username}
        className="w-7 h-7 rounded-full object-cover border border-purple-500/40 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setSelectedUser(user)}
      />
    ) : (
      <div
        className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setSelectedUser(user)}
      >
        {user.username[0].toUpperCase()}
      </div>
    );

  // Group consecutive messages by same sender
  const grouped = sortedMessages.reduce((acc, msg, i) => {
    const prev = sortedMessages[i - 1];
    const isSameAsPrev = prev && prev.sender.username === msg.sender.username;
    acc.push({ ...msg, isSameAsPrev });
    return acc;
  }, []);

  const UserProfileModal = ({ user, onClose }) => (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.2s ease forwards' }}
    >
      <div
        className="glass-strong rounded-2xl p-8 max-w-xs w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeIn 0.25s ease forwards' }}
      >
        <div className="flex flex-col items-center gap-4">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-purple-500 shadow-lg shadow-purple-500/20"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-purple-500/20">
              {user.username[0].toUpperCase()}
            </div>
          )}
          <div className="text-center">
            <h4 className="text-xl font-bold text-white">{user.username}</h4>
            <p className="text-gray-400 text-sm mt-1">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="btn-glow px-6 py-2 rounded-full text-white text-sm font-medium border-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col space-y-1 p-4 overflow-y-auto max-h-[calc(100vh-10rem)] scrollbar-thin">
        {grouped.map((message, idx) => {
          const isOwn = message.sender.username === loggedInUser;
          const showAvatar = !isOwn && !message.isSameAsPrev;
          const showName = !isOwn && !message.isSameAsPrev;
          const marginTop = message.isSameAsPrev ? 'mt-0.5' : 'mt-3';

          return (
            <div
              key={`${message.id}-${message.sentAt}`}
              className={`flex flex-col w-full ${isOwn ? 'items-end' : 'items-start'} ${marginTop}`}
              style={{ animation: `${isOwn ? 'slideInRight' : 'slideInLeft'} 0.22s ease forwards` }}
            >
              {/* Sender name */}
              {showName && (
                <span className="text-xs text-gray-500 ml-9 mb-0.5 font-medium">
                  {message.sender.username}
                </span>
              )}

              <div className={`flex items-end gap-1.5 max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar (only for others, first in group) */}
                {!isOwn && (
                  <div className="flex-shrink-0 w-7">
                    {showAvatar ? renderAvatar(message.sender) : null}
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                    isOwn
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-sm'
                      : 'bg-gray-800 text-gray-100 rounded-bl-sm border border-white/5'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <span className={`text-[10px] mt-0.5 block ${isOwn ? 'text-purple-200/60' : 'text-gray-500'}`}>
                    {formatTime(message.sentAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {selectedUser && (
        <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </>
  );
};

export default MessageList;