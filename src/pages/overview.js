import { useSession, signIn, signOut } from "next-auth/react"

export default function CamperVanPage() {
    const { data: session, status } = useSession()
    const userEmail = session?.user.email

    if (status === "loading") {
        return <p>Hang on there...</p>
    }

    if (status === "authenticated") {
        var accessToken = session?.user.accessToken;
        return (
            <>
                <p>Signed in as {userEmail}</p>
                <p>Token {accessToken}</p>
                <button onClick={() => signOut()}>Sign out</button>
                <img src="https://cdn.pixabay.com/photo/2017/08/11/19/36/vw-2632486_1280.png" />
            </>
        )
    }

    return (
        <>
            <p>Not signed in.</p>
            <button onClick={() => signIn("linkedin")}>Linkedin Sign in</button>
            <button onClick={() => signIn("facebook")}>Facebook Sign in</button>
            <button onClick={() => signIn("credentials")}>Instagram Sign in</button>
        </>
    )
}