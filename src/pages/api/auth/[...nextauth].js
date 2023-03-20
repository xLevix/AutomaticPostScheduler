import NextAuth from "next-auth"
import LinkedIn from "next-auth/providers/linkedin";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { useSession } from "next-auth/react"
import TwitterProvider from "next-auth/providers/twitter";


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
            clientId: process.env.TWITTER_ID,
            clientSecret: process.env.TWITTER_SECRET,
            version: "2.0", // opt-in to Twitter OAuth 2.0
        }),

        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Instagram Login",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                username: { label: "Username", type: "text", placeholder: "login", id: "username", name: "username" },
                password: { label: "Password", type: "password", id: "password", name: "password" }
            },
            async authorize(credentials, req) {
                const axios = require('axios');
                let data = JSON.stringify({
                    username: credentials.username,
                    password: credentials.password
                });

                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: 'api/instaLogin',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data : data
                };

                axios.request(config)
                    .then(function (response) {
                        console.log(JSON.stringify(response.data));
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
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
                session.user.accessToken = token.accessToken;
            }
            return {
                ...session,
                accessToken: token.accessToken,
            };
        },
    }
})