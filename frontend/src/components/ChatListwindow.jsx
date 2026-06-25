import React, { useEffect, useState, useRef } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import { Link, useNavigate } from 'react-router-dom'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import CnDbuttons from './CnDbuttons'

const GET_CHAT_ROOMS = gql`
  query GetChatRooms {
    getChatRooms {
      id
      name
      joinLink
    }
  }
`

const CREATE_CHAT_ROOM = gql`
  mutation CreateChatRoom($name: String!, $ownerId: ID!) {
    createChatRoom(name: $name, ownerId: $ownerId) {
      id
      name
      joinLink
    }
  }
`

const ChatListWindow = () => {
  const { loading, error, data } = useQuery(GET_CHAT_ROOMS, {
    fetchPolicy: 'cache-and-network'
  })
  const [createChatRoom] = useMutation(CREATE_CHAT_ROOM)
  const [chatRooms, setChatRooms] = useState([])
  const [roomName, setRoomName] = useState('')
  const [joinLink, setJoinLink] = useState('')
  const userId = localStorage.getItem('userId')
  const navigate = useNavigate()
  
  const roomsEndRef = useRef(null)

  const scrollToBottom = () => {
    roomsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (data) {
      setChatRooms(data.getChatRooms)
      scrollToBottom()
    }
  }, [data])



  const handleCreateChatRoom = async () => {
    try {
      const response = await createChatRoom({
        variables: { name: roomName, ownerId: userId }
      })
      const newChatRoom = response.data.createChatRoom
      setChatRooms([...chatRooms, newChatRoom])
      setRoomName('')
      navigate(`/chat-room/${newChatRoom.id}`)
    } catch (error) {
      console.error('Error creating chat room:', error)
    }
  }

  const handleJoinRoom = async (joinLink) => {
    try {
      navigate(`/join/${joinLink}`)
    } catch (error) {
      console.error('Error joining chat room:', error)
    }
  }

  if (loading) return <div className="text-gray-400 p-4">Loading chat rooms...</div>;

  return (
    <div className="bg-gray-900 right-0 shadow-md">
      <div className="overflow-y-auto max-h-[calc(100vh-12rem)] scrollbar-hide">
        <ul className="space-y-2">
          {chatRooms.map((chatRoom) => (
            <Collapsible key={chatRoom.id} className="w-full">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-gray-700 rounded-lg">
                <span className="text-white">{chatRoom.name}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-2">
                <div className="flex flex-col space-y-2 p-2 bg-gray-700 rounded-lg mt-1">
                  <Link 
                    to={`/chat-room/${chatRoom.id}`} 
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    View Chat
                  </Link>
                  <button
                    onClick={() => handleJoinRoom(chatRoom.joinLink)}
                    className="text-sm text-purple-400 hover:text-blue-300"
                  >
                    Join Room
                  </button>
                  <div className="text-xs text-gray-400">
                    Chatroom Id: {chatRoom.joinLink}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
          <div ref={roomsEndRef} />
        </ul>
      </div>

      <CnDbuttons 
        roomName={roomName}
        setRoomName={setRoomName}
        joinLink={joinLink}
        setJoinLink={setJoinLink}
        handleCreateChatRoom={handleCreateChatRoom}
        handleJoinRoom={handleJoinRoom}
      />
    </div>
  )
}

export default ChatListWindow
