import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostsResolver } from "./resolvers/posts";
import { UserResolver } from "./resolvers/users";

import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

createConnection()
  .then(async (connection) => {
    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
      session({
        name: "_sid",
        store: new RedisStore({ client: redisClient, disableTouch: true }),
        cookie: {
          httpOnly: true,
          maxAge: 1000 * 3600 * 24 * 365,
          sameSite: "lax",
        },
        saveUninitialized: false,
        secret: "secret",
        resave: false,
      })
    );

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [HelloResolver, PostsResolver, UserResolver],
      }),
      context: ({ req, res }) => ({ connection, req, res }),
    });

    apolloServer.applyMiddleware({ app });
    app.listen(4000, () => console.log("Application is running on port: 4000"));
  })
  .catch((error) => console.log(error));
