import React, { useState } from "react";

export const generateBio = async (e: any, prompt: string, setGeneratedBios: any, setLoading: any) => {
    e.preventDefault();
    setGeneratedBios("");
    setLoading(true);
    const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt,
        }),
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const data = response.body;
    if (!data) {
        return;
    }
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setGeneratedBios((prev: any) => prev + chunkValue);
    }

    setLoading(false);
};

const GenerateBio = () => {
    const [bio, setBio] = useState("");
    const [vibe, setVibe] = useState("1");
    const [generatedBios, setGeneratedBios] = useState("");
    const [loading, setLoading] = useState(false);
    const prompt = `${bio} ${vibe}`;

    return (
        <>
            <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="..."
                placeholder={"e.g. Senior Engineer @vercel. Tweeting about web dev & AI."}
            />
            <div className="...">
                <p className="...">Select your vibe.</p>
            </div>
            <button className="..." onClick={(e) => generateBio(e, prompt, setGeneratedBios, setLoading)}>
                Generate your bio &rarr;
            </button>
            <hr className="..." />
            <div className="...">
                {generatedBios && (
                    <>
                        <div>
                            <h2 className="...">Your generated bios</h2>
                        </div>
                        <div className="...">
                            {generatedBios
                                .substring(generatedBios.indexOf("1") + 3)
                                .split("2.")
                                .map((generatedBio: any) => {
                                    return (
                                        <div className="..." key={generatedBio}>
                                            <p>{generatedBio}</p>
                                        </div>
                                    );
                                })}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default GenerateBio;