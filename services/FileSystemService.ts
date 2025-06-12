import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { FileSystemEntry, ProjectStructure } from '@/types/agent';

interface WebFileSystem {
  [path: string]: {
    content?: string;
    type: 'file' | 'directory';
    modificationTime: number;
    size: number;
  };
}

export class FileSystemService {
  private static instance: FileSystemService;
  private readonly baseDirectory: string;
  private webFileSystem: WebFileSystem = {};
  private saveTimeout?: ReturnType<typeof setTimeout>;

  private constructor() {
    if (Platform.OS === 'web') {
      this.baseDirectory = 'web-storage/';
      this.loadWebFileSystem();
    } else {
      this.baseDirectory = `${FileSystem.documentDirectory}projects/`;
    }
  }

  public static getInstance(): FileSystemService {
    if (!FileSystemService.instance) {
      FileSystemService.instance = new FileSystemService();
    }
    return FileSystemService.instance;
  }

  private loadWebFileSystem(): void {
    try {
      const stored = localStorage.getItem('webFileSystem');
      if (stored) {
        this.webFileSystem = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load web file system from localStorage:', error);
      this.webFileSystem = {};
    }
  }

  private saveWebFileSystem(): void {
    try {
      localStorage.setItem('webFileSystem', JSON.stringify(this.webFileSystem));
    } catch (error) {
      console.warn('Failed to save web file system to localStorage:', error);
    }
  }

  private scheduleSaveWebFileSystem(): void {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveWebFileSystem(), 1000);
  }

  private normalizeWebPath(path: string): string {
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  /**
   * Creates a new project directory with initial structure
   */
  async createProject(projectName: string): Promise<string> {
    if (Platform.OS === 'web') {
      const projectPath = `${this.baseDirectory}${projectName}/`;
      const normalizedPath = this.normalizeWebPath(projectPath);
      
      // Create project directory
      this.webFileSystem[normalizedPath] = {
        type: 'directory',
        modificationTime: Date.now(),
        size: 0,
      };
      
      // Create initial structure
      const initialDirs = ['src/', 'assets/', 'components/', 'screens/', 'services/'];
      for (const dir of initialDirs) {
        const dirPath = this.normalizeWebPath(`${projectPath}${dir}`);
        this.webFileSystem[dirPath] = {
          type: 'directory',
          modificationTime: Date.now(),
          size: 0,
        };
      }

      this.scheduleSaveWebFileSystem();
      return projectPath;
    }

    try {
      const projectPath = `${this.baseDirectory}${projectName}/`;
      
      // Ensure base directory exists
      await this.ensureDirectoryExists(this.baseDirectory);
      
      // Create project directory
      await this.ensureDirectoryExists(projectPath);
      
      // Create initial structure
      const initialDirs = ['src/', 'assets/', 'components/', 'screens/', 'services/'];
      for (const dir of initialDirs) {
        await this.ensureDirectoryExists(`${projectPath}${dir}`);
      }

      return projectPath;
    } catch (error) {
      throw new Error(`Failed to create project: ${error}`);
    }
  }

  /**
   * Writes content to a file with atomic operations
   */
  async writeFile(projectPath: string, filePath: string, content: string): Promise<void> {
    if (Platform.OS === 'web') {
      const fullPath = this.normalizeWebPath(`${projectPath}${filePath}`);
      const directory = fullPath.substring(0, fullPath.lastIndexOf('/'));
      
      // Ensure directory exists
      if (directory && !this.webFileSystem[directory]) {
        this.webFileSystem[directory] = {
          type: 'directory',
          modificationTime: Date.now(),
          size: 0,
        };
      }
      
      // Write file
      this.webFileSystem[fullPath] = {
        content,
        type: 'file',
        modificationTime: Date.now(),
        size: content.length,
      };
      
      this.scheduleSaveWebFileSystem();
      return;
    }

    try {
      const fullPath = `${projectPath}${filePath}`;
      const directory = fullPath.substring(0, fullPath.lastIndexOf('/'));
      
      // Ensure directory exists
      await this.ensureDirectoryExists(directory);
      
      // Write to temporary file first
      const tempPath = `${fullPath}.tmp`;
      await FileSystem.writeAsStringAsync(tempPath, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Atomic move
      await FileSystem.moveAsync({
        from: tempPath,
        to: fullPath,
      });
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error}`);
    }
  }

  /**
   * Reads file content with error handling
   */
  async readFile(projectPath: string, filePath: string): Promise<string> {
    if (Platform.OS === 'web') {
      const fullPath = this.normalizeWebPath(`${projectPath}${filePath}`);
      const file = this.webFileSystem[fullPath];
      
      if (!file || file.type !== 'file') {
        throw new Error(`File does not exist: ${filePath}`);
      }
      
      return file.content || '';
    }

    try {
      const fullPath = `${projectPath}${filePath}`;
      const fileInfo = await FileSystem.getInfoAsync(fullPath);
      
      if (!fileInfo.exists) {
        throw new Error(`File does not exist: ${filePath}`);
      }
      
      return await FileSystem.readAsStringAsync(fullPath, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  /**
   * Lists all files and directories in a project
   */
  async listFiles(projectPath: string): Promise<FileSystemEntry[]> {
    if (Platform.OS === 'web') {
      const entries: FileSystemEntry[] = [];
      const normalizedProjectPath = this.normalizeWebPath(projectPath);
      
      for (const [path, entry] of Object.entries(this.webFileSystem)) {
        if (path.startsWith(normalizedProjectPath) && path !== normalizedProjectPath) {
          const relativePath = path.substring(normalizedProjectPath.length + 1);
          const name = relativePath.split('/')[0];
          
          // Avoid duplicates for nested paths
          if (!entries.find(e => e.name === name)) {
            entries.push({
              name,
              path: relativePath,
              type: entry.type,
              size: entry.size,
              modificationTime: entry.modificationTime,
            });
          }
        }
      }
      
      return entries;
    }

    try {
      const entries: FileSystemEntry[] = [];
      await this.listFilesRecursive(projectPath, '', entries);
      return entries;
    } catch (error) {
      throw new Error(`Failed to list files: ${error}`);
    }
  }

  /**
   * Deletes a project and all its contents
   */
  async deleteProject(projectName: string): Promise<void> {
    if (Platform.OS === 'web') {
      const projectPath = this.normalizeWebPath(`${this.baseDirectory}${projectName}/`);
      
      // Remove all files and directories that start with the project path
      const keysToDelete = Object.keys(this.webFileSystem).filter(key => 
        key.startsWith(projectPath)
      );
      
      keysToDelete.forEach(key => {
        delete this.webFileSystem[key];
      });
      
      this.scheduleSaveWebFileSystem();
      return;
    }

    try {
      const projectPath = `${this.baseDirectory}${projectName}/`;
      const info = await FileSystem.getInfoAsync(projectPath);
      
      if (info.exists) {
        await FileSystem.deleteAsync(projectPath, { idempotent: true });
      }
    } catch (error) {
      throw new Error(`Failed to delete project: ${error}`);
    }
  }

  /**
   * Copies a file from one location to another
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    if (Platform.OS === 'web') {
      const normalizedSource = this.normalizeWebPath(sourcePath);
      const normalizedDest = this.normalizeWebPath(destinationPath);
      
      const sourceFile = this.webFileSystem[normalizedSource];
      if (!sourceFile || sourceFile.type !== 'file') {
        throw new Error(`Source file does not exist: ${sourcePath}`);
      }
      
      // Ensure destination directory exists
      const destDir = normalizedDest.substring(0, normalizedDest.lastIndexOf('/'));
      if (destDir && !this.webFileSystem[destDir]) {
        this.webFileSystem[destDir] = {
          type: 'directory',
          modificationTime: Date.now(),
          size: 0,
        };
      }
      
      // Copy file
      this.webFileSystem[normalizedDest] = {
        content: sourceFile.content,
        type: 'file',
        modificationTime: Date.now(),
        size: sourceFile.size,
      };
      
      this.scheduleSaveWebFileSystem();
      return;
    }

    try {
      const destDir = destinationPath.substring(0, destinationPath.lastIndexOf('/'));
      await this.ensureDirectoryExists(destDir);
      
      await FileSystem.copyAsync({
        from: sourcePath,
        to: destinationPath,
      });
    } catch (error) {
      throw new Error(`Failed to copy file: ${error}`);
    }
  }

  /**
   * Gets project information
   */
  async getProjectInfo(projectName: string): Promise<FileSystemEntry | null> {
    if (Platform.OS === 'web') {
      const projectPath = this.normalizeWebPath(`${this.baseDirectory}${projectName}/`);
      const project = this.webFileSystem[projectPath];
      
      if (!project || project.type !== 'directory') {
        return null;
      }
      
      return {
        name: projectName,
        path: projectPath,
        type: 'directory',
        size: project.size,
        modificationTime: project.modificationTime,
      };
    }

    try {
      const projectPath = `${this.baseDirectory}${projectName}/`;
      const info = await FileSystem.getInfoAsync(projectPath);
      
      if (!info.exists) {
        return null;
      }
      
      return {
        name: projectName,
        path: projectPath,
        type: 'directory',
        size: info.size,
        modificationTime: info.modificationTime,
      };
    } catch (error) {
      throw new Error(`Failed to get project info: ${error}`);
    }
  }

  /**
   * Lists all projects
   */
  async listProjects(): Promise<string[]> {
    if (Platform.OS === 'web') {
      const projects: string[] = [];
      const normalizedBase = this.normalizeWebPath(this.baseDirectory);
      
      for (const [path, entry] of Object.entries(this.webFileSystem)) {
        if (entry.type === 'directory' && path.startsWith(normalizedBase) && path !== normalizedBase) {
          const relativePath = path.substring(normalizedBase.length + 1);
          const projectName = relativePath.split('/')[0];
          
          if (projectName && !projects.includes(projectName)) {
            projects.push(projectName);
          }
        }
      }
      
      return projects;
    }

    try {
      await this.ensureDirectoryExists(this.baseDirectory);
      const entries = await FileSystem.readDirectoryAsync(this.baseDirectory);
      
      const projects: string[] = [];
      for (const entry of entries) {
        const entryPath = `${this.baseDirectory}${entry}`;
        const info = await FileSystem.getInfoAsync(entryPath);
        if (info.isDirectory) {
          projects.push(entry);
        }
      }
      
      return projects;
    } catch (error) {
      throw new Error(`Failed to list projects: ${error}`);
    }
  }

  /**
   * Ensures a directory exists, creating it if necessary
   */
  private async ensureDirectoryExists(path: string): Promise<void> {
    if (Platform.OS === 'web') {
      const normalizedPath = this.normalizeWebPath(path);
      if (!this.webFileSystem[normalizedPath]) {
        this.webFileSystem[normalizedPath] = {
          type: 'directory',
          modificationTime: Date.now(),
          size: 0,
        };
        this.scheduleSaveWebFileSystem();
      }
      return;
    }

    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
    }
  }

  /**
   * Recursively lists files in a directory
   */
  private async listFilesRecursive(
    basePath: string,
    relativePath: string,
    entries: FileSystemEntry[]
  ): Promise<void> {
    if (Platform.OS === 'web') {
      // For web, we'll implement this differently since we have a flat structure
      const currentPath = this.normalizeWebPath(`${basePath}${relativePath}`);
      
      for (const [path, entry] of Object.entries(this.webFileSystem)) {
        if (path.startsWith(currentPath) && path !== currentPath) {
          const itemRelativePath = path.substring(basePath.length);
          const pathParts = itemRelativePath.split('/').filter(Boolean);
          const name = pathParts[pathParts.length - 1];
          
          if (pathParts.length === relativePath.split('/').filter(Boolean).length + 1) {
            entries.push({
              name,
              path: itemRelativePath,
              type: entry.type,
              size: entry.size,
              modificationTime: entry.modificationTime,
            });
          }
        }
      }
      return;
    }

    const currentPath = `${basePath}${relativePath}`;
    const items = await FileSystem.readDirectoryAsync(currentPath);
    
    for (const item of items) {
      const itemPath = `${currentPath}${item}`;
      const itemRelativePath = `${relativePath}${item}`;
      const info = await FileSystem.getInfoAsync(itemPath);
      
      entries.push({
        name: item,
        path: itemRelativePath,
        type: info.isDirectory ? 'directory' : 'file',
        size: info.size,
        modificationTime: info.modificationTime,
      });
      
      if (info.isDirectory) {
        await this.listFilesRecursive(basePath, `${itemRelativePath}/`, entries);
      }
    }
  }
}