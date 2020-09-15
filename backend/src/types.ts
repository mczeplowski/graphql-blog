import { Connection } from "typeorm";
import { Request } from "express";

export type ResolverContext = {
  connection: Connection;
  req: Request & { session: Express.Session };
};
