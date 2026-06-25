import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

const subscriptionResolvers = {
  messageAdded: {
    subscribe: (_parent, { chatRoomId }) => {
      console.log('Subscription started for chatRoom:', chatRoomId);
      // graphql-subscriptions v3: asyncIterator was renamed to asyncIterableIterator
      return pubsub.asyncIterableIterator(`MESSAGE_ADDED.${chatRoomId}`);
    },
  },

  messageRead: {
    subscribe: (_parent, { chatRoomId }) => {
      console.log('Read receipt subscription started for chatRoom:', chatRoomId);
      return pubsub.asyncIterableIterator(`MESSAGE_READ.${chatRoomId}`);
    },
  },
};

export { pubsub };
export default subscriptionResolvers;