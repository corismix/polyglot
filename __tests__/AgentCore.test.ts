import { AgentCore } from '@/services/AgentCore';
import { GenerationRequest } from '@/types/agent';

// Mock FileSystemService
jest.mock('@/services/FileSystemService', () => ({
  FileSystemService: {
    getInstance: jest.fn(() => ({
      createProject: jest.fn().mockResolvedValue('/mock/project/path/'),
      writeFile: jest.fn().mockResolvedValue(undefined),
    })),
  },
}));

describe('AgentCore', () => {
  let agentCore: AgentCore;
  let mockProgressCallback: jest.Mock;

  beforeEach(() => {
    agentCore = AgentCore.getInstance();
    mockProgressCallback = jest.fn();
    agentCore.setProgressCallback(mockProgressCallback);
    agentCore.setApiKey('test-api-key');
    jest.clearAllMocks();
  });

  describe('generateProject', () => {
    it('should generate a project successfully', async () => {
      const request: GenerationRequest = {
        description: 'A simple todo app',
        projectType: 'app',
        framework: 'expo',
      };

      const projectPath = await agentCore.generateProject(request);

      expect(projectPath).toBe('/mock/project/path/');
      expect(mockProgressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: 'planning',
          message: 'Analyzing project requirements...',
        })
      );
      expect(mockProgressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: 'complete',
          message: 'Project generation complete!',
        })
      );
    });

    it('should handle errors during generation', async () => {
      agentCore.setApiKey(''); // Remove API key to trigger error

      const request: GenerationRequest = {
        description: 'A simple todo app',
        projectType: 'app',
        framework: 'expo',
      };

      await expect(agentCore.generateProject(request))
        .rejects.toThrow('API key not configured');

      expect(mockProgressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: 'error',
          error: 'API key not configured',
        })
      );
    });
  });

  describe('setApiKey', () => {
    it('should set the API key', () => {
      agentCore.setApiKey('new-api-key');
      // No direct way to test this, but it should not throw
    });
  });

  describe('setProgressCallback', () => {
    it('should set the progress callback', () => {
      const newCallback = jest.fn();
      agentCore.setProgressCallback(newCallback);
      // No direct way to test this, but it should not throw
    });
  });
});