import ChatRoom from '../models/ChatRoom.js';
import { authMiddleware } from '../utils/authMiddleware.js';

const queryResolvers = {
  getChatRooms: authMiddleware(async (_, __, { user }) => {
    try {
      return await ChatRoom.find({ participants: user.id }).populate('participants').exec();
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching chat rooms');
    }
  }),

  getMessages: authMiddleware(async (_, { chatRoomId, limit = 20, offset = 0 }, { user }) => {
    try {
      const chatRoom = await ChatRoom.findById(chatRoomId)
        .populate({
          path: 'messages',
          populate: { path: 'sender' },
          options: {
            limit,
            skip: offset,
            sort: { sentAt: -1 }, // Sort messages by most recent first
          },
        })
        .exec();
      if (!chatRoom) throw new Error('Chat room not found');
      
      const isParticipant = chatRoom.participants.some(p => p.toString() === user.id);
      if (!isParticipant) {
        throw new Error('You are not a participant in this chat room');
      }

      return chatRoom.messages;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching messages');
    }
  }),

  getChatRoom: authMiddleware(async (_, { chatRoomId }, { user }) => {
    try {
      const chatRoom = await ChatRoom.findById(chatRoomId)
        .populate({
          path: 'participants',
          select: 'id username email' // Explicitly select the fields we want
        })
        .populate({
          path: 'owner',
          select: 'id username email'
        })
        .exec();
  
      if (!chatRoom) throw new Error('Chat room not found');      

      const isParticipant = chatRoom.participants.some(p => p.id === user.id);
      if (!isParticipant) {
        throw new Error('You are not a participant in this chat room');
      }

      return chatRoom;
    } catch (error) {
      console.error('Error fetching chat room:', error);
      throw new Error('Error fetching chat room');
    }
  }),
};

export default queryResolvers;