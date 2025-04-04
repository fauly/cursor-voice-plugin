import * as vscode from 'vscode';
import { AiService } from './aiService';

export class VoiceService {
    private recognition: SpeechRecognition | null = null;
    private synthesis: SpeechSynthesis | null = null;
    private isListening: boolean = false;
    private aiService: AiService;

    constructor() {
        this.aiService = new AiService();
        
        // Check if we're in a browser context
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            this.recognition = new (window as any).webkitSpeechRecognition();
            this.setupRecognition();
        } else {
            console.error('Speech recognition is not supported in this environment.');
        }

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        }
    }

    private setupRecognition() {
        if (!this.recognition) return;

        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            const results = event.results;
            let transcript = '';
            
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (result.isFinal) {
                    transcript += result[0].transcript;
                }
            }

            if (transcript) {
                // Send the transcript to the AI
                this.handleUserInput(transcript);
            }
        };

        this.recognition.onerror = (event: SpeechRecognitionError) => {
            console.error(`Speech recognition error: ${event.error}`);
        };
    }

    private async handleUserInput(text: string) {
        // Display user input
        console.log(`User said: ${text}`);
        vscode.window.showInformationMessage(`You said: ${text}`);
        
        // Get AI response
        const response = await this.aiService.queryAi(text);
        
        // Display and speak response
        vscode.window.showInformationMessage(`AI: ${response}`);
        this.speakResponse(response);
    }

    private speakResponse(text: string) {
        if (!this.synthesis || typeof window === 'undefined') return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        this.synthesis.speak(utterance);
    }

    public async startVoiceChat() {
        if (!this.recognition) {
            console.error('Speech recognition is not available.');
            vscode.window.showErrorMessage('Speech recognition is not available.');
            return;
        }

        if (!this.isListening) {
            this.recognition.start();
            this.isListening = true;
            vscode.window.showInformationMessage('Voice chat started. Speak now...');
        }
    }

    public stopVoiceChat() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            vscode.window.showInformationMessage('Voice chat stopped.');
        }
    }
} 