import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { execute, subscribe } from 'graphql';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import cors from 'cors';
import connectDB from './config/db.js';
import schema from './schema/schema.js';

// Initialize MongoDB connection
connectDB();

const app = express();

// HTTP Server
const httpServer = http.createServer(app);

// WebSocket Server for subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// Set up graphql-ws server — must pass execute & subscribe explicitly
const serverCleanup = useServer(
  {
    schema,
    execute,
    subscribe,
    context: (ctx) => {
      // Forward the auth token from WebSocket connectionParams
      const token = ctx.connectionParams?.authorization || '';
      return { token };
    },
  },
  wsServer
);

// Apollo Server Setup (v4)
const apolloServer = new ApolloServer({
  schema,
  formatError: (formattedError, error) => {
    // Strip out the "Did you mean..." field suggestion from the error message in production
    if (process.env.NODE_ENV === 'production') {
      return {
        ...formattedError,
        message: formattedError.message.replace(/Did you mean ".+?"\?/g, ''),
      };
    }
    return formattedError;
  },
  plugins: [
    // Proper shutdown for the HTTP server
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Proper shutdown for the WebSocket server
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await apolloServer.start();

// Apply middleware
app.use(
  '/graphql',
  cors(),
  express.json({ limit: '10mb' }),
  expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      return { req, token };
    },
  })
);

// Server Port
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
});