import React, { useState, useEffect, useRef } from "react";

const mockRemoteSTT = async (audioBuffer) => {
  return "Doctor's speech in English"; // placeholder
};

const PatientTranscriptEnglish = ({ room, role = "patient", remoteAudioRef }) => {
  const [transcript, setTranscript] = useState("");
  const [allTranscripts, setAllTranscripts] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [myLanguage, setMyLanguage] = useState("auto");
  const [isTranslating, setIsTranslating] = useState(false);
  const recognitionRef = useRef(null);

  const supportedLanguages = [
    { code: "auto", name: "Auto-Detect" },
    { code: "en-US", name: "English" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "it-IT", name: "Italian" },
    { code: "pt-BR", name: "Portuguese" },
    { code: "ru-RU", name: "Russian" },
    { code: "ja-JP", name: "Japanese" },
    { code: "ko-KR", name: "Korean" },
    { code: "zh-CN", name: "Chinese" },
    { code: "hi-IN", name: "Hindi" },
    { code: "ar-SA", name: "Arabic" },
  ];

  // Init speech recognition for patient
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.error("Speech Recognition not supported");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = myLanguage === "auto" ? "en-US" : myLanguage;

    recognitionRef.current.onresult = async (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const speechText = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += speechText + " ";
      }
      if (finalTranscript) await translateToEnglish(finalTranscript);
    };

    recognitionRef.current.onerror = (e) => console.error("Speech error", e.error);
    recognitionRef.current.onend = () => {
      if (isRecording) {
        try {
          recognitionRef.current.start();
        } catch {
          setIsRecording(false);
        }
      }
    };

    return () => recognitionRef.current?.stop();
  }, [myLanguage]);

  const startRecording = () => {
    try {
      recognitionRef.current.lang = myLanguage === "auto" ? "en-US" : myLanguage;
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const translateToEnglish = async (text) => {
    setIsTranslating(true);
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${myLanguage}|en`
      );
      const data = await res.json();
      const translated = data.responseData?.translatedText || text;

      setTranscript(translated);
      setAllTranscripts((prev) => [...prev, { speaker: "patient", original: text, translated }]);
    } catch (e) {
      console.error("Translation error:", e);
    } finally {
      setIsTranslating(false);
    }
  };

  // Doctor remote audio capture
  useEffect(() => {
    if (!remoteAudioRef?.current?.srcObject) return;

    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(remoteAudioRef.current.srcObject);
    const processor = ctx.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(ctx.destination);

    processor.onaudioprocess = async (e) => {
      const buffer = e.inputBuffer.getChannelData(0);
      const transcript = await mockRemoteSTT(buffer);
      setAllTranscripts((p) => [...p, { speaker: "doctor", translated: transcript }]);
    };

    return () => {
      processor.disconnect();
      source.disconnect();
      ctx.close();
    };
  }, [remoteAudioRef]);

  // 📝 Save transcript to backend
  const saveTranscript = async () => {
    const jsonData = {
      room: room,
      transcripts: allTranscripts,
      savedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:5000/api/save-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      if (response.ok) {
        alert("Transcript saved on server!");
      } else {
        alert("Failed to save transcript on server.");
      }
    } catch (err) {
      console.error("Error saving transcript:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md mt-4 mx-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        🗣️ Real-Time English Transcript (Patient Side)
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Speaking Language:
        </label>
        <select
          value={myLanguage}
          onChange={(e) => setMyLanguage(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {supportedLanguages.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center mb-4">
        <div className={`w-3 h-3 rounded-full mr-2 ${isRecording ? "bg-red-500 animate-pulse" : "bg-gray-400"}`}></div>
        <span>{isRecording ? "Listening..." : "Not Listening"}</span>
        {isTranslating && <span className="ml-4 text-blue-500">Translating...</span>}
      </div>

      <div className="flex space-x-2 mb-4">
        <button onClick={startRecording} disabled={isRecording} className="px-4 py-2 bg-green-500 text-white rounded-md flex-1">
          Start
        </button>
        <button onClick={stopRecording} disabled={!isRecording} className="px-4 py-2 bg-red-500  rounded-md flex-1">
          Stop
        </button>
      </div>

      {transcript && (
        <div className="mt-4 p-4 bg-white rounded border shadow-sm">
          <h4 className="font-semibold text-lg mb-2">Your Speech (English):</h4>
          <p className="text-gray-700">{transcript}</p>
        </div>
      )}

      {allTranscripts.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-lg mb-2">Conversation History:</h4>
          <div className="bg-white p-4 rounded border shadow-sm max-h-60 overflow-y-auto">
            {allTranscripts.map((t, i) => (
              <div
                key={i}
                className={`mb-3 p-2 border-b border-gray-100 last:border-b-0 ${
                  t.speaker === "doctor" ? "text-blue-700" : "text-purple-700"
                }`}
              >
                <strong>{t.speaker === "doctor" ? "Dr:" : "You:"}</strong> {t.translated}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={saveTranscript}
        disabled={allTranscripts.length === 0}
        className="mt-4 px-4 py-2 bg-blue-600 text-black rounded-md disabled:bg-gray-400"
      >
        💾 Save Transcript
      </button>
    </div>
  );
};

export default PatientTranscriptEnglish;
