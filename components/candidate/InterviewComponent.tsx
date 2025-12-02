"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface InterviewComponentProps {
  token: string;
  wsUrl?: string;
}

interface QuestionObject {
  uuid?: string;
  name?: string;
  question: string;
  description?: string;
  difficulty_level?: string;
  expected_time_in_seconds?: number;
  category?: any;
  topic?: any;
  subtopic?: any;
}

type WebSocketMessage = 
  | { type: "connection_established"; message: string }
  | { type: "greeting"; character?: string; message: string; panel_name?: string; panel_description?: string }
  | { type: "transcription_update"; character?: string; message: string; answer_uuid?: string }
  | { type: "scoring_update"; score: number; feedback: string }
  | { type: "next_question"; character?: string; message: string; question_uuid?: string; round_number?: number; difficulty?: string; question_name?: string; expected_time_in_seconds?: number }
  | { type: "interview_completed"; message: string }
  | { type: "error"; message: string };

interface ChatMessage {
  id: string;
  character: string;
  text: string;
  timestamp: Date;
}

export default function InterviewComponent({ token, wsUrl = "ws://localhost:8000" }: InterviewComponentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("Disconnected");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const analyzingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to update the last candidate message (for transcription updates)
  const updateLastCandidateMessage = useCallback((text: string) => {
    const cleanText = text.replace(/^"|"$/g, "").replace(/\\"/g, '"');
    
    setMessages((prev) => {
      if (prev.length === 0) {
        // No messages yet, create a new one
        return [{
          id: `${Date.now()}-${Math.random()}`,
          character: "candidate",
          text: cleanText,
          timestamp: new Date(),
        }];
      }
      
      // Check if last message is from candidate
      const lastMessage = prev[prev.length - 1];
      if (lastMessage.character === "candidate" || lastMessage.character === "you") {
        // Update the last message
        return prev.map((msg, index) => 
          index === prev.length - 1 
            ? { ...msg, text: cleanText }
            : msg
        );
      } else {
        // Last message is from AI, add a new candidate message
        return [...prev, {
          id: `${Date.now()}-${Math.random()}`,
          character: "candidate",
          text: cleanText,
          timestamp: new Date(),
        }];
      }
    });
  }, []);

  // Function to add message to chat and play audio
  const addMessage = useCallback((character: string, text: string, playAudio: boolean = true) => {
    const cleanText = text.replace(/^"|"$/g, "").replace(/\\"/g, '"');
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      character: character || "ai",
      text: cleanText,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    // Play audio if enabled and text-to-speech is available
    if (playAudio && synthRef.current && cleanText) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.2; // Faster speech rate for better user experience
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Use a more natural voice if available
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(
        (voice) => voice.name.includes("Alex")
      ) || voices.find((voice) => voice.lang.startsWith("en"));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      synthRef.current.speak(utterance);
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop any ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    
    // Clear analyzing timeout
    if (analyzingTimeoutRef.current) {
      clearTimeout(analyzingTimeoutRef.current);
      analyzingTimeoutRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Start - Connect and start recording
  const startInterview = useCallback(async () => {
    // First, connect to WebSocket if not already connected
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      try {
        const ws = new WebSocket(`${wsUrl}/ws/interview/${token}/`);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setStatus("Connected");
          setError("");
          // Continue with recording setup after connection is established
          setupRecording();
        };

        ws.onmessage = (event) => {
          try {
            let data: any;
            
            if (typeof event.data === "string") {
              data = JSON.parse(event.data);
            } else {
              console.warn("Received binary data in WebSocket message");
              return;
            }
            
            if (!data.type && data.question) {
              data.type = "next_question";
            }
            
            switch (data.type) {
              case "connection_established":
                setStatus("Connection Established");
                setError("");
                break;
              case "greeting":
                const greetingText = data.message || "";
                const greetingCharacter = data.character || "ai";
                addMessage(greetingCharacter, greetingText, true);
                setStatus(`Connected to: ${data.panel_name || "Interview Panel"}`);
                if (data.panel_description) {
                  console.log("Panel Description:", data.panel_description);
                }
                break;
              case "transcription_update":
                // Update the last candidate message instead of adding a new one
                const transcriptionText = data.message || "";
                if (transcriptionText) {
                  updateLastCandidateMessage(transcriptionText);
                }
                break;
              case "scoring_update":
                setIsAnalyzing(true);
                setStatus("Analyzing your response...");
                if (analyzingTimeoutRef.current) {
                  clearTimeout(analyzingTimeoutRef.current);
                }
                analyzingTimeoutRef.current = setTimeout(() => {
                  setIsAnalyzing(true);
                  setStatus("Please wait while analysing your response...");
                }, 2000);
                break;
              case "next_question":
                setIsAnalyzing(false);
                if (analyzingTimeoutRef.current) {
                  clearTimeout(analyzingTimeoutRef.current);
                  analyzingTimeoutRef.current = null;
                }
                const questionText = data.message || "";
                const questionCharacter = data.character || "ai";
                
                if (questionText) {
                  setCurrentQuestion(questionText);
                  addMessage(questionCharacter, questionText, true);
                } else {
                  console.warn("Received question without message:", data);
                  setCurrentQuestion("Question received");
                }
                break;
              case "interview_completed":
                setIsInterviewCompleted(true);
                setIsRecording(false);
                setIsAnalyzing(false);
                if (analyzingTimeoutRef.current) {
                  clearTimeout(analyzingTimeoutRef.current);
                  analyzingTimeoutRef.current = null;
                }
                setStatus("Interview Completed");
                cleanup();
                break;
              case "error":
                setError(data.message || "An error occurred");
                setStatus("Error");
                break;
              default:
                console.warn("Unknown or untyped WebSocket message:", data);
                if (data.message) {
                  const messageCharacter = (data as any).character || "ai";
                  addMessage(messageCharacter, (data as any).message, true);
                } else if (data.question || (data.uuid && data.name)) {
                  const questionObj = data as QuestionObject;
                  const questionText = questionObj.question || questionObj.name || "Question received";
                  setCurrentQuestion(questionText);
                  const questionCharacter = (data as any).character || "ai";
                  addMessage(questionCharacter, questionText, true);
                }
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err, "Raw data:", event.data);
            setError(`Error processing message: ${err instanceof Error ? err.message : "Unknown error"}`);
          }
        };

        ws.onerror = (errorEvent) => {
          console.error("WebSocket error:", errorEvent);
          let errorMessage = "WebSocket connection error";
          
          if (errorEvent instanceof ErrorEvent) {
            errorMessage = errorEvent.message || errorMessage;
          } else if (errorEvent && typeof errorEvent === "object") {
            try {
              const errorStr = JSON.stringify(errorEvent);
              if (errorStr !== "{}") {
                errorMessage = `WebSocket error: ${errorStr}`;
              }
            } catch (e) {
              // If stringify fails, use default message
            }
          }
          
          setError(errorMessage);
          setStatus("Error");
        };

        ws.onclose = () => {
          setIsConnected(false);
          setStatus("Disconnected");
        };
      } catch (err) {
        console.error("Failed to connect:", err);
        setError("Failed to connect to WebSocket");
        return;
      }
    } else {
      // Already connected, just start recording
      setupRecording();
    }
  }, [token, wsUrl, cleanup, addMessage, updateLastCandidateMessage]);

  // Setup recording (separate function to be called after connection)
  const setupRecording = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("WebSocket not connected.");
      return;
    }

    try {
      // Request media access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: true, // For visual feedback
      });

      mediaStreamRef.current = stream;

      // Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }

      // Create AudioContext
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      
      // Create ScriptProcessorNode for audio processing
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      let audioBuffer: Int16Array[] = [];
      const targetSampleRate = 16000;
      const chunkDuration = 10; // 10 seconds
      const chunkSize = targetSampleRate * chunkDuration;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const int16Data = new Int16Array(inputData.length);
        
        // Convert float32 (-1.0 to 1.0) to int16 (PCM S16LE)
        // PCM S16LE: 16-bit signed little-endian
        for (let i = 0; i < inputData.length; i++) {
          // Clamp value to [-1, 1]
          const s = Math.max(-1, Math.min(1, inputData[i]));
          // Convert to 16-bit signed integer
          // For negative values: multiply by 0x8000 (32768)
          // For positive values: multiply by 0x7FFF (32767)
          int16Data[i] = s < 0 ? Math.round(s * 0x8000) : Math.round(s * 0x7FFF);
        }

        audioBuffer.push(int16Data);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Send chunks every 5 seconds
      intervalRef.current = setInterval(() => {
        if (audioBuffer.length > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Concatenate all buffered audio
          const totalLength = audioBuffer.reduce((sum, arr) => sum + arr.length, 0);
          
          if (totalLength > 0) {
            const concatenated = new Int16Array(totalLength);
            let offset = 0;
            
            for (const arr of audioBuffer) {
              concatenated.set(arr, offset);
              offset += arr.length;
            }

            // Send the entire buffer (or chunk if we have enough)
            // The backend will handle the processing
            if (concatenated.length >= chunkSize) {
              // Send a full 5-second chunk
              const chunk = concatenated.slice(0, chunkSize);
              wsRef.current.send(chunk.buffer);
              
              // Keep remaining data
              audioBuffer = [concatenated.slice(chunkSize)];
            } else {
              // Send what we have (less than 5 seconds)
              wsRef.current.send(concatenated.buffer);
              audioBuffer = [];
            }
          }
        }
      }, chunkDuration * 1000);

      setIsRecording(true);
      setError("");
      setStatus("Recording");
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to access microphone/camera. Please check permissions.");
      setStatus("Error");
    }
  }, []);

  // Stop - Stop recording and disconnect
  const stopInterview = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsRecording(false);
    
    // Disconnect WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setStatus("Stopped");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Show completion feedback screen
  if (isInterviewCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Interview Completed!</h2>
            <p className="text-gray-600">Thank you for participating in the interview.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Interview Feedback</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Overall Performance</h4>
                <p className="text-gray-600">
                  You demonstrated good understanding of the core concepts. Your responses showed 
                  practical knowledge and clear communication skills.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Strengths</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Clear articulation of technical concepts</li>
                  <li>Good problem-solving approach</li>
                  <li>Effective communication style</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Areas for Improvement</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Consider providing more detailed examples</li>
                  <li>Practice explaining complex topics in simpler terms</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Your interview results will be reviewed and you will be contacted shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {showInstructions && !isConnected && (
          <div className="mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Interview Guidelines</h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Do's
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
                  <li>Sit in a quiet room with minimal background noise</li>
                  <li>Use headphones for better audio quality</li>
                  <li>Speak clearly and at a moderate pace</li>
                  <li>Think before answering</li>
                  <li>Ask for clarification if needed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Don'ts
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
                  <li>Don't use external help or resources</li>
                  <li>Don't rush through your answers</li>
                  <li>Don't interrupt the interviewer</li>
                  <li>Don't use your phone or other devices</li>
                  <li>Don't have background music or TV on</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-2rem)]">
          {/* Left side - Video and Controls */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            {/* Video Feed */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden relative shadow-2xl border-2 border-gray-800" style={{ height: '60vh', maxHeight: '600px' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold mb-1 text-white">Camera Preview</p>
                    <p className="text-sm text-gray-400">Start recording to see your video</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isConnected ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {isConnected && (
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{status}</span>
                  {isAnalyzing && (
                    <div className="flex items-center space-x-2 ml-4 px-3 py-1 bg-blue-50 rounded-full">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-xs text-blue-600 font-medium">Analyzing...</span>
                    </div>
                  )}
                </div>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {!isRecording ? (
                  <button
                    onClick={startInterview}
                    disabled={isConnected && !isRecording}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start
                  </button>
                ) : (
                  <button
                    onClick={stopInterview}
                    className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Transcription */}
          <div className="lg:col-span-1 flex flex-col space-y-4">
            {/* Current Question */}
            {currentQuestion && (
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-5 shadow-lg border border-blue-100">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Current Question
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">{currentQuestion}</p>
              </div>
            )}

            {/* Chat Messages */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 flex flex-col" style={{ height: '400px', maxHeight: '400px' }}>
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Conversation
                </h3>
                <span className="text-xs text-gray-500">{messages.length} messages</span>
              </div>
              <div className="flex-1 overflow-y-auto rounded-lg space-y-3 pr-2" style={{ maxHeight: 'calc(400px - 60px)' }}>
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm">Conversation will appear here...</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.character === "ai" || message.character === "system"
                          ? "justify-start"
                          : "justify-end"
                      } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                          message.character === "ai" || message.character === "system"
                            ? "bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800 border border-blue-100"
                            : "bg-gradient-to-br from-green-50 to-emerald-50 text-gray-800 border border-green-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold opacity-80 uppercase tracking-wide">
                            {message.character === "ai" ? "🤖 AI Interviewer" : "👤 You"}
                          </span>
                          <span className="text-xs opacity-50 ml-2">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

