export interface ProjectStructure {
  name: string;
  description: string;
  framework: 'react-native' | 'expo' | 'game';
  files: FileStructure[];
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
}

export interface FileStructure {
  path: string;
  type: 'file' | 'directory';
  content?: string;
  dependencies?: string[];
  children?: FileStructure[];
}

export interface FileSystemEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modificationTime?: number;
}

export interface AgentProgress {
  phase: 'planning' | 'execution' | 'integration' | 'complete' | 'error';
  currentFile?: string;
  completedFiles: string[];
  totalFiles: number;
  message: string;
  error?: string;
}

export interface GenerationRequest {
  description: string;
  projectType: 'app' | 'game' | 'component';
  framework: 'react-native' | 'expo' | 'game';
  features?: string[];
  styling?: 'styled-components' | 'stylesheet' | 'nativewind';
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    tokens: number;
    cost: number;
  };
}

export interface PreviewConfig {
  mode: 'web' | 'game';
  entryPoint: string;
  assets?: string[];
  hotReload: boolean;
}

export interface GameConfig {
  physics: boolean;
  engine: 'matter-js' | 'custom';
  sprites: string[];
  sounds?: string[];
}