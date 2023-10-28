import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string; 
      name?: string;
      email?: string;
      image?: string;
      accessToken?: string;
    };

    provider?: string;
    accessToken?: string;
    
  }

  interface JWT {
    sub?: string;
    accessToken?: string;
    provider?: string;
  }
}
