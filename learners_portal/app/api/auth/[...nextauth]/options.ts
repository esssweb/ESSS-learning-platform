import NextAuth from "next-auth";
import  CredentialsProvider  from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";



export const authOptions = {
  // Google Provider
  providers: [
    GoogleProvider({
      clientId: process.env.Google_Client_ID as string,
      clientSecret: process.env.Google_Client_Secret as string,
    }),

    // Credentials Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Your Email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your password",
        },
      },
      authorize: async (credentials, _) => {
        const res = await fetch(``, {
          method: 'POST',
          headers: {},
          body: JSON.stringify(
            {
              email: credentials?.email,
              password: credentials?.password,
            }
          ),
        })
        const jsonResponse = await res.json()

        if (res.ok && jsonResponse.success) {
          return jsonResponse.data
        }
        else {
          throw new Error(jsonResponse.message);
        }
      },
    }),
  ],
};

export default NextAuth(authOptions);
