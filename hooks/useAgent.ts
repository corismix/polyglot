import { useState, useCallback, useRef } from 'react';
import { AgentCore } from '@/services/AgentCore';
import { PreviewEngine } from '@/services/PreviewEngine';
import { FileSystemService } from '@/services/FileSystemService';
import { AgentProgress, GenerationRequest, PreviewConfig } from '@/types/agent';

export function useAgent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<AgentProgress | null>(null);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const agentCore = useRef(AgentCore.getInstance());
  const previewEngine = useRef(PreviewEngine.getInstance());
  const fileSystemService = useRef(FileSystemService.getInstance());

  // Set up progress callback
  const handleProgress = useCallback((progress: AgentProgress) => {
    setProgress(progress);
    if (progress.phase === 'error') {
      setError(progress.error || 'Unknown error occurred');
      setIsGenerating(false);
    } else if (progress.phase === 'complete') {
      setIsGenerating(false);
    }
  }, []);

  // Initialize agent with progress callback
  const initializeAgent = useCallback((apiKey: string) => {
    agentCore.current.setApiKey(apiKey);
    agentCore.current.setProgressCallback(handleProgress);
    setError(null);
  }, [handleProgress]);

  // Generate a new project
  const generateProject = useCallback(async (request: GenerationRequest) => {
    try {
      setIsGenerating(true);
      setError(null);
      setProgress(null);

      const projectPath = await agentCore.current.generateProject(request);
      setCurrentProject(projectPath);
      
      return projectPath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Project generation failed';
      setError(errorMessage);
      setIsGenerating(false);
      throw new Error(errorMessage);
    }
  }, []);

  // Start preview for current project
  const startPreview = useCallback(async (config: PreviewConfig) => {
    if (!currentProject) {
      throw new Error('No project loaded');
    }

    try {
      const url = await previewEngine.current.startPreview(currentProject, config);
      setPreviewUrl(url);
      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Preview failed to start';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [currentProject]);

  // Stop current preview
  const stopPreview = useCallback(async () => {
    try {
      await previewEngine.current.stopPreview();
      setPreviewUrl(null);
    } catch (error) {
      console.warn('Failed to stop preview:', error);
    }
  }, []);

  // Update file in current project
  const updateFile = useCallback(async (filePath: string, content: string) => {
    if (!currentProject) {
      throw new Error('No project loaded');
    }

    try {
      await fileSystemService.current.writeFile(currentProject, filePath, content);
      
      // Update preview if active
      const previewStatus = previewEngine.current.getPreviewStatus();
      if (previewStatus.isActive) {
        await previewEngine.current.updatePreview(filePath, content);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update file';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [currentProject]);

  // Read file from current project
  const readFile = useCallback(async (filePath: string): Promise<string> => {
    if (!currentProject) {
      throw new Error('No project loaded');
    }

    try {
      return await fileSystemService.current.readFile(currentProject, filePath);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to read file';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [currentProject]);

  // List files in current project
  const listFiles = useCallback(async () => {
    if (!currentProject) {
      throw new Error('No project loaded');
    }

    try {
      return await fileSystemService.current.listFiles(currentProject);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to list files';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [currentProject]);

  // Load existing project
  const loadProject = useCallback(async (projectName: string) => {
    try {
      const projectInfo = await fileSystemService.current.getProjectInfo(projectName);
      if (!projectInfo) {
        throw new Error('Project not found');
      }
      
      setCurrentProject(projectInfo.path);
      setError(null);
      return projectInfo.path;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // List all projects
  const listProjects = useCallback(async () => {
    try {
      return await fileSystemService.current.listProjects();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to list projects';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete project
  const deleteProject = useCallback(async (projectName: string) => {
    try {
      await fileSystemService.current.deleteProject(projectName);
      
      // If this was the current project, clear it
      if (currentProject?.includes(projectName)) {
        setCurrentProject(null);
        await stopPreview();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [currentProject, stopPreview]);

  // Get preview status
  const getPreviewStatus = useCallback(() => {
    return previewEngine.current.getPreviewStatus();
  }, []);

  // Validate project for preview
  const validateProject = useCallback(async () => {
    if (!currentProject) {
      throw new Error('No project loaded');
    }

    try {
      return await previewEngine.current.validateProjectForPreview(currentProject);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [currentProject]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isGenerating,
    progress,
    currentProject,
    previewUrl,
    error,

    // Actions
    initializeAgent,
    generateProject,
    startPreview,
    stopPreview,
    updateFile,
    readFile,
    listFiles,
    loadProject,
    listProjects,
    deleteProject,
    getPreviewStatus,
    validateProject,
    clearError,
  };
}