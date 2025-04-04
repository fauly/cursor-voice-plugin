declare interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionError) => void;
}

declare interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
}

declare interface SpeechRecognitionResultList {
    readonly length: number;
    [index: number]: SpeechRecognitionResult;
}

declare interface SpeechRecognitionResult {
    readonly length: number;
    [index: number]: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
}

declare interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

declare interface SpeechRecognitionError extends Event {
    readonly error: string;
}

declare interface SpeechSynthesis {
    speak(utterance: SpeechSynthesisUtterance): void;
    cancel(): void;
    pause(): void;
    resume(): void;
    readonly speaking: boolean;
    readonly paused: boolean;
    readonly pending: boolean;
}

declare interface SpeechSynthesisUtterance extends EventTarget {
    text: string;
    lang: string;
    voice: SpeechSynthesisVoice | null;
    volume: number;
    rate: number;
    pitch: number;
}

declare interface SpeechSynthesisVoice {
    readonly voiceURI: string;
    readonly name: string;
    readonly lang: string;
    readonly localService: boolean;
    readonly default: boolean;
}

declare interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    speechSynthesis: SpeechSynthesis;
} 