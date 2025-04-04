import * as vscode from 'vscode';
import { VoicePanel } from './webview/voicePanel';
import { AiService } from './aiService';

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('Cursor Voice Plugin is now active');
    
    const aiService = new AiService();
    
    // Register start voice chat command
    let startVoiceChatCommand = vscode.commands.registerCommand('cursor-voice-plugin.startVoiceChat', () => {
        try {
            // Create and show the webview panel
            VoicePanel.createOrShow(context.extensionPath);
            
            // Start listening for voice input
            if (VoicePanel.currentPanel) {
                VoicePanel.currentPanel.startListening();
                vscode.window.showInformationMessage('Voice chat started');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to start voice chat: ${error}`);
        }
    });
    
    // Register stop voice chat command
    let stopVoiceChatCommand = vscode.commands.registerCommand('cursor-voice-plugin.stopVoiceChat', () => {
        try {
            // Stop listening for voice input
            if (VoicePanel.currentPanel) {
                VoicePanel.currentPanel.stopListening();
                vscode.window.showInformationMessage('Voice chat stopped');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to stop voice chat: ${error}`);
        }
    });
    
    // Register webview panel serializer for persistence across window reloads
    if (vscode.window.registerWebviewPanelSerializer) {
        vscode.window.registerWebviewPanelSerializer('voiceChat', {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                VoicePanel.revive(webviewPanel, context.extensionPath);
            }
        });
    }
    
    // Add commands to subscriptions
    context.subscriptions.push(startVoiceChatCommand);
    context.subscriptions.push(stopVoiceChatCommand);
}

// This method is called when the extension is deactivated
export function deactivate() {
    console.log('Cursor Voice Plugin has been deactivated');
} 