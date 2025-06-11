# AI Mobile Development Platform

A comprehensive React Native/Expo development platform powered by AI agents that can generate complete mobile applications from natural language descriptions.

## Features

### 🤖 AI Agent System
- **Autonomous Code Generation**: Generate complete React Native/Expo applications from descriptions
- **Multi-Framework Support**: React Native, Expo, and game development
- **Intelligent Planning**: AI analyzes requirements and creates optimal project structures
- **Error Recovery**: Built-in retry logic and error handling

### 📁 File System Management
- **Project Organization**: Automatic file structure creation and management
- **Atomic Operations**: Safe file operations with rollback capabilities
- **Cross-Platform**: Works seamlessly across iOS, Android, and Web
- **Asset Management**: Handles images, fonts, and other project assets

### 🎮 Live Preview Engine
- **Dual Preview Modes**: Web application and game preview support
- **Hot Reload**: Real-time code updates without restart
- **Physics Integration**: Built-in Matter.js physics engine for games
- **Asset Loading**: Dynamic sprite and sound loading

### 💻 Development Interface
- **Code Editor**: Full-featured editor with syntax highlighting
- **Project Explorer**: Hierarchical file browser with search
- **AI Chat**: Conversational interface for project modifications
- **Preview Panel**: Real-time application preview

## Architecture

### Core Modules

#### 1. File System Service (`services/FileSystemService.ts`)
Handles all file operations with atomic guarantees:

```typescript
// Create a new project
const projectPath = await fileSystemService.createProject('MyApp');

// Write files atomically
await fileSystemService.writeFile(projectPath, 'App.tsx', content);

// Read project files
const content = await fileSystemService.readFile(projectPath, 'App.tsx');

// List all files
const files = await fileSystemService.listFiles(projectPath);
```

#### 2. Agent Core (`services/AgentCore.ts`)
Orchestrates AI-powered code generation:

```typescript
// Initialize with API key
agentCore.setApiKey('your-openai-key');

// Generate complete project
const request: GenerationRequest = {
  description: 'A todo app with dark theme',
  projectType: 'app',
  framework: 'expo'
};

const projectPath = await agentCore.generateProject(request);
```

#### 3. Preview Engine (`services/PreviewEngine.ts`)
Manages live preview and hot reload:

```typescript
// Start web preview
const previewUrl = await previewEngine.startPreview(projectPath, {
  mode: 'web',
  entryPoint: 'app/_layout.tsx',
  hotReload: true
});

// Start game preview with physics
const gameUrl = await previewEngine.startPreview(projectPath, {
  mode: 'game',
  entryPoint: 'game/index.tsx',
  hotReload: true
});
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- Expo CLI
- AI API key (OpenAI, Claude, or Gemini)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-mobile-dev-platform
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Configuration

1. **API Key Setup**: Enter your AI API key in the settings screen
2. **Framework Selection**: Choose between React Native, Expo, or Game development
3. **Project Type**: Select app, game, or component generation

## Usage

### Generating Projects

1. **Navigate to AI Agent tab**
2. **Enter API key** when prompted
3. **Describe your project** in natural language
4. **Select framework** and project type
5. **Click Generate** and watch the AI create your app

Example descriptions:
- "A social media app with dark theme and real-time chat"
- "A 2D platformer game with physics and collectibles"
- "A weather app with location services and animations"

### Live Preview

1. **Generate or load a project**
2. **Click Web Preview** for standard app preview
3. **Click Game Preview** for game development
4. **Edit code** and see changes in real-time

### Project Management

- **View all projects** in the Projects tab
- **Load existing projects** by clicking on them
- **Delete projects** using the trash icon
- **Export projects** for external development

## API Integration

### Supported AI Providers

- **OpenAI GPT-4**: Best for complex applications
- **Claude**: Excellent for code quality and documentation
- **Gemini**: Good for creative and game development

### Custom AI Integration

Extend the `AgentCore` class to add new AI providers:

```typescript
class CustomAgentCore extends AgentCore {
  private async callCustomAI(prompt: string): Promise<AIResponse> {
    // Implement your custom AI integration
  }
}
```

## Game Development

### Physics Engine Integration

The platform includes Matter.js physics engine for game development:

```typescript
// Game configuration
const gameConfig: GameConfig = {
  physics: true,
  engine: 'matter-js',
  sprites: ['player.png', 'enemy.png'],
  sounds: ['jump.mp3', 'collect.wav']
};
```

### Asset Management

- **Sprites**: Place in `assets/sprites/`
- **Sounds**: Place in `assets/sounds/`
- **Fonts**: Place in `assets/fonts/`

## Testing

Run the test suite:

```bash
npm test
```

### Test Coverage

- **File System Service**: Atomic operations, error handling
- **Agent Core**: Project generation, AI integration
- **Preview Engine**: Bundle creation, hot reload
- **React Hooks**: State management, error handling

## Performance Optimization

### Memory Management
- **Lazy Loading**: Components loaded on demand
- **Asset Optimization**: Automatic image compression
- **Bundle Splitting**: Separate bundles for different features

### Mobile Optimization
- **Offline Support**: Local project storage
- **Battery Efficiency**: Optimized background processing
- **Network Awareness**: Adaptive quality based on connection

## Deployment

### Web Deployment
```bash
npm run build:web
```

### Mobile Deployment
```bash
expo build:android
expo build:ios
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

### Development Guidelines

- **TypeScript**: All code must be typed
- **Testing**: Maintain 80%+ test coverage
- **Documentation**: Update README for new features
- **Performance**: Profile memory usage for mobile

## Troubleshooting

### Common Issues

**API Key Not Working**
- Verify key is valid and has sufficient credits
- Check network connectivity
- Ensure correct provider is selected

**Preview Not Loading**
- Check project structure is valid
- Verify entry point exists
- Review console logs for errors

**File System Errors**
- Check device storage space
- Verify app permissions
- Clear app cache if needed

## License

MIT License - see LICENSE file for details

## Support

- **Documentation**: Check the wiki for detailed guides
- **Issues**: Report bugs on GitHub Issues
- **Community**: Join our Discord for discussions
- **Email**: support@ai-mobile-dev.com

---

Built with ❤️ using React Native, Expo, and AI