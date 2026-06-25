import React from 'react';
import { useParams } from 'react-router-dom';
import ChatPanel from './ChatPanel';

/**
 * ChatRoom — route wrapper for /chat-room/:id
 * Just reads the ID from the URL and passes it to ChatPanel.
 */
const ChatRoom = () => {
  const { id: chatRoomId } = useParams();
  return (
    <div className="h-full">
      <ChatPanel chatRoomId={chatRoomId} />
    </div>
  );
};

export default ChatRoom;