import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import VideoCallSystem from "../components/VideoCall";

const PatientVideoCall = () => {
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room") || "defaultRoom";

  // Get user from localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const [transcript, setTranscript] = useState("");
  const [allTranscripts, setAllTranscripts] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize speech recognition with auto language detection
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      // Try to use auto language detection if supported
      try {
        recognitionRef.current.lang = "auto";
        console.log("Auto language detection enabled");
      } catch (e) {
        // Fallback to English if auto detection not supported
        recognitionRef.current.lang = "en-US";
        console.log("Auto detection not supported, defaulting to English");
      }

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
          setTranscript(finalTranscript);
          setAllTranscripts(prev => [...prev, finalTranscript]);
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
  }, []);

  // Start recording automatically when component mounts
  useEffect(() => {
    startRecording();
  }, []);

  // Start recording
  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        console.log("Recording started with auto language detection");
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
    link.download = `patient-consultation-${room}.txt`;
    link.click();
  };

  return (
    <div className="container p-4">
      <h3 className="text-2xl font-bold mb-4">Patient Consultation Room: {room}</h3>
      <VideoCallSystem room={room} role="patient" userId={user?.id} />
      
      {/* Transcription Section */}
      <div className="mt-6 p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          🎤 Automatic Transcription
        </h2>

        <div className="flex items-center mb-4">
          <div className={`w-3 h-3 rounded-full mr-2 ${isRecording ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span>{isRecording ? 'Auto-detecting language and transcribing...' : 'Not Recording'}</span>
        </div>

        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
          <p className="text-blue-700 text-sm">
            <strong>Note:</strong> The system will automatically detect the language you're speaking 
            and transcribe it to text. Speak clearly for best results.
          </p>
        </div>

        {/* Transcript Section */}
        {transcript && (
          <div className="mt-4 p-4 bg-white rounded border shadow-sm">
            <h4 className="font-semibold text-lg mb-2">Live Transcription:</h4>
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
              Save Transcript
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
      </div>
    </div>
  );
};

export default PatientVideoCall;