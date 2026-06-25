import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Plus, LogIn, ChevronRight, Hash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import ChatPanel from './ChatPanel';

const GET_CHAT_ROOMS = gql`
  query GetChatRooms {
    getChatRooms {
      id
      name
      joinLink
    }
  }
`;

const CREATE_CHAT_ROOM = gql`
  mutation CreateChatRoom($name: String!) {
    createChatRoom(name: $name) {
      id
      name
      joinLink
    }
  }
`;

const ChatDashboard = () => {
  const navigate = useNavigate();
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [joinLink, setJoinLink] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  const { data, refetch: refetchRooms } = useQuery(GET_CHAT_ROOMS, { fetchPolicy: 'cache-and-network' });
  const [createChatRoom, { loading: creating }] = useMutation(CREATE_CHAT_ROOM);

  const chatRooms = data?.getChatRooms || [];

  const handleCreate = async () => {
    if (!roomName.trim()) return;
    try {
      const res = await createChatRoom({ variables: { name: roomName } });
      setRoomName('');
      setCreateOpen(false);
      setSelectedRoomId(res.data.createChatRoom.id);
      refetchRooms();
    } catch (e) {
      console.error('Error creating room:', e);
    }
  };

  const handleJoin = () => {
    if (!joinLink.trim()) return;
    setJoinOpen(false);
    // Join still navigates via the JoinChatRoom route which handles the mutation
    navigate(`/join/${joinLink.trim()}`);
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all duration-200 text-sm';

  return (
    <div className="flex h-full bg-[#0f0f13] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`w-full sm:w-64 flex-shrink-0 border-r border-white/5 flex flex-col bg-[#0d0d11] ${selectedRoomId ? 'hidden sm:flex' : 'flex'}`}>

        {/* Sidebar header */}
        <div className="px-4 py-3.5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Rooms</h2>
          <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{chatRooms.length}</span>
        </div>

        {/* Room list */}
        <div className="flex-grow overflow-y-auto scrollbar-thin p-2 space-y-0.5">
          {chatRooms.length === 0 ? (
            <p className="text-gray-600 text-xs text-center mt-10 px-4">No rooms yet. Create one to get started!</p>
          ) : (
            chatRooms.map((room) => {
              const isActive = room.id === selectedRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group border-0 ${
                    isActive
                      ? 'bg-purple-600/15 text-white'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <Hash className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <span className="text-sm font-medium truncate flex-grow">{room.name}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        {/* Action buttons */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {/* Create Room */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white btn-glow border-0 justify-center">
                <Plus className="w-4 h-4" />
                Create Room
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#13131a] border border-white/10 rounded-2xl text-white max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-white">Create a new room</DialogTitle>
                <DialogDescription className="text-gray-400 text-sm">Give your chat room a name.</DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="e.g. project-sync"
                  className={inputClass}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <button
                  onClick={handleCreate}
                  disabled={!roomName.trim() || creating}
                  className="btn-glow px-5 py-2 rounded-xl text-white text-sm font-semibold border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Join via Invite */}
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger asChild>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-300 glass hover:bg-white/10 border-0 justify-center transition-all">
                <LogIn className="w-4 h-4" />
                Join via Invite
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#13131a] border border-white/10 rounded-2xl text-white max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-white">Join a room</DialogTitle>
                <DialogDescription className="text-gray-400 text-sm">Paste the invite code or link.</DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <input
                  type="text"
                  value={joinLink}
                  onChange={(e) => setJoinLink(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="Paste invite code here"
                  className={inputClass}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <button
                  onClick={handleJoin}
                  disabled={!joinLink.trim()}
                  className="btn-glow px-5 py-2 rounded-xl text-white text-sm font-semibold border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join Room
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <main className={`flex-grow flex flex-col overflow-hidden ${selectedRoomId ? 'flex' : 'hidden sm:flex'}`}>
        {selectedRoomId ? (
          <ChatPanel
            key={selectedRoomId}
            chatRoomId={selectedRoomId}
            onRoomDeleted={() => {
              setSelectedRoomId(null);
              refetchRooms();
            }}
            onBack={() => setSelectedRoomId(null)}
          />
        ) : (
          // Empty state
          <div className="flex-grow flex items-center justify-center relative overflow-hidden">
            <div className="orb w-96 h-96 bg-purple-700/10 top-[-100px] right-[-100px]" />
            <div className="orb w-72 h-72 bg-indigo-600/10 bottom-[-80px] left-[-80px]" />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(rgba(168,85,247,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
            />
            <div className="relative z-10 text-center px-4" style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-5">
                <Hash className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pick a room</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Select a room from the sidebar to start chatting.
              </p>
              {chatRooms.length === 0 && (
                <button
                  onClick={() => setCreateOpen(true)}
                  className="btn-glow mt-6 px-6 py-2.5 rounded-full text-white text-sm font-semibold border-0"
                >
                  <Plus className="w-4 h-4 inline mr-1.5" />
                  Create your first room
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatDashboard;