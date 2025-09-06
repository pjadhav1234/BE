import React, { useState } from "react";

const TranscriptForm = ({ setStructured }) => {
  const [transcript, setTranscript] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/parse-transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
    const data = await res.json();
    setStructured(data.structured);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        rows="8"
        cols="60"
        placeholder="Paste transcript (without Doctor/Patient labels)..."
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      />
      <br />
      <button type="submit">AI Parse Transcript</button>
    </form>
  );
};

export default TranscriptForm;
