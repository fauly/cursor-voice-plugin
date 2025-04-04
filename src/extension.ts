import * as vscode from 'vscode';
import { VoicePanel } from './webview/voicePanel';
import { AiService } from './aiService';
import { SettingsService } from './settingsService';

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('Cursor Voice Plugin is now active');
    
    const aiService = new AiService();
    const settingsService = SettingsService.getInstance();
    
    // Register start voice chat command
    let startVoiceChatCommand = vscode.commands.registerCommand('cursor-voice-plugin.startVoiceChat', () => {
        try {
            // Get panel position from settings
            const position = settingsService.getPanelPosition();
            let viewColumn: vscode.ViewColumn;
            
            switch (position) {
                case 'beside':
                    viewColumn = vscode.ViewColumn.Beside;
                    break;
                case 'active':
                    viewColumn = vscode.window.activeTextEditor 
                        ? vscode.window.activeTextEditor.viewColumn || vscode.ViewColumn.One
                        : vscode.ViewColumn.One;
                    break;
                case 'current':
                default:
                    viewColumn = vscode.ViewColumn.One;
                    break;
            }
            
            // Create and show the webview panel
            VoicePanel.createOrShow(context.extensionPath, viewColumn);
            
            // Start listening for voice input
            if (VoicePanel.currentPanel) {
                VoicePanel.currentPanel.startListening();
                settingsService.showInformationMessage('Voice chat started');
            }
        } catch (error) {
            settingsService.showErrorMessage(`Failed to start voice chat: ${error}`);
        }
    });
    
    // Register stop voice chat command
    let stopVoiceChatCommand = vscode.commands.registerCommand('cursor-voice-plugin.stopVoiceChat', () => {
        try {
            // Stop listening for voice input
            if (VoicePanel.currentPanel) {
                VoicePanel.currentPanel.stopListening();
                settingsService.showInformationMessage('Voice chat stopped');
            }
        } catch (error) {
            settingsService.showErrorMessage(`Failed to stop voice chat: ${error}`);
        }
    });
    
    // Register list voice commands command
    let listVoiceCommandsCommand = vscode.commands.registerCommand('cursor-voice-plugin.listVoiceCommands', () => {
        try {
            // Display voice commands in a quick pick panel
            if (VoicePanel.currentPanel) {
                VoicePanel.currentPanel.listVoiceCommands();
            } else {
                settingsService.showInformationMessage('Start voice chat first to see available commands');
            }
        } catch (error) {
            settingsService.showErrorMessage(`Failed to list voice commands: ${error}`);
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
    
    // Listen for configuration changes
    const configListener = settingsService.onConfigurationChanged(() => {
        if (VoicePanel.currentPanel) {
            VoicePanel.currentPanel.updateSettings();
        }
    });
    
    // Add commands and disposables to subscriptions
    context.subscriptions.push(startVoiceChatCommand);
    context.subscriptions.push(stopVoiceChatCommand);
    context.subscriptions.push(listVoiceCommandsCommand);
    context.subscriptions.push(configListener);
}

// This method is called when the extension is deactivated
export function deactivate() {
    console.log('Cursor Voice Plugin has been deactivated');
} 