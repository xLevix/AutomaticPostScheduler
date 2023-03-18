import NextAuth from "next-auth"
import LinkedIn from "next-auth/providers/linkedin";
import FacebookProvider from "next-auth/providers/facebook";

export default NextAuth({
    providers: [
        LinkedIn({
            clientId: process.env.LINKEDIN_ID,
            clientSecret: process.env.LINKEDIN_SECRET,
            authorization: {
                params: {
                    scope: 'r_liteprofile r_emailaddress w_member_social',
                },
            },
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            console.log("token", token);
            return token;
        },
        async session({ session, token, }) {
            if (session?.user) {
                session.user.id = token.sub;
            }
            return {
                ...session,
                accessToken: token.accessToken,
            };
        },
    }
})