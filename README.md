# Cursor Voice Plugin

A plugin for Cursor IDE that enables voice interaction with the built-in AI assistant.

## Features

- Speech recognition for voice commands
- Text-to-speech for AI responses
- Seamless integration with Cursor's AI assistant
- User-friendly interface in a webview panel
- Built-in voice commands for common IDE operations
- Highly configurable through settings

## Voice Commands

The plugin comes with built-in voice commands for common IDE operations:

- "Open file" - Opens the file dialog
- "Save" or "Save file" - Saves the current file
- "Save all files" - Saves all open files
- "Go to line" - Opens the go to line dialog
- "Find" - Opens the find dialog
- "Search" - Opens the search dialog
- "Undo" - Undoes the last action
- "Redo" - Redoes the last action
- "List commands" - Lists all available voice commands

Any other voice input will be sent to the AI assistant for processing.

## How It Works

This plugin uses:
1. VSCode/Cursor WebView API to create a browser context inside the IDE
2. Web Speech API for speech recognition and synthesis
3. Communication between the extension and the webview for seamless interaction
4. Integration with Cursor's AI capabilities

## Setup

1. Clone this repository
2. Run `node setup.js` to set up the development environment
3. Run `npm install` to install dependencies
4. Run `npm run build` to compile the plugin
5. Copy the compiled plugin to your Cursor extensions folder

## Configuration

The plugin is highly configurable through settings:

| Setting | Description | Default |
|---------|-------------|---------|
| `cursorVoicePlugin.speechRecognition.language` | Language used for speech recognition | `en-US` |
| `cursorVoicePlugin.speechSynthesis.rate` | Speech rate for text-to-speech (0.1 to 2.0) | `1.0` |
| `cursorVoicePlugin.speechSynthesis.pitch` | Speech pitch for text-to-speech (0.1 to 2.0) | `1.0` |
| `cursorVoicePlugin.ui.showStatusMessages` | Show status messages in the VS Code UI | `true` |
| `cursorVoicePlugin.commands.enabled` | Enable built-in voice commands for IDE operations | `true` |
| `cursorVoicePlugin.panel.position` | Where to open the voice chat panel (current, beside, active) | `beside` |

## Testing

### Testing in Browser (Easiest)

For quick testing of the speech recognition:

1. Open the `webview/index.html` file in a modern browser (Chrome works best)
2. Allow microphone permissions when prompted
3. Click "Start Listening" and speak
4. The recognized text will appear in the transcript panel
5. A simulated AI response will be spoken back to you

### Testing in Cursor

To test the full extension in Cursor:

1. Open Cursor IDE
2. Press `Ctrl+Shift+P` to open the command palette
3. Type "Start Voice Chat" and press Enter
4. When the webview panel opens, allow microphone permissions
5. Speak your commands to interact with the AI assistant
6. The AI will respond both in text and speech

## Browser Compatibility

The Web Speech API is best supported in:
- Google Chrome (recommended)
- Microsoft Edge
- Safari (partial support)

Firefox has limited support and may require enabling experimental features.

## Troubleshooting

### Microphone Permissions

If the microphone isn't working:

1. Ensure your browser/Cursor has microphone permissions
2. Check that no other application is using the microphone
3. Try using a different browser if testing the standalone HTML file

### Speech Recognition Issues

If speech recognition is not working:

1. Make sure you're using a supported browser
2. Check your internet connection (some speech recognition engines require it)
3. Speak clearly and in a quiet environment

## Development

### Building the Plugin

```bash
npm install
npm run build
```

### Project Structure

- `src/extension.ts` - Main extension entry point
- `src/webview/voicePanel.ts` - Webview panel implementation
- `src/aiService.ts` - AI communication service
- `src/cursorAiIntegration.ts` - Integration with Cursor's AI
- `src/voiceService.ts` - Voice recognition and synthesis service
- `src/settingsService.ts` - Configuration and settings handler
- `webview/index.html` - Standalone test page
- `webview/styles.css` - Styles for the webview

## License

MIT 