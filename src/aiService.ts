import * as vscode from 'vscode';
import { CursorAiIntegration } from './cursorAiIntegration';

export class AiService {
    private cursorAiIntegration: CursorAiIntegration;
    
    constructor() {
        this.cursorAiIntegration = new CursorAiIntegration();
    }
    
    /**
     * Sends a text query to Cursor's AI and returns the response
     * @param query The text query to send to the AI
     * @returns A promise that resolves to the AI's response text
     */
    public async queryAi(query: string): Promise<string> {
        try {
            // Check if the Cursor AI API is available
            const isApiAvailable = await this.cursorAiIntegration.isAiApiAvailable();
            
            if (isApiAvailable) {
                // Use the Cursor AI integration
                return await this.cursorAiIntegration.sendQueryToCursorAi(query);
            } else {
                // Fall back to a basic response if the API is not available
                console.log('Cursor AI API not available, using fallback response');
                return this.getFallbackResponse(query);
            }
        } catch (error) {
            console.error('Error querying AI:', error);
            vscode.window.showErrorMessage(`AI query error: ${error}`);
            return `Sorry, I encountered an error processing your request: ${error}`;
        }
    }
    
    /**
     * Returns a basic fallback response when the Cursor AI API is not available
     * @param query The original query text
     * @returns A simple response based on the query
     */
    private getFallbackResponse(query: string): string {
        // Very simple response generation
        return `I received your question about "${query}". This is a fallback response as the Cursor AI API is not currently available.`;
    }
} 