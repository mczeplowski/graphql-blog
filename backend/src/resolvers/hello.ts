import { Resolver, Query, Ctx } from "type-graphql";
import { User } from "../entity/User";
import { ResolverContext } from "../types";

@Resolver()
export class HelloResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { connection, req }: ResolverContext) {
    if (!req.session.userId) {
      return null;
    }

    const user = await connection.manager.findOne(User, {
      id: req.session.userId,
    });

    return user;
  }

  @Query(() => String)
  hello() {
    return "hello world";
  }
}
