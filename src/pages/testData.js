import React, { useState } from 'react'

export default function Home() {
  const [value, setvalue] = useState('')

  const handleClick = async () => {
    const promptData = { prompt: "Twoja treść tutaj" }; // Użyj odpowiedniej wartości zamiast stałej

    const response = await fetch(
      'http://localhost:3000/api/gptCall',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData)
      }
    );
    console.log('response: ', response.body)
    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader()
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      console.log('Received: ', value)
      setvalue((prev) => prev + value)
    }
  }

  return (
    <main>
      <p>Streaming response:</p>
      <br />
      <div >{value}</div>
      <button onClick={handleClick}>
        Submit
      </button>
    </main>
  )
}