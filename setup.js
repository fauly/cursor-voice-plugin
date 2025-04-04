const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure directories exist
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
};

// Main setup function
function setup() {
    console.log('Setting up Cursor Voice Plugin development environment...');
    
    // Create necessary directories
    ensureDir(path.join(__dirname, 'dist'));
    ensureDir(path.join(__dirname, 'src'));
    ensureDir(path.join(__dirname, '.vscode'));
    
    try {
        // Install dependencies
        console.log('\nInstalling dependencies...');
        execSync('npm install', { stdio: 'inherit' });
        
        // Build project
        console.log('\nBuilding project...');
        execSync('npm run build', { stdio: 'inherit' });
        
        console.log('\nSetup complete! You can now start developing your Cursor Voice Plugin.');
        console.log('\nTo test your plugin:');
        console.log('1. Open Cursor');
        console.log('2. Press Ctrl+Shift+P to open the command palette');
        console.log('3. Type "Start Voice Chat" and press Enter');
    } catch (error) {
        console.error('An error occurred during setup:', error.message);
    }
}

// Run setup
setup(); 