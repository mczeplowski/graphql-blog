import {
  Resolver,
  InputType,
  Mutation,
  Field,
  Arg,
  Ctx,
  ObjectType,
} from "type-graphql";
import argon2 from "argon2";
import { User } from "../entity/User";
import { ResolverContext } from "../types";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class LoginResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async registerUser(
    @Arg("options") { username, password }: UsernamePasswordInput,
    @Ctx() { connection }: ResolverContext
  ): Promise<User> {
    const hashedPassword = await argon2.hash(password);
    const user = await connection.manager.create(User, {
      username,
      password: hashedPassword,
    });
    await connection.manager.save(user);

    return user;
  }

  @Mutation(() => LoginResponse)
  async loginUser(
    @Arg("options") { username, password }: UsernamePasswordInput,
    @Ctx() { connection, req }: ResolverContext
  ): Promise<LoginResponse> {
    const user = await connection.manager.findOne(User, {
      username,
    });

    if (!user) {
      return {
        errors: ["This user dosn't exist"],
      };
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: ["Incorrect password"],
      };
    }

    req.session.userId = user.id;

    return { user };
  }
}
