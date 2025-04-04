import * as vscode from 'vscode';

/**
 * Service to handle plugin settings and configuration
 */
export class SettingsService {
    private static instance: SettingsService;
    
    /**
     * Get the singleton instance of the settings service
     */
    public static getInstance(): SettingsService {
        if (!SettingsService.instance) {
            SettingsService.instance = new SettingsService();
        }
        return SettingsService.instance;
    }
    
    /**
     * Get the speech recognition language setting
     */
    public getSpeechRecognitionLanguage(): string {
        return this.getConfiguration().get('speechRecognition.language', 'en-US');
    }
    
    /**
     * Get the speech synthesis rate setting
     */
    public getSpeechSynthesisRate(): number {
        return this.getConfiguration().get('speechSynthesis.rate', 1.0);
    }
    
    /**
     * Get the speech synthesis pitch setting
     */
    public getSpeechSynthesisPitch(): number {
        return this.getConfiguration().get('speechSynthesis.pitch', 1.0);
    }
    
    /**
     * Check if showing status messages is enabled
     */
    public isShowStatusMessagesEnabled(): boolean {
        return this.getConfiguration().get('ui.showStatusMessages', true);
    }
    
    /**
     * Check if built-in voice commands are enabled
     */
    public areVoiceCommandsEnabled(): boolean {
        return this.getConfiguration().get('commands.enabled', true);
    }
    
    /**
     * Get the panel position setting
     */
    public getPanelPosition(): 'current' | 'beside' | 'active' {
        return this.getConfiguration().get('panel.position', 'beside') as 'current' | 'beside' | 'active';
    }
    
    /**
     * Show an information message if status messages are enabled
     */
    public showInformationMessage(message: string): void {
        if (this.isShowStatusMessagesEnabled()) {
            vscode.window.showInformationMessage(message);
        }
    }
    
    /**
     * Show an error message if status messages are enabled
     */
    public showErrorMessage(message: string): void {
        if (this.isShowStatusMessagesEnabled()) {
            vscode.window.showErrorMessage(message);
        }
    }
    
    /**
     * Get the configuration for the extension
     */
    private getConfiguration(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration('cursorVoicePlugin');
    }
    
    /**
     * Register a callback for when settings change
     */
    public onConfigurationChanged(callback: () => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('cursorVoicePlugin')) {
                callback();
            }
        });
    }
} 