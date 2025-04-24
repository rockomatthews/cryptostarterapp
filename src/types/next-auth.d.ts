import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      /** The user's ID. */
      id: string;
    } & DefaultSession["user"];
  }
} 