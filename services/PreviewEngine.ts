import { PreviewConfig, GameConfig } from '@/types/agent';
import { FileSystemService } from './FileSystemService';

export class PreviewEngine {
  private static instance: PreviewEngine;
  private fileSystemService: FileSystemService;
  private currentPreview?: {
    projectPath: string;
    config: PreviewConfig;
    bundleUrl?: string;
  };

  private constructor() {
    this.fileSystemService = FileSystemService.getInstance();
  }

  public static getInstance(): PreviewEngine {
    if (!PreviewEngine.instance) {
      PreviewEngine.instance = new PreviewEngine();
    }
    return PreviewEngine.instance;
  }

  /**
   * Starts a preview for a project
   */
  async startPreview(projectPath: string, config: PreviewConfig): Promise<string> {
    try {
      this.currentPreview = { projectPath, config };

      if (config.mode === 'web') {
        return await this.startWebPreview(projectPath, config);
      } else {
        return await this.startGamePreview(projectPath, config);
      }
    } catch (error) {
      throw new Error(`Failed to start preview: ${error}`);
    }
  }

  /**
   * Stops the current preview
   */
  async stopPreview(): Promise<void> {
    if (this.currentPreview) {
      // Clean up preview resources
      this.currentPreview = undefined;
    }
  }

  /**
   * Updates the preview with new code
   */
  async updatePreview(filePath: string, content: string): Promise<void> {
    if (!this.currentPreview) {
      throw new Error('No active preview to update');
    }

    try {
      await this.fileSystemService.writeFile(
        this.currentPreview.projectPath,
        filePath,
        content
      );

      if (this.currentPreview.config.hotReload) {
        await this.triggerHotReload();
      }
    } catch (error) {
      throw new Error(`Failed to update preview: ${error}`);
    }
  }

  /**
   * Gets the current preview status
   */
  getPreviewStatus(): {
    isActive: boolean;
    mode?: 'web' | 'game';
    projectPath?: string;
    bundleUrl?: string;
  } {
    return {
      isActive: !!this.currentPreview,
      mode: this.currentPreview?.config.mode,
      projectPath: this.currentPreview?.projectPath,
      bundleUrl: this.currentPreview?.bundleUrl,
    };
  }

  /**
   * Starts web application preview
   */
  private async startWebPreview(projectPath: string, config: PreviewConfig): Promise<string> {
    try {
      // Validate entry point exists
      const entryContent = await this.fileSystemService.readFile(projectPath, config.entryPoint);
      
      // Create web bundle configuration
      const bundleConfig = await this.createWebBundleConfig(projectPath, config);
      
      // Generate bundle URL (in a real implementation, this would start a bundler)
      const bundleUrl = await this.generateWebBundle(projectPath, bundleConfig);
      
      if (this.currentPreview) {
        this.currentPreview.bundleUrl = bundleUrl;
      }
      
      return bundleUrl;
    } catch (error) {
      throw new Error(`Web preview failed: ${error}`);
    }
  }

  /**
   * Starts game preview with physics engine
   */
  private async startGamePreview(projectPath: string, config: PreviewConfig): Promise<string> {
    try {
      // Validate game entry point
      const gameContent = await this.fileSystemService.readFile(projectPath, config.entryPoint);
      
      // Setup game engine configuration
      const gameConfig = await this.createGameConfig(projectPath);
      
      // Initialize physics engine if needed
      if (gameConfig.physics) {
        await this.initializePhysicsEngine(gameConfig);
      }
      
      // Load game assets
      await this.loadGameAssets(projectPath, gameConfig);
      
      // Generate game bundle
      const bundleUrl = await this.generateGameBundle(projectPath, gameConfig);
      
      if (this.currentPreview) {
        this.currentPreview.bundleUrl = bundleUrl;
      }
      
      return bundleUrl;
    } catch (error) {
      throw new Error(`Game preview failed: ${error}`);
    }
  }

  /**
   * Creates web bundle configuration
   */
  private async createWebBundleConfig(projectPath: string, config: PreviewConfig): Promise<any> {
    const packageJsonContent = await this.fileSystemService.readFile(projectPath, 'package.json');
    const packageJson = JSON.parse(packageJsonContent);
    
    return {
      entry: config.entryPoint,
      dependencies: packageJson.dependencies || {},
      assets: config.assets || [],
      hotReload: config.hotReload,
      platform: 'web',
    };
  }

  /**
   * Creates game configuration
   */
  private async createGameConfig(projectPath: string): Promise<GameConfig> {
    try {
      // Try to read game config file
      const configContent = await this.fileSystemService.readFile(projectPath, 'game.config.json');
      return JSON.parse(configContent);
    } catch {
      // Return default game config
      return {
        physics: true,
        engine: 'matter-js',
        sprites: [],
        sounds: [],
      };
    }
  }

  /**
   * Initializes physics engine for games
   */
  private async initializePhysicsEngine(config: GameConfig): Promise<void> {
    if (config.engine === 'matter-js') {
      // Initialize Matter.js engine
      // This would be implemented with actual Matter.js setup
      console.log('Initializing Matter.js physics engine');
    }
  }

  /**
   * Loads game assets (sprites, sounds, etc.)
   */
  private async loadGameAssets(projectPath: string, config: GameConfig): Promise<void> {
    try {
      // Load sprites
      for (const sprite of config.sprites) {
        const spritePath = `assets/sprites/${sprite}`;
        const spriteExists = await this.fileExists(projectPath, spritePath);
        if (!spriteExists) {
          console.warn(`Sprite not found: ${spritePath}`);
        }
      }
      
      // Load sounds
      if (config.sounds) {
        for (const sound of config.sounds) {
          const soundPath = `assets/sounds/${sound}`;
          const soundExists = await this.fileExists(projectPath, soundPath);
          if (!soundExists) {
            console.warn(`Sound not found: ${soundPath}`);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to load some game assets: ${error}`);
    }
  }

  /**
   * Generates web application bundle
   */
  private async generateWebBundle(projectPath: string, config: any): Promise<string> {
    // In a real implementation, this would use Metro bundler or similar
    // For now, return a mock URL
    const bundleId = Math.random().toString(36).substring(7);
    return `http://localhost:8081/bundle/${bundleId}`;
  }

  /**
   * Generates game bundle with engine integration
   */
  private async generateGameBundle(projectPath: string, config: GameConfig): Promise<string> {
    // In a real implementation, this would bundle the game with the physics engine
    const bundleId = Math.random().toString(36).substring(7);
    return `http://localhost:8081/game/${bundleId}`;
  }

  /**
   * Triggers hot reload for active preview
   */
  private async triggerHotReload(): Promise<void> {
    if (!this.currentPreview?.config.hotReload) {
      return;
    }
    
    // In a real implementation, this would trigger the bundler to rebuild
    console.log('Triggering hot reload...');
  }

  /**
   * Checks if a file exists
   */
  private async fileExists(projectPath: string, filePath: string): Promise<boolean> {
    try {
      await this.fileSystemService.readFile(projectPath, filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets preview logs for debugging
   */
  async getPreviewLogs(): Promise<string[]> {
    // In a real implementation, this would return actual bundler/runtime logs
    return [
      'Preview started successfully',
      'Hot reload enabled',
      'Watching for file changes...',
    ];
  }

  /**
   * Validates project structure for preview
   */
  async validateProjectForPreview(projectPath: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Check for required files
      const requiredFiles = ['package.json', 'app.json'];
      for (const file of requiredFiles) {
        try {
          await this.fileSystemService.readFile(projectPath, file);
        } catch {
          errors.push(`Missing required file: ${file}`);
        }
      }
      
      // Check package.json structure
      try {
        const packageContent = await this.fileSystemService.readFile(projectPath, 'package.json');
        const packageJson = JSON.parse(packageContent);
        
        if (!packageJson.dependencies) {
          warnings.push('No dependencies found in package.json');
        }
        
        if (!packageJson.main) {
          warnings.push('No main entry point specified in package.json');
        }
      } catch (error) {
        errors.push('Invalid package.json format');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error}`],
        warnings: [],
      };
    }
  }
}