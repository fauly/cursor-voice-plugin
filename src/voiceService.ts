import * as vscode from 'vscode';
import { AiService } from './aiService';

// Voice commands mapping
interface VoiceCommand {
    execute: () => Promise<void>;
    description: string;
}

export class VoiceService {
    private recognition: SpeechRecognition | null = null;
    private synthesis: SpeechSynthesis | null = null;
    private isListening: boolean = false;
    private aiService: AiService;
    private voiceCommands: Map<RegExp, VoiceCommand> = new Map<RegExp, VoiceCommand>();

    constructor() {
        this.aiService = new AiService();
        this.setupVoiceCommands();
        
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

    private setupVoiceCommands() {
        this.voiceCommands = new Map<RegExp, VoiceCommand>();
        
        // File operations
        this.voiceCommands.set(/^open file$/i, {
            execute: async () => {
                await vscode.commands.executeCommand('workbench.action.files.openFile');
                this.speakResponse('Opening file dialog');
            },
            description: 'Opens the file dialog'
        });
        
        this.voiceCommands.set(/^save( file)?$/i, {
            execute: async () => {
                await vscode.commands.executeCommand('workbench.action.files.save');
                this.speakResponse('File saved');
            },
            description: 'Saves the current file'
        });
        
        this.voiceCommands.set(/^save all( files)?$/i, {
            execute: async () => {
                await vscode.commands.executeCommand('workbench.action.files.saveAll');
                this.speakResponse('All files saved');
            },
            description: 'Saves all open files'
        });
        
        // Navigation
        this.voiceCommands.set(/^go to line (\d+)$/i, {
            execute: async () => {
                await vscode.commands.executeCommand('workbench.action.gotoLine');
                this.speakResponse('Go to line');
            },
            description: 'Opens the go to line dialog'
        });
        
        this.voiceCommands.set(/^find$/i, {
            execute: async () => {
                await vscode.commands.executeCommand('actions.find');
                this.speakResponse('Opening find dialog');
            },
            description: 'Opens the find dialog'
        });
        
        this.voiceCommands.set(/^search$/i, {
            execute: async () => {
                await vscode.commands.executeCommand('workbench.action.findInFiles');
                this.speakResponse('Opening search dialog');
            },
            description: 'Opens the search dialog'
        });
        
        // Editor operations
        this.voiceCommands.set(/^undo$/i, {
            execute: async () => {
                await vscode.commands.executeCommand('undo');
                this.speakResponse('Undoing last action');
            },
            description: 'Undoes the last action'
        });
        
        this.voiceCommands.set(/^redo$/i, {
            execute: async () => {
                await vscode.commands.executeCommand('redo');
                this.speakResponse('Redoing last action');
            },
            description: 'Redoes the last action'
        });
        
        // Help
        this.voiceCommands.set(/^list commands$/i, {
            execute: async () => {
                const commandDescriptions = Array.from(this.voiceCommands.entries())
                    .map(([pattern, command]) => `"${pattern.source}": ${command.description}`)
                    .join('\n');
                
                vscode.window.showInformationMessage('Available voice commands:');
                vscode.window.showInformationMessage(commandDescriptions);
                this.speakResponse('Here are the available voice commands');
            },
            description: 'Lists all available voice commands'
        });
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
                // Send the transcript to be processed
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
        
        // Check if the input matches any voice command
        let commandExecuted = false;
        
        for (const [pattern, command] of this.voiceCommands.entries()) {
            const match = text.match(pattern);
            if (match) {
                try {
                    await command.execute();
                    commandExecuted = true;
                    break;
                } catch (error) {
                    console.error(`Error executing command ${pattern}:`, error);
                    this.speakResponse(`I had trouble executing that command. ${error}`);
                }
            }
        }
        
        // If no command was executed, send to AI
        if (!commandExecuted) {
            // Get AI response
            const response = await this.aiService.queryAi(text);
            
            // Display and speak response
            vscode.window.showInformationMessage(`AI: ${response}`);
            this.speakResponse(response);
        }
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