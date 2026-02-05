
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentIdea?: string;
  onApplyIdea?: (idea: string) => void;
}

// Audio helpers as per guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const LiveAgent: React.FC<Props> = ({ isOpen, onClose, currentIdea, onApplyIdea }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [transcription, setTranscription] = useState<{ type: 'user' | 'model', text: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptionRef = useRef({ user: '', model: '' });

  useEffect(() => {
    if (isOpen && status === 'idle') {
      startSession();
    }
    return () => {
      stopSession();
    };
  }, [isOpen]);

  const startSession = async () => {
    setStatus('connecting');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputAudioContext, output: outputAudioContext };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('active');
            setIsRecording(true);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              // We solely rely on isRecording state here
              if (!isRecording) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcription
            if (message.serverContent?.outputTranscription) {
              transcriptionRef.current.model += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              transcriptionRef.current.user += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const uText = transcriptionRef.current.user;
              const mText = transcriptionRef.current.model;
              setTranscription(prev => [
                ...prev, 
                ...(uText ? [{ type: 'user' as const, text: uText }] : []),
                ...(mText ? [{ type: 'model' as const, text: mText }] : [])
              ]);
              transcriptionRef.current = { user: '', model: '' };
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContext) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live Agent Error:', e);
            setStatus('error');
          },
          onclose: () => {
            setStatus('idle');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are the SkillForge Support Agent. You help users design professional AI Agent skillsets. 
          The user is currently telling you about their project idea. 
          Current state of their Idea: "${currentIdea || 'Starting from scratch'}"
          Help them refine it into a clear, engineer-able concept. 
          Be friendly, concise, and technical when needed.`
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start Live session:', err);
      setStatus('error');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.input.close();
      audioContextRef.current.output.close();
      audioContextRef.current = null;
    }
    setStatus('idle');
  };

  const handleApply = async () => {
    if (!onApplyIdea) return;
    setIsApplying(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const fullTranscript = transcription.map(t => `${t.type}: ${t.text}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on the following conversation with a user about their AI agent idea, 
        generate a concise, professional 1-2 sentence description of the project idea to be used as a primary project description.
        Only return the description, nothing else.
        
        Conversation:
        ${fullTranscript}`,
      });
      
      if (response.text) {
        onApplyIdea(response.text.trim());
        onClose();
      }
    } catch (err) {
      console.error("Apply error:", err);
      alert("Failed to summarize idea. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div>
             <span className="font-bold text-white text-sm">Forge Support Agent</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {transcription.length === 0 && status === 'active' && (
            <div className="text-center py-12 text-slate-500 italic text-sm">
              "Hi! I'm your Forge assistant. Describe your AI agent idea to me, and I'll help you refine it."
            </div>
          )}
          
          {transcription.map((t, idx) => (
            <div key={idx} className={`flex ${t.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                t.type === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-slate-300'
              }`}>
                {t.text}
              </div>
            </div>
          ))}
          
          {status === 'connecting' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500">Establishing secure connection...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-12 text-red-400 text-sm">
              An error occurred. Please check your microphone permissions.
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-950 border-t border-slate-800 space-y-6">
          <div className="flex items-center justify-center gap-12">
            <button 
              onClick={() => setIsRecording(!isRecording)}
              disabled={status !== 'active'}
              className={`group flex flex-col items-center gap-2 p-2 transition-all disabled:opacity-30`}
              title={isRecording ? "Stop Recording Snippet" : "Start Recording Snippet"}
            >
              <div className={`p-4 rounded-full ${isRecording ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-800 hover:bg-slate-700'}`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isRecording ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 9h6v6H9z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-tighter font-bold">
                {isRecording ? "Listening..." : "Record Snippet"}
              </span>
            </button>
          </div>

          <div className="flex gap-3">
             <button 
                onClick={handleApply}
                disabled={transcription.length === 0 || isApplying}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
             >
                {isApplying ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Summarize & Use Idea
             </button>
             <button 
                onClick={onClose}
                className="px-6 py-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-sm transition-all"
             >
                Cancel
             </button>
          </div>
          
          <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold text-center">
             Conversational AI Assistant Powered by Gemini Live
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveAgent;
