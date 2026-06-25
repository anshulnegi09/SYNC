import React, { useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
import { toast } from 'react-toastify'
import { useParams, useNavigate } from 'react-router-dom'

const JOIN_CHAT_ROOM_BY_LINK = gql`
  mutation JoinChatRoomByLink($joinLink: String!) {
    joinChatRoomByLink(joinLink: $joinLink) {
      id
      name
      participants {
        id
        username
      }
    }
  }
`

const JoinChatRoom = () => {
  const { joinLink } = useParams()
  const userId = localStorage.getItem('userId') // Get user ID from local storage
  const [joinChatRoomByLink] = useMutation(JOIN_CHAT_ROOM_BY_LINK)
  const navigate = useNavigate()

  useEffect(() => {
    const joinChatRoom = async () => {
      if (!userId) {
        localStorage.setItem('pendingJoinLink', joinLink)
        toast.info('Please log in or sign up to join this room.')
        navigate('/login')
        return
      }

      try {
        await joinChatRoomByLink({ variables: { joinLink } })
        toast.success('Successfully joined the room!')
        navigate('/chat-rooms')
      } catch (error) {
        console.error('Error joining chat room:', error.message)
        toast.error(error.message || 'Failed to join room. Link may be invalid.')
        navigate('/chat-rooms')
      }
    }

    joinChatRoom()
  }, [joinLink, userId, joinChatRoomByLink, navigate])

  return <p>Joining chat room...</p>
}

export default JoinChatRoom