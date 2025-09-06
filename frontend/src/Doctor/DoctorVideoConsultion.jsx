import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import VideoCallSystem from "../components/VideoCall";

const DoctorVideoConsultation = () => {
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room") || "defaultRoom";

  // Get user from localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const [transcript, setTranscript] = useState("");
  const [allTranscripts, setAllTranscripts] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [isTranslating, setIsTranslating] = useState(false);
  const recognitionRef = useRef(null);

  // Supported languages for speech recognition
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
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      // Set initial language
      recognitionRef.current.lang = selectedLanguage === "auto" ? "en-US" : selectedLanguage;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          // If not English, translate to English
          if (selectedLanguage !== "en-US" && selectedLanguage !== "auto") {
            translateToEnglish(finalTranscript);
          } else {
            setTranscript(finalTranscript);
            setAllTranscripts(prev => [...prev, finalTranscript]);
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Automatically restart if still recording
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error("Error restarting recognition:", e);
            setIsRecording(false);
          }
        }
      };
    } else {
      console.error('Speech Recognition API not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLanguage]);

  // Start recording automatically when component mounts
  useEffect(() => {
    startRecording();
  }, []);

  // Translate text to English using a free API
  const translateToEnglish = async (text) => {
    setIsTranslating(true);
    try {
      // Using MyMemory Translation API (free)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${selectedLanguage}|en`
      );
      
      const data = await response.json();
      
      if (data.responseData && data.responseData.translatedText) {
        const translatedText = data.responseData.translatedText;
        setTranscript(translatedText);
        setAllTranscripts(prev => [...prev, `${text} → ${translatedText}`]);
      } else {
        // Fallback: just show the original text if translation fails
        setTranscript(text);
        setAllTranscripts(prev => [...prev, text]);
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranscript(text);
      setAllTranscripts(prev => [...prev, text]);
    } finally {
      setIsTranslating(false);
    }
  };

  // Start recording
  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = selectedLanguage === "auto" ? "en-US" : selectedLanguage;
        recognitionRef.current.start();
        setIsRecording(true);
        console.log("Recording started");
      } catch (error) {
        console.error("Error starting recording:", error);
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      console.log("Recording stopped");
    }
  };

  // Save all transcripts into one text file
  const saveTranscriptFile = () => {
    const blob = new Blob([allTranscripts.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `consultation-transcript-${room}.txt`;
    link.click();
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    
    if (isRecording && recognitionRef.current) {
      // Restart recognition with new language
      recognitionRef.current.stop();
      setTimeout(() => {
        recognitionRef.current.lang = newLang === "auto" ? "en-US" : newLang;
        recognitionRef.current.start();
      }, 300);
    }
  };

  return (
    <>
      <div className="container p-4">
        <h3 className="text-2xl font-bold mb-4">Doctor Consultation Room: {room}</h3>
        <VideoCallSystem room={room} role="doctor" userId={user?.id} />
      </div>

      {/* Recording UI */}
      <div className="p-6 bg-gray-100 rounded-lg shadow-md mt-4 mx-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          🎤 Multi-Language Voice to English
        </h2>

        {/* Language Selection */}
        <div className="mb-4">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
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
          <p className="text-xs text-gray-500 mt-1">
            Auto-Detect will try to identify the language automatically
          </p>
        </div>

        <div className="flex items-center mb-4">
          <div className={`w-3 h-3 rounded-full mr-2 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span>{isRecording ? 'Recording...' : 'Not Recording'}</span>
          {isTranslating && (
            <span className="ml-4 text-blue-500">
              Translating...
            </span>
          )}
        </div>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className="px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-400 flex-1 hover:bg-green-600 transition-colors"
          >
            Start Recording
          </button>

          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className="px-4 py-2 bg-red-500 text-white rounded-md disabled:bg-gray-400 flex-1 hover:bg-red-600 transition-colors"
          >
            Stop Recording
          </button>
        </div>

        {/* Transcript Section */}
        {transcript && (
          <div className="mt-4 p-4 bg-white rounded border shadow-sm">
            <h4 className="font-semibold text-lg mb-2">English Translation:</h4>
            <p className="text-gray-700">{transcript}</p>
          </div>
        )}

        {allTranscripts.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-lg mb-2">Conversation History:</h4>
            <div className="bg-white p-4 rounded border shadow-sm max-h-60 overflow-y-auto">
              {allTranscripts.map((t, i) => (
                <div key={i} className="mb-3 p-2 border-b border-gray-100 last:border-b-0">
                  <p className="text-gray-700">{t}</p>
                </div>
              ))}
            </div>
            <button
              onClick={saveTranscriptFile}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Save Transcript File
            </button>
          </div>
        )}

        {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
          <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-400">
            <p className="text-yellow-800">
              Note: Your browser doesn't support the Speech Recognition API. 
              Try using Chrome, Edge, or Safari for the best experience.
            </p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
          <ul className="list-disc list-inside text-blue-700 text-sm">
            <li>Select the language you will be speaking</li>
            <li>Speak clearly into your microphone</li>
            <li>Your speech will be converted to text</li>
            <li>If not English, it will be translated to English</li>
            <li>All translations are saved in the conversation history</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default DoctorVideoConsultation;