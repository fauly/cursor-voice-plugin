import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AiService } from '../aiService';

export class VoicePanel {
    public static currentPanel: VoicePanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;
    private _disposables: vscode.Disposable[] = [];
    private _aiService: AiService;

    private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
        this._panel = panel;
        this._extensionPath = extensionPath;
        this._aiService = new AiService();

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'transcription':
                        // Send the transcription to the AI
                        vscode.window.showInformationMessage(`Transcription: ${message.text}`);
                        
                        // Call the AI service to process the input
                        this._handleUserInput(message.text);
                        return;
                    case 'error':
                        vscode.window.showErrorMessage(`Voice error: ${message.text}`);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionPath: string) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (VoicePanel.currentPanel) {
            VoicePanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            'voiceChat',
            'Voice Chat',
            column || vscode.ViewColumn.One,
            {
                // Enable JavaScript in the webview
                enableScripts: true,
                // Restrict the webview to only load content from our extension's directory
                localResourceRoots: [
                    vscode.Uri.file(path.join(extensionPath, 'webview'))
                ]
            }
        );

        VoicePanel.currentPanel = new VoicePanel(panel, extensionPath);
    }

    public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
        VoicePanel.currentPanel = new VoicePanel(panel, extensionPath);
    }

    public startListening() {
        this._panel.webview.postMessage({ command: 'startListening' });
    }

    public stopListening() {
        this._panel.webview.postMessage({ command: 'stopListening' });
    }

    private async _handleUserInput(text: string) {
        try {
            // Get AI response
            const response = await this._aiService.queryAi(text);
            
            // Send the response back to the webview to be spoken
            this._panel.webview.postMessage({ 
                command: 'speak', 
                text: response 
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error processing voice input: ${error}`);
        }
    }

    private _update() {
        const webviewHtml = this._getHtmlForWebview();
        this._panel.webview.html = webviewHtml;
    }

    private _getHtmlForWebview() {
        // Create the HTML content for the webview
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Voice Chat</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                }
                .status {
                    margin-bottom: 20px;
                    padding: 10px;
                    border-radius: 5px;
                    background-color: var(--vscode-inputValidation-infoBackground);
                }
                .transcript {
                    margin-top: 20px;
                    padding: 10px;
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 5px;
                    min-height: 100px;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .status.listening {
                    background-color: var(--vscode-inputValidation-warningBackground);
                }
            </style>
        </head>
        <body>
            <div class="status" id="status">Ready to listen</div>
            <div class="transcript" id="transcript"></div>

            <script>
                (function() {
                    const vscode = acquireVsCodeApi();
                    const statusElement = document.getElementById('status');
                    const transcriptElement = document.getElementById('transcript');
                    
                    let recognition = null;
                    let isListening = false;

                    // Initialize speech recognition
                    function initSpeechRecognition() {
                        if (!('webkitSpeechRecognition' in window)) {
                            statusElement.textContent = 'Speech recognition not supported in this browser';
                            vscode.postMessage({
                                command: 'error',
                                text: 'Speech recognition not supported'
                            });
                            return false;
                        }

                        recognition = new webkitSpeechRecognition();
                        recognition.continuous = true;
                        recognition.interimResults = true;
                        recognition.lang = 'en-US';

                        recognition.onresult = (event) => {
                            let interimTranscript = '';
                            let finalTranscript = '';

                            for (let i = event.resultIndex; i < event.results.length; ++i) {
                                const transcript = event.results[i][0].transcript;
                                if (event.results[i].isFinal) {
                                    finalTranscript += transcript;
                                } else {
                                    interimTranscript += transcript;
                                }
                            }

                            if (finalTranscript) {
                                // Send the final transcript to the extension
                                vscode.postMessage({
                                    command: 'transcription',
                                    text: finalTranscript
                                });
                                
                                // Add to transcript display
                                const messageElement = document.createElement('div');
                                messageElement.textContent = 'You: ' + finalTranscript;
                                transcriptElement.appendChild(messageElement);
                                transcriptElement.scrollTop = transcriptElement.scrollHeight;
                            }
                            
                            // Show interim results
                            if (interimTranscript) {
                                statusElement.textContent = 'Listening: ' + interimTranscript;
                            }
                        };

                        recognition.onerror = (event) => {
                            vscode.postMessage({
                                command: 'error',
                                text: event.error
                            });
                            statusElement.textContent = 'Error: ' + event.error;
                        };

                        return true;
                    }

                    // Start listening for speech
                    function startListening() {
                        if (!recognition && !initSpeechRecognition()) {
                            return;
                        }
                        
                        if (!isListening) {
                            recognition.start();
                            isListening = true;
                            statusElement.textContent = 'Listening...';
                            statusElement.classList.add('listening');
                        }
                    }

                    // Stop listening for speech
                    function stopListening() {
                        if (recognition && isListening) {
                            recognition.stop();
                            isListening = false;
                            statusElement.textContent = 'Stopped listening';
                            statusElement.classList.remove('listening');
                        }
                    }

                    // Text-to-speech functionality
                    function speak(text) {
                        if (!('speechSynthesis' in window)) {
                            return;
                        }
                        
                        // Add to transcript display
                        const messageElement = document.createElement('div');
                        messageElement.textContent = 'AI: ' + text;
                        transcriptElement.appendChild(messageElement);
                        transcriptElement.scrollTop = transcriptElement.scrollHeight;
                        
                        // Speak the text
                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.rate = 1.0;
                        utterance.pitch = 1.0;
                        window.speechSynthesis.speak(utterance);
                    }

                    // Handle messages from the extension
                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.command) {
                            case 'startListening':
                                startListening();
                                break;
                            case 'stopListening':
                                stopListening();
                                break;
                            case 'speak':
                                speak(message.text);
                                break;
                        }
                    });

                    // Initialize
                    initSpeechRecognition();
                })();
            </script>
        </body>
        </html>`;
    }

    public dispose() {
        VoicePanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
} 