import React, { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

const SpeechButton = ({ handlePrompt }) => {
    const [listening, setListening] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            const speechRecognition = new SpeechRecognition();
            speechRecognition.interimResults = true;
            speechRecognition.continuous = true;

            speechRecognition.onresult = (event) => {
                let tempTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    tempTranscript += event.results[i][0].transcript;
                }
                handlePrompt(tempTranscript);
            };

            speechRecognition.onerror = (event) => {
                console.error("Speech recognition error:", event);
            };

            speechRecognition.onend = () => {
                setListening(false);
            };

            setRecognition(speechRecognition);
        } else {
            alert("Speech Recognition is not supported in this browser.");
        }
    }, [handlePrompt]);

    const handleToggleListening = () => {
        if (!recognition) return;

        if (listening) {
            recognition.stop();
            setListening(false);
        } else {
            recognition.start();
            setListening(true);
        }
    };

    return (
        <button
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all `}
            onClick={handleToggleListening}
        >
            {listening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
    );
};

export default SpeechButton;
