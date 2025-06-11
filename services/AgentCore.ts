import { ProjectStructure, FileStructure, AgentProgress, GenerationRequest, AIResponse } from '@/types/agent';
import { FileSystemService } from './FileSystemService';

export class AgentCore {
  private static instance: AgentCore;
  private fileSystemService: FileSystemService;
  private progressCallback?: (progress: AgentProgress) => void;
  private apiKey?: string;

  private constructor() {
    this.fileSystemService = FileSystemService.getInstance();
  }

  public static getInstance(): AgentCore {
    if (!AgentCore.instance) {
      AgentCore.instance = new AgentCore();
    }
    return AgentCore.instance;
  }

  /**
   * Sets the API key for AI services
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Sets the progress callback function
   */
  setProgressCallback(callback: (progress: AgentProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Generates a complete project from a description
   */
  async generateProject(request: GenerationRequest): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    try {
      // Phase 1: Planning
      this.updateProgress({
        phase: 'planning',
        completedFiles: [],
        totalFiles: 0,
        message: 'Analyzing project requirements...',
      });

      const projectStructure = await this.planProject(request);
      const projectPath = await this.fileSystemService.createProject(projectStructure.name);

      // Phase 2: Execution
      this.updateProgress({
        phase: 'execution',
        completedFiles: [],
        totalFiles: projectStructure.files.length,
        message: 'Generating project files...',
      });

      await this.executeGeneration(projectPath, projectStructure);

      // Phase 3: Integration
      this.updateProgress({
        phase: 'integration',
        completedFiles: projectStructure.files.map(f => f.path),
        totalFiles: projectStructure.files.length,
        message: 'Integrating components and finalizing...',
      });

      await this.integrateProject(projectPath, projectStructure);

      this.updateProgress({
        phase: 'complete',
        completedFiles: projectStructure.files.map(f => f.path),
        totalFiles: projectStructure.files.length,
        message: 'Project generation complete!',
      });

      return projectPath;
    } catch (error) {
      this.updateProgress({
        phase: 'error',
        completedFiles: [],
        totalFiles: 0,
        message: 'Project generation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Plans the project structure based on the request
   */
  private async planProject(request: GenerationRequest): Promise<ProjectStructure> {
    const planningPrompt = this.createPlanningPrompt(request);
    const response = await this.callAI(planningPrompt);

    if (!response.success || !response.data) {
      throw new Error('Failed to plan project structure');
    }

    return this.parseProjectStructure(response.data, request);
  }

  /**
   * Executes the code generation for each file
   */
  private async executeGeneration(projectPath: string, structure: ProjectStructure): Promise<void> {
    const sortedFiles = this.sortFilesByDependencies(structure.files);
    const completedFiles: string[] = [];

    for (const file of sortedFiles) {
      if (file.type === 'file') {
        try {
          this.updateProgress({
            phase: 'execution',
            currentFile: file.path,
            completedFiles: [...completedFiles],
            totalFiles: structure.files.length,
            message: `Generating ${file.path}...`,
          });

          const content = await this.generateFileContent(file, structure, completedFiles);
          await this.fileSystemService.writeFile(projectPath, file.path, content);
          completedFiles.push(file.path);

          // Small delay to prevent API rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          // Retry logic
          await this.retryFileGeneration(projectPath, file, structure, completedFiles);
          completedFiles.push(file.path);
        }
      }
    }
  }

  /**
   * Integrates the project by creating configuration files
   */
  private async integrateProject(projectPath: string, structure: ProjectStructure): Promise<void> {
    // Generate package.json
    const packageJson = {
      name: structure.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      main: 'expo-router/entry',
      scripts: structure.scripts,
      dependencies: this.createDependencyObject(structure.dependencies),
      devDependencies: this.createDependencyObject(structure.devDependencies),
    };

    await this.fileSystemService.writeFile(
      projectPath,
      'package.json',
      JSON.stringify(packageJson, null, 2)
    );

    // Generate app.json for Expo
    if (structure.framework === 'expo') {
      const appJson = {
        expo: {
          name: structure.name,
          slug: structure.name.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          orientation: 'portrait',
          userInterfaceStyle: 'automatic',
          newArchEnabled: true,
          ios: { supportsTablet: true },
          web: { bundler: 'metro', output: 'single' },
          plugins: ['expo-router', 'expo-font'],
          experiments: { typedRoutes: true },
        },
      };

      await this.fileSystemService.writeFile(
        projectPath,
        'app.json',
        JSON.stringify(appJson, null, 2)
      );
    }

    // Generate README.md
    const readme = this.generateReadme(structure);
    await this.fileSystemService.writeFile(projectPath, 'README.md', readme);
  }

  /**
   * Generates content for a specific file
   */
  private async generateFileContent(
    file: FileStructure,
    structure: ProjectStructure,
    completedFiles: string[]
  ): Promise<string> {
    const prompt = this.createFileGenerationPrompt(file, structure, completedFiles);
    const response = await this.callAI(prompt);

    if (!response.success || !response.data) {
      throw new Error(`Failed to generate content for ${file.path}`);
    }

    return this.extractCodeFromResponse(response.data);
  }

  /**
   * Creates a planning prompt for the AI
   */
  private createPlanningPrompt(request: GenerationRequest): string {
    return `
PLANNING_REQUEST: Create a detailed project structure for a ${request.projectType} using ${request.framework}.

Description: ${request.description}
Features: ${request.features?.join(', ') || 'Standard features'}
Styling: ${request.styling || 'stylesheet'}

Please provide a JSON response with the following structure:
{
  "name": "Project Name",
  "description": "Brief description",
  "framework": "${request.framework}",
  "files": [
    {
      "path": "relative/path/to/file.tsx",
      "type": "file",
      "dependencies": ["list", "of", "dependencies"]
    }
  ],
  "dependencies": ["react-native", "expo-router", ...],
  "devDependencies": ["@types/react", ...],
  "scripts": {
    "dev": "expo start",
    "build": "expo build"
  }
}

Focus on creating a production-ready structure with proper separation of concerns.
`;
  }

  /**
   * Creates a file generation prompt
   */
  private createFileGenerationPrompt(
    file: FileStructure,
    structure: ProjectStructure,
    completedFiles: string[]
  ): string {
    return `
FILE_GENERATION: Generate the complete content for: ${file.path}

Project Context:
- Name: ${structure.name}
- Framework: ${structure.framework}
- Description: ${structure.description}

File Dependencies: ${file.dependencies?.join(', ') || 'None'}
Completed Files: ${completedFiles.join(', ')}

Requirements:
1. Write production-ready, type-safe code
2. Follow React Native/Expo best practices
3. Include proper error handling
4. Use modern React patterns (hooks, functional components)
5. Ensure compatibility with the project structure
6. Include necessary imports and exports

Return only the file content, no explanations or markdown formatting.
`;
  }

  /**
   * Calls the AI API with retry logic
   */
  private async callAI(prompt: string, retries = 3): Promise<AIResponse> {
    for (let i = 0; i < retries; i++) {
      try {
        // This would be replaced with actual AI API calls
        // For now, returning a mock response
        const response = await this.mockAICall(prompt);
        return { success: true, data: response };
      } catch (error) {
        if (i === retries - 1) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'AI API call failed',
          };
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return { success: false, error: 'Max retries exceeded' };
  }

  /**
   * Mock AI call for development
   */
  private async mockAICall(prompt: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (prompt.startsWith('\nPLANNING_REQUEST:')) {
      return {
        name: 'AI Generated App',
        description: 'A React Native app generated by AI',
        framework: 'expo',
        files: [
          { path: 'app/_layout.tsx', type: 'file', dependencies: [] },
          { path: 'app/(tabs)/_layout.tsx', type: 'file', dependencies: [] },
          { path: 'app/(tabs)/index.tsx', type: 'file', dependencies: [] },
          { path: 'components/Button.tsx', type: 'file', dependencies: [] },
        ],
        dependencies: ['expo', 'react', 'react-native', 'expo-router'],
        devDependencies: ['@types/react', 'typescript'],
        scripts: {
          dev: 'expo start',
          build: 'expo build',
        },
      };
    }
    
    // For file generation requests, return string content
    const fileName = prompt.includes('Generate the complete content for:') 
      ? prompt.split('Generate the complete content for:')[1]?.split('\n')[0]?.trim() 
      : 'unknown file';
    
    return `// Generated file content for ${fileName}
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Component() {
  return (
    <View style={styles.container}>
      <Text>Generated Component</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
`;
  }

  /**
   * Utility methods
   */
  private updateProgress(progress: Partial<AgentProgress>): void {
    if (this.progressCallback) {
      this.progressCallback(progress as AgentProgress);
    }
  }

  private parseProjectStructure(data: any, request: GenerationRequest): ProjectStructure {
    return {
      name: data.name || 'Generated Project',
      description: data.description || request.description,
      framework: data.framework || request.framework,
      files: data.files || [],
      dependencies: data.dependencies || [],
      devDependencies: data.devDependencies || [],
      scripts: data.scripts || {},
    };
  }

  private sortFilesByDependencies(files: FileStructure[]): FileStructure[] {
    // Simple topological sort based on dependencies
    const sorted: FileStructure[] = [];
    const visited = new Set<string>();
    
    const visit = (file: FileStructure) => {
      if (visited.has(file.path)) return;
      visited.add(file.path);
      
      // Visit dependencies first
      if (file.dependencies) {
        for (const dep of file.dependencies) {
          const depFile = files.find(f => f.path.includes(dep));
          if (depFile && !visited.has(depFile.path)) {
            visit(depFile);
          }
        }
      }
      
      sorted.push(file);
    };
    
    files.forEach(visit);
    return sorted;
  }

  private async retryFileGeneration(
    projectPath: string,
    file: FileStructure,
    structure: ProjectStructure,
    completedFiles: string[]
  ): Promise<void> {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const content = await this.generateFileContent(file, structure, completedFiles);
        await this.fileSystemService.writeFile(projectPath, file.path, content);
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  private createDependencyObject(deps: string[]): Record<string, string> {
    const versions: Record<string, string> = {
      'expo': '^53.0.0',
      'react': '19.0.0',
      'react-native': '0.79.1',
      'expo-router': '~5.0.2',
      '@types/react': '~19.0.10',
      'typescript': '~5.8.3',
    };
    
    return deps.reduce((acc, dep) => {
      acc[dep] = versions[dep] || '^1.0.0';
      return acc;
    }, {} as Record<string, string>);
  }

  private extractCodeFromResponse(response: string): string {
    // Remove markdown code blocks if present
    return response.replace(/```[\s\S]*?\n/, '').replace(/\n```$/, '').trim();
  }

  private generateReadme(structure: ProjectStructure): string {
    return `# ${structure.name}

${structure.description}

## Framework
${structure.framework}

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Project Structure

${structure.files.map(f => `- ${f.path}`).join('\n')}

## Generated by AI Agent
This project was automatically generated using an AI development agent.
`;
  }
}