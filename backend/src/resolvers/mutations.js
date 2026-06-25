import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto'; // Built-in Node.js crypto module
import { generateToken } from '../utils/authHelpers.js';
import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { pubsub } from './subscriptions.js';

const mutationResolvers = {
  sendMessage: async (_, { chatRoomId, content, senderId }) => { // Remove file parameter
    try {
      const sender = await User.findById(senderId);
      const chatRoom = await ChatRoom.findById(chatRoomId);
  
      if (!sender || !chatRoom) {
        throw new Error('Invalid sender or chat room');
      }
  
      const message = await Message.create({
        content,
        sender: senderId,
        chatRoom: chatRoomId,
        sentAt: new Date().toISOString()
        // Remove fileData field
      });
  
      await chatRoom.messages.push(message._id);
      await chatRoom.save();
  
      const populatedMessage = await message.populate('sender chatRoom');
      await pubsub.publish(`MESSAGE_ADDED.${chatRoomId}`, {
        messageAdded: populatedMessage,
      });
  
      return populatedMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Error sending message');
    }
  },

  createChatRoom: async (_, { name, ownerId }) => {
    try {
      const owner = await User.findById(ownerId);
      if (!owner) {
        throw new Error('Owner not found');
      }
  
      const joinLink = randomUUID(); // Generate a unique link
  
      const chatRoom = await ChatRoom.create({
        name,
        owner: ownerId,
        participants: [ownerId], // Ensure owner is added as participant
        messages: [],
        joinLink,
      });
  
      // Populate the chat room with participant and owner details
      await chatRoom.populate([
        {
          path: 'participants',
          select: 'id username email'
        },
        {
          path: 'owner',
          select: 'id username email'
        }
      ]);
  
      return chatRoom;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw new Error('Error creating chat room');
    }
  },

  joinChatRoomByLink: async (_, { joinLink, userId }) => {
    try {
      const chatRoom = await ChatRoom.findOne({ joinLink });
      const user = await User.findById(userId);

      if (!chatRoom || !user) {
        throw new Error('Chat room or user not found');
      }

      // Use .toString() for proper ObjectId comparison
      const alreadyJoined = chatRoom.participants.some(
        (p) => p.toString() === userId
      );

      if (!alreadyJoined) {
        chatRoom.participants.push(userId);
        await chatRoom.save();
      }

      // Populate all fields required by the ChatRoom GraphQL type
      await chatRoom.populate([
        { path: 'participants' },
        { path: 'owner' },
        { path: 'messages' },
      ]);

      return chatRoom;
    } catch (error) {
      console.error('Error joining chat room:', error.message);
      throw new Error('Error joining chat room');
    }
  },

  signup: async (_, { username, email, password, profilePicture }) => {
    try {
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) throw new Error('User with this email already exists');
  
      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) throw new Error('Username already taken');
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        profilePicture: profilePicture || null, // Handle null case
      });
  
      const token = generateToken(user);
      return { 
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
        }, 
        token 
      };
    } catch (error) {
      console.error('Signup Error:', error.message);
      throw new Error('Error signing up');
    }
  },

  login: async (_, { email, password }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      const token = generateToken(user);
      return { user, token };
    } catch (error) {
      console.error('Login Error:', error.message);
      throw new Error('Error logging in');
    }
  },

  markMessageAsRead: async (_, { messageId, userId }) => {
    try {
      const message = await Message.findById(messageId);
      const user = await User.findById(userId);

      if (!message || !user) {
        throw new Error('Message or user not found');
      }

      if (!message.readBy.some(receipt => receipt.user.toString() === userId)) {
        message.readBy.push({ user: userId, readAt: new Date() });
        await message.save();

        const populatedMessage = await message.populate([
          { path: 'sender' },
          { path: 'chatRoom' },
          { path: 'readBy.user' }
        ]);

        await pubsub.publish(`MESSAGE_READ.${message.chatRoom}`, {
          messageRead: populatedMessage
        });

        return populatedMessage;
      }

      return message;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw new Error('Error marking message as read');
    }
  },

  deleteChatRoom: async (_, { chatRoomId, userId }) => {
    try {
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) throw new Error('Chat room not found');

      // Only the owner can delete
      if (chatRoom.owner.toString() !== userId) {
        throw new Error('Only the owner can delete this chat room');
      }

      // Delete all messages in the room
      await Message.deleteMany({ chatRoom: chatRoomId });

      // Delete the room
      await ChatRoom.findByIdAndDelete(chatRoomId);

      return true;
    } catch (error) {
      console.error('Error deleting chat room:', error.message);
      throw new Error(error.message);
    }
  },

  updateProfilePicture: async (_, { userId, profilePicture }) => {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { profilePicture },
        { new: true }
      );
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      console.error('Error updating profile picture:', error.message);
      throw new Error('Error updating profile picture');
    }
  },

  updateUsername: async (_, { userId, username }) => {
    try {
      // Basic validation
      if (!username || username.trim().length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      // Check if another user already has this username
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error('Username is already taken');
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { username: username.trim() },
        { new: true }
      );
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      console.error('Error updating username:', error.message);
      throw new Error(error.message || 'Error updating username');
    }
  },
};

export default mutationResolvers;