import { renderHook, act } from '@testing-library/react-native';
import { useAgent } from '@/hooks/useAgent';

// Mock the services
jest.mock('@/services/AgentCore', () => ({
  AgentCore: {
    getInstance: jest.fn(() => ({
      setApiKey: jest.fn(),
      setProgressCallback: jest.fn(),
      generateProject: jest.fn().mockResolvedValue('/mock/project/'),
    })),
  },
}));

jest.mock('@/services/PreviewEngine', () => ({
  PreviewEngine: {
    getInstance: jest.fn(() => ({
      startPreview: jest.fn().mockResolvedValue('http://localhost:8081/preview'),
      stopPreview: jest.fn().mockResolvedValue(undefined),
      getPreviewStatus: jest.fn().mockReturnValue({ isActive: false }),
      updatePreview: jest.fn().mockResolvedValue(undefined),
      validateProjectForPreview: jest.fn().mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      }),
    })),
  },
}));

jest.mock('@/services/FileSystemService', () => ({
  FileSystemService: {
    getInstance: jest.fn(() => ({
      writeFile: jest.fn().mockResolvedValue(undefined),
      readFile: jest.fn().mockResolvedValue('file content'),
      listFiles: jest.fn().mockResolvedValue([]),
      getProjectInfo: jest.fn().mockResolvedValue({ path: '/mock/project/' }),
      listProjects: jest.fn().mockResolvedValue(['project1', 'project2']),
      deleteProject: jest.fn().mockResolvedValue(undefined),
    })),
  },
}));

describe('useAgent', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAgent());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.progress).toBe(null);
    expect(result.current.currentProject).toBe(null);
    expect(result.current.previewUrl).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should initialize agent with API key', async () => {
    const { result } = renderHook(() => useAgent());

    await act(async () => {
      result.current.initializeAgent('test-api-key');
    });

    expect(result.current.error).toBe(null);
  });

  it('should generate project successfully', async () => {
    const { result } = renderHook(() => useAgent());

    await act(async () => {
      result.current.initializeAgent('test-api-key');
    });

    await act(async () => {
      const projectPath = await result.current.generateProject({
        description: 'Test project',
        projectType: 'app',
        framework: 'expo',
      });
      expect(projectPath).toBe('/mock/project/');
    });

    expect(result.current.currentProject).toBe('/mock/project/');
  });

  it('should start preview successfully', async () => {
    const { result } = renderHook(() => useAgent());

    await act(async () => {
      result.current.initializeAgent('test-api-key');
    });

    // Set current project first
    await act(async () => {
      await result.current.generateProject({
        description: 'Test project',
        projectType: 'app',
        framework: 'expo',
      });
    });

    await act(async () => {
      const previewUrl = await result.current.startPreview({
        mode: 'web',
        entryPoint: 'app/_layout.tsx',
        hotReload: true,
      });
      expect(previewUrl).toBe('http://localhost:8081/preview');
    });

    expect(result.current.previewUrl).toBe('http://localhost:8081/preview');
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useAgent());

    await act(async () => {
      try {
        await result.current.generateProject({
          description: 'Test project',
          projectType: 'app',
          framework: 'expo',
        });
      } catch (error) {
        // Expected to fail without API key
      }
    });

    // Should handle the error state
    expect(result.current.isGenerating).toBe(false);
  });
});