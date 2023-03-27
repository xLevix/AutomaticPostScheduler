import NextAuth from "next-auth"
import LinkedIn from "next-auth/providers/linkedin";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { useSession } from "next-auth/react"
import TwitterProvider from "next-auth/providers/twitter";
import {IgApiClient} from "instagram-private-api";
import {log} from "util";


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
            clientId: process.env.FACEBOOK_ID,
            clientSecret: process.env.FACEBOOK_SECRET,
            userinfo: {
                params: {
                    fields: 'id,name,email,link,publish_to_groups,pages_manage_posts',
                },
            },

        }),

        TwitterProvider({
            clientId: process.env.oauth_consumer_key,
            clientSecret: process.env.oauth_consumer_secret,
        }),

        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "insta",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                username: { label: "Username", type: "text", placeholder: "login", id: "username", name: "username" },
                password: { label: "Password", type: "password", id: "password", name: "password" }
            },
            async authorize(credentials, req, res) {

                const ig = new IgApiClient();
                ig.state.generateDevice(credentials.username);
                const auth = await ig.account.login(credentials.username, credentials.password);

                if (JSON.stringify(auth)){
                    return {sub: credentials.username, accessToken: credentials.password}
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (account?.accessToken) {
                token.accessToken = account.access_token;
            }
            console.log("token", token);
            return token;
        },
        async session({ session, token, }) {
            if (session?.user) {
                if (token?.accessToken){
                    session.user.id = token.sub;
                    session.user.accessToken = token.accessToken;
                }
            }
            return {
                ...session,
                accessToken: token.accessToken,
            };
        },
    }
})