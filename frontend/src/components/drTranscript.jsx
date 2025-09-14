import React, { useState, useEffect, useRef } from "react";

const TranscriptSystem = ({ room, role = "doctor" }) => {
  const [transcript, setTranscript] = useState("");
  const [allTranscripts, setAllTranscripts] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
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

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.lang =
        selectedLanguage === "auto" ? "en-US" : selectedLanguage;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const speechText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += speechText + " ";
          }
        }

        if (finalTranscript) {
          if (selectedLanguage !== "en-US" && selectedLanguage !== "auto") {
            translateToEnglish(finalTranscript, role);
          } else {
            setTranscript(finalTranscript);
            setAllTranscripts((prev) => [
              ...prev,
              { speaker: role, message: finalTranscript },
            ]);
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error("Error restarting recognition:", e);
            setIsRecording(false);
          }
        }
      };
    } else {
      console.error("Speech Recognition API not supported in this browser");
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [selectedLanguage, role]);

  useEffect(() => {
    startRecording();
  }, []);

  // Translate text → English
  const translateToEnglish = async (text, role) => {
    setIsTranslating(true);
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          text
        )}&langpair=${selectedLanguage}|en`
      );
      const data = await response.json();

      const translatedText = data.responseData?.translatedText || text;
      setTranscript(translatedText);

      setAllTranscripts((prev) => [
        ...prev,
        { speaker: role, message: translatedText },
      ]);
    } catch (error) {
      console.error("Translation error:", error);
      setTranscript(text);
      setAllTranscripts((prev) => [
        ...prev,
        { speaker: role, message: text },
      ]);
    } finally {
      setIsTranslating(false);
    }
  };

  // Recording controls
  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang =
          selectedLanguage === "auto" ? "en-US" : selectedLanguage;
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting recording:", error);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // ✅ Save transcript to server upload/ folder as JSON
  const saveTranscriptFile = async () => {
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

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setTimeout(() => {
        recognitionRef.current.lang = newLang === "auto" ? "en-US" : newLang;
        recognitionRef.current.start();
      }, 300);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md mt-4 mx-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        🎤 Multi-Language Voice to English
      </h2>

      {/* Language selection */}
      <div className="mb-4">
        <label
          htmlFor="language"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select Input Language:
        </label>
        <select
          id="language"
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {supportedLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Recording status */}
      <div className="flex items-center mb-4">
        <div
          className={`w-3 h-3 rounded-full mr-2 ${
            isRecording ? "bg-red-500 animate-pulse" : "bg-gray-400"
          }`}
        ></div>
        <span>{isRecording ? "Recording..." : "Not Recording"}</span>
        {isTranslating && (
          <span className="ml-4 text-blue-500">Translating...</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-400 flex-1"
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="px-4 py-2 bg-red-500 text-white rounded-md disabled:bg-gray-400 flex-1"
        >
          Stop Recording
        </button>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mt-4 p-4 bg-white rounded border shadow-sm">
          <h4 className="font-semibold text-lg mb-2">English Translation:</h4>
          <p className="text-gray-700">{transcript}</p>
        </div>
      )}

      {/* Conversation History */}
      {allTranscripts.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-lg mb-2">Conversation History:</h4>
          <div className="bg-white p-4 rounded border shadow-sm max-h-60 overflow-y-auto">
            {allTranscripts.map((t, i) => (
              <div
                key={i}
                className={`mb-3 p-2 border-b border-gray-100 last:border-b-0 ${
                  t.speaker === "doctor" ? "text-blue-700" : "text-green-700"
                }`}
              >
                <strong>{t.speaker === "doctor" ? "Dr:" : "Patient:"}</strong>{" "}
                {t.message}
              </div>
            ))}
          </div>
          <button
            onClick={saveTranscriptFile}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save Transcript File
          </button>
        </div>
      )}
    </div>
  );
};

export default TranscriptSystem;
