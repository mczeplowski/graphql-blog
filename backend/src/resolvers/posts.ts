import { Resolver, Query, Ctx, Arg, Mutation } from "type-graphql";
import { Post } from "../entity/Post";
import { ResolverContext } from "../types";

@Resolver()
export class PostsResolver {
  @Query(() => [Post])
  posts(@Ctx() { connection }: ResolverContext): Promise<Post[]> {
    return connection.manager.find(Post);
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id") id: number,
    @Ctx() { connection }: ResolverContext
  ): Promise<Post | undefined> {
    return connection.manager.findOne(Post, { where: { id } });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Arg("content") content: string,
    @Ctx() { connection }: ResolverContext
  ): Promise<Post> {
    const post = connection.manager.create(Post, { title, content });
    await connection.manager.save(post);

    return post;
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Arg("content", () => String, { nullable: true }) content: string,
    @Ctx() { connection }: ResolverContext
  ): Promise<Post | null> {
    const post = await connection.manager.findOne(Post, { where: { id } });

    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      post.title = title;
    }

    if (typeof content !== "undefined") {
      post.content = content;
    }

    await connection.manager.save(post);

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { connection }: ResolverContext
  ): Promise<boolean> {
    await connection.manager.delete(Post, { id });
    return true;
  }
}
