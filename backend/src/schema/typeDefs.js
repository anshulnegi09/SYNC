import { gql } from 'graphql-tag';

const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    username: String!
    email: String!
    profilePicture: String
    createdAt: Date!
  }

  type ReadReceipt {
    user: User!
    readAt: Date!
  }

  type Message {
    id: ID!
    content: String!
    sender: User!
    chatRoom: ChatRoom!
    sentAt: Date!
    readBy: [ReadReceipt!]!
  }

  type ChatRoom {
    id: ID!
    name: String!
    owner: User!
    participants: [User!]!
    messages: [Message!]!
    joinLink: String
  }

  type Query {
    getChatRooms: [ChatRoom!]!
    getMessages(chatRoomId: ID!, limit: Int, offset: Int): [Message!]!
    getChatRoom(chatRoomId: ID!): ChatRoom!
  }

  type Mutation {
    sendMessage(chatRoomId: ID!, content: String!): Message!
    createChatRoom(name: String!): ChatRoom!
    deleteChatRoom(chatRoomId: ID!): Boolean!
    joinChatRoom(chatRoomId: ID!): ChatRoom!
    joinChatRoomByLink(joinLink: String!): ChatRoom!
    signup(username: String!, email: String!, password: String!, profilePicture: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    markMessageAsRead(messageId: ID!): Message!
    updateProfilePicture(profilePicture: String!): User!
    updateUsername(username: String!): User!
  }

  type Subscription {
    messageAdded(chatRoomId: ID!): Message
    messageRead(chatRoomId: ID!): Message!
  }

  type AuthPayload {
    user: User!
    token: String!
  }
`;

export default typeDefs;
