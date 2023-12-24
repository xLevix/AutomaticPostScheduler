import NextAuth from "next-auth"
import LinkedIn from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";
import TwitterProvider from "next-auth/providers/twitter";
import {IgApiClient} from "instagram-private-api";

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

        TwitterProvider({
            clientId: process.env.TWITTER_ID,
            clientSecret: process.env.TWITTER_SECRET,
            version: "2.0",
            authorization: {
                params: {
                    scope: 'users.read tweet.read tweet.write offline.access',
                },
            },
        }),

        CredentialsProvider({
            name: "Instagram credentials",
            logo: "https://cdk-hnb659fds-assets-329914929726-eu-north-1.s3.eu-north-1.amazonaws.com/instagram.svg",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "login", id: "username", name: "username" },
                password: { label: "Password", type: "password", id: "password", name: "password" }
            },
            async authorize(credentials, req, res) {

                const ig = new IgApiClient();
                ig.state.generateDevice(credentials.username);
                const auth = await ig.account.login(credentials.username, credentials.password);

                if (JSON.stringify(auth)) {
                    return {
                        username: credentials.username,
                        password: credentials.password,
                    };
                } else {
                    return null;
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (account) {
                token.accessToken = account.access_token;
                token.provider = account.provider;
            }

            if(user?.username){
                token.sub = user.username;
                token.accessToken = user.password;
            }

            console.log("account", account)
            console.log("user", user);
            console.log("token", token)
            return token;
        },
        async session({ session, token, }) {
            if (session?.user) {
                session.user.id = token.sub;
                session.user.accessToken = token.accessToken;
            }
            return {
                ...session,
                accessToken: token.accessToken,
                provider: token.provider,

            };
        },
    }
})
