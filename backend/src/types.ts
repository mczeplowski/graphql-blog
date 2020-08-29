import { Connection } from "typeorm";

export type ResolverContext = {
  connection: Connection;
};
