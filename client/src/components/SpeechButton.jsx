import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';

const SpeechButton = ({ handlePrompt, }) => {
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
                let tempTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    tempTranscript += event.results[i][0].transcript;
                }
                handlePrompt(tempTranscript)
            };

            speechRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event);
            };

            speechRecognition.onend = () => {
                setListening(false);
            };

            setRecognition(speechRecognition);
        } else {
            alert('Speech Recognition is not supported in this browser.');
        }
    }, []);


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
        <div className="text-center">
            <button
                className={`flex items-center justify-center  rounded-lg py-1 px-2 gap-1 text-sm ${listening ? 'bg-blue-100' : 'bg-white'
                    }`}
                onClick={handleToggleListening}
            >
                <Mic size={18} />
            </button>
        </div>
    );
};

export default SpeechButton;
