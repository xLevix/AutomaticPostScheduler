import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string; // Add the id property (and any other custom properties you've added to the user object)
      name?: string;
      email?: string;
      image?: string;
      accessToken?: string; // if you're using this
    };
  }

  interface JWT {
    sub?: string;
    accessToken?: string;
    provider?: string;
  }
}
