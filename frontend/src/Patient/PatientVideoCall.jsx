import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useTranslation } from "react-i18next";  // Import useTranslation from react-i18next

const VideoCallPage = () => {
    const { t } = useTranslation();  // Initialize translation function
    const { id } = useParams();
    const navigate = useNavigate();
    const [verificationId, setVerificationId] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    
    useEffect(() => {
        // Generate random 6-digit ID for verification
        const generatedId = Math.floor(100000 + Math.random() * 900000).toString();
        setVerificationId(generatedId);
        // Alert the verification ID
        alert(`${t("Your verification ID is")}: ${generatedId}`);
    }, []);

    const handleVerification = (inputId) => {
        if (inputId === verificationId) {
            setIsVerified(true);
        } else {
            alert(t('Invalid verification ID'));
        }
    };

    if (!isVerified) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">{t("Enter Verification ID")}</h2>
                    <input 
                        type="text"
                        className="border p-2 rounded mb-4 w-full"
                        placeholder={t("Enter ID")}
                        onChange={(e) => handleVerification(e.target.value)}
                    />
                    <p className="text-sm text-gray-600">{t("Enter the ID shared by the other participant")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="video-call-page p-6">
            <h1 className="text-2xl font-bold mb-4">{t("Video Consultation")}</h1>
            
            <div className="video-call-container bg-gray-100 p-4 rounded shadow">
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={`consultation-${id}-${verificationId}`}
                    configOverwrite={{
                        startWithAudioMuted: true,
                        startWithVideoMuted: false
                    }}
                    interfaceConfigOverwrite={{
                        SHOW_JITSI_WATERMARK: false,
                        TOOLBAR_BUTTONS: [
                            "microphone",
                            "camera",
                            "hangup",
                            "chat",
                            "raisehand"
                        ]
                    }}
                    getIFrameRef={(iframe) => {
                        iframe.style.height = "600px";
                        iframe.style.width = "100%";
                    }}
                />
            </div>
        </div>
    );
};

export default VideoCallPage;