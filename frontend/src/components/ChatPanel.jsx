import React, { useState, useEffect } from 'react';
import { gql, useQuery, useMutation, useSubscription } from '@apollo/client';
import { toast } from 'react-toastify';
import { Link2, Check, Trash2, Camera, X, Upload, ChevronLeft } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const GET_MESSAGES = gql`
  query GetMessages($chatRoomId: ID!, $limit: Int, $offset: Int) {
    getMessages(chatRoomId: $chatRoomId, limit: $limit, offset: $offset) {
      id
      content
      sender { id username email profilePicture }
      sentAt
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($chatRoomId: ID!, $content: String!, $senderId: ID!) {
    sendMessage(chatRoomId: $chatRoomId, content: $content, senderId: $senderId) {
      id
      content
      sender { id username email profilePicture }
      sentAt
    }
  }
`;

const GET_CHAT_ROOM = gql`
  query GetChatRoom($chatRoomId: ID!) {
    getChatRoom(chatRoomId: $chatRoomId) {
      id
      name
      owner { id username email profilePicture }
      participants { id username email profilePicture }
      joinLink
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageAdded($chatRoomId: ID!) {
    messageAdded(chatRoomId: $chatRoomId) {
      id
      content
      sender { id username email profilePicture }
      sentAt
    }
  }
`;

const DELETE_CHAT_ROOM = gql`
  mutation DeleteChatRoom($chatRoomId: ID!, $userId: ID!) {
    deleteChatRoom(chatRoomId: $chatRoomId, userId: $userId)
  }
`;



const ChatPanel = ({ chatRoomId, onRoomDeleted, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hoveredParticipant, setHoveredParticipant] = useState(null);
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [deleteChatRoom, { loading: deleting }] = useMutation(DELETE_CHAT_ROOM);

  const { loading: messagesLoading, data: messagesData } = useQuery(GET_MESSAGES, {
    variables: { chatRoomId, limit: 50, offset: 0 },
    fetchPolicy: 'cache-and-network',
    skip: !chatRoomId,
  });

  const { data: subData } = useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { chatRoomId },
    skip: !chatRoomId,
  });

  const { loading: roomLoading, data: roomData, refetch: refetchRoom } = useQuery(GET_CHAT_ROOM, {
    variables: { chatRoomId },
    skip: !chatRoomId,
  });

  useEffect(() => { setMessages([]); }, [chatRoomId]);

  useEffect(() => {
    if (messagesData?.getMessages) setMessages(messagesData.getMessages);
  }, [messagesData]);

  useEffect(() => {
    if (subData?.messageAdded) {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === subData.messageAdded.id);
        if (exists) return prev;
        return [...prev, subData.messageAdded];
      });
    }
  }, [subData]);

  const handleSendMessage = async (content) => {
    try {
      const { data } = await sendMessage({ variables: { chatRoomId, content, senderId: userId } });
      if (data?.sendMessage) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === data.sendMessage.id);
          if (exists) return prev;
          return [...prev, data.sendMessage];
        });
      }
    } catch (error) {
      toast.error('Failed to send message.');
    }
  };

  const handleShareLink = () => {
    const joinLink = roomData?.getChatRoom?.joinLink;
    if (!joinLink) { toast.error('Invite link not available for this room.'); return; }
    navigator.clipboard.writeText(`${window.location.origin}/join/${joinLink}`).then(() => {
      setLinkCopied(true);
      toast.success('Invite link copied!');
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => toast.error('Failed to copy link.'));
  };

  const handleDeleteRoom = async () => {
    try {
      await deleteChatRoom({ variables: { chatRoomId, userId } });
      toast.success('Chat room deleted.');
      setShowDeleteConfirm(false);
      onRoomDeleted?.();
    } catch (error) {
      toast.error(error.message || 'Failed to delete room.');
    }
  };

  if (messagesLoading || roomLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#0f0f13]">
        <svg className="animate-spin w-8 h-8 text-purple-500 mb-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  const room = roomData?.getChatRoom;
  const isOwner = room?.owner?.id === userId;
  const ownerId = room?.owner?.id;

  return (
    <div className="flex flex-col h-full bg-[#0f0f13]">

      {/* ── Room header ── */}
      <div className="glass border-b border-white/5 px-5 py-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="sm:hidden p-1.5 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all border-0 bg-transparent"
                title="Back to rooms"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold text-white">{room?.name || 'Chat Room'}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {room?.participants?.length || 0} member{room?.participants?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stacked avatars with owner tooltip */}
            <div className="flex -space-x-2 overflow-visible">
              {room?.participants?.slice(0, 4).map((p) => {
                const isParticipantOwner = p.id === ownerId;
                return (
                  <div
                    key={p.id}
                    className="relative cursor-default"
                    onMouseEnter={() => setHoveredParticipant(p.id)}
                    onMouseLeave={() => setHoveredParticipant(null)}
                  >
                    {p.profilePicture ? (
                      <img
                        src={p.profilePicture}
                        alt={p.username}
                        className="w-7 h-7 rounded-full border-2 border-[#0f0f13] object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full border-2 border-[#0f0f13] bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Online dot */}
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-[#0f0f13] rounded-full" />
                    {/* Tooltip — drops DOWN below the avatar to avoid overlapping the nav bar */}
                    {hoveredParticipant === p.id && (
                      <div
                        className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/10 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none z-50 shadow-xl"
                        style={{ animation: 'fadeIn 0.1s ease' }}
                      >
                        {p.username}
                        {isParticipantOwner && <span className="ml-1">👑</span>}
                      </div>
                    )}
                  </div>
                );
              })}
              {room?.participants?.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-[#0f0f13] bg-gray-700 flex items-center justify-center text-[10px] text-gray-300">
                  +{room.participants.length - 4}
                </div>
              )}
            </div>



            {/* Invite button */}
            <button
              onClick={handleShareLink}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass text-xs text-gray-400 hover:text-white transition-all duration-200 border-0"
            >
              {linkCopied ? (
                <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
              ) : (
                <><Link2 className="w-3.5 h-3.5" /><span>Invite</span></>
              )}
            </button>

            {/* Delete (owner only) */}
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete chat room"
                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border-0 bg-transparent"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-grow overflow-y-auto scrollbar-thin bg-[#0f0f13]">
        <MessageList messages={messages} loggedInUser={username} />
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>

      {/* ── Delete Confirm Modal ── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
          style={{ animation: 'fadeIn 0.2s ease' }}
        >
          <div
            className="glass-strong rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base">Delete room?</h3>
                <p className="text-gray-400 text-xs mt-0.5">This will delete all messages. Cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 glass hover:text-white border-0 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm text-white bg-red-600 hover:bg-red-500 border-0 transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Room'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ChatPanel;
