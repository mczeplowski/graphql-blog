import "reflect-metadata";
import { createConnection } from "typeorm";
import { Post } from "./entity/Post";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostsResolver } from "./resolvers/posts";

createConnection()
  .then(async (connection) => {
    const app = express();

    const apolloServer = new ApolloServer({
      schema: await buildSchema({ resolvers: [HelloResolver, PostsResolver] }),
      context: { connection },
    });

    const posts = await connection.manager.find(Post);
    console.log("Loaded posts: ", posts);

    apolloServer.applyMiddleware({ app });
    app.listen(4000, () => console.log("Application is running on port: 4000"));
  })
  .catch((error) => console.log(error));
