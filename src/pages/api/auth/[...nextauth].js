import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import LinkedIn from "next-auth/providers/linkedin";

export default NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        LinkedIn({
            clientId: process.env.LINKEDIN_ID,
            clientSecret: process.env.LINKEDIN_SECRET,
            scope: "r_liteprofile r_emailaddress w_member_social",
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