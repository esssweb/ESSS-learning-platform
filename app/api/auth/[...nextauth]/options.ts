import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";



export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.Google_Client_ID as string,
      clientSecret: process.env.Google_Client_Secret as string,
    }),
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
