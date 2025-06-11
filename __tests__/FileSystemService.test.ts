import { FileSystemService } from '@/services/FileSystemService';

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
  moveAsync: jest.fn(),
  copyAsync: jest.fn(),
  EncodingType: {
    UTF8: 'utf8',
  },
}));

describe('FileSystemService', () => {
  let fileSystemService: FileSystemService;

  beforeEach(() => {
    fileSystemService = FileSystemService.getInstance();
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create a project directory with initial structure', async () => {
      const mockGetInfoAsync = require('expo-file-system').getInfoAsync;
      const mockMakeDirectoryAsync = require('expo-file-system').makeDirectoryAsync;

      mockGetInfoAsync.mockResolvedValue({ exists: false });

      const projectPath = await fileSystemService.createProject('test-project');

      expect(projectPath).toBe('/mock/documents/projects/test-project/');
      expect(mockMakeDirectoryAsync).toHaveBeenCalledWith(
        '/mock/documents/projects/',
        { intermediates: true }
      );
    });

    it('should handle errors during project creation', async () => {
      const mockMakeDirectoryAsync = require('expo-file-system').makeDirectoryAsync;
      mockMakeDirectoryAsync.mockRejectedValue(new Error('Permission denied'));

      await expect(fileSystemService.createProject('test-project'))
        .rejects.toThrow('Failed to create project: Error: Permission denied');
    });
  });

  describe('writeFile', () => {
    it('should write file content atomically', async () => {
      const mockWriteAsStringAsync = require('expo-file-system').writeAsStringAsync;
      const mockMoveAsync = require('expo-file-system').moveAsync;
      const mockGetInfoAsync = require('expo-file-system').getInfoAsync;

      mockGetInfoAsync.mockResolvedValue({ exists: false });

      await fileSystemService.writeFile('/project/', 'test.txt', 'content');

      expect(mockWriteAsStringAsync).toHaveBeenCalledWith(
        '/project/test.txt.tmp',
        'content',
        { encoding: 'utf8' }
      );
      expect(mockMoveAsync).toHaveBeenCalledWith({
        from: '/project/test.txt.tmp',
        to: '/project/test.txt',
      });
    });
  });

  describe('readFile', () => {
    it('should read file content successfully', async () => {
      const mockReadAsStringAsync = require('expo-file-system').readAsStringAsync;
      const mockGetInfoAsync = require('expo-file-system').getInfoAsync;

      mockGetInfoAsync.mockResolvedValue({ exists: true });
      mockReadAsStringAsync.mockResolvedValue('file content');

      const content = await fileSystemService.readFile('/project/', 'test.txt');

      expect(content).toBe('file content');
      expect(mockReadAsStringAsync).toHaveBeenCalledWith(
        '/project/test.txt',
        { encoding: 'utf8' }
      );
    });

    it('should throw error if file does not exist', async () => {
      const mockGetInfoAsync = require('expo-file-system').getInfoAsync;
      mockGetInfoAsync.mockResolvedValue({ exists: false });

      await expect(fileSystemService.readFile('/project/', 'nonexistent.txt'))
        .rejects.toThrow('Failed to read file nonexistent.txt: Error: File does not exist: nonexistent.txt');
    });
  });

  describe('listFiles', () => {
    it('should list all files recursively', async () => {
      const mockReadDirectoryAsync = require('expo-file-system').readDirectoryAsync;
      const mockGetInfoAsync = require('expo-file-system').getInfoAsync;

      mockReadDirectoryAsync.mockResolvedValue(['file1.txt', 'folder1']);
      mockGetInfoAsync
        .mockResolvedValueOnce({ isDirectory: false, size: 100, modificationTime: 123456 })
        .mockResolvedValueOnce({ isDirectory: true, size: 0, modificationTime: 123457 });

      const files = await fileSystemService.listFiles('/project/');

      expect(files).toHaveLength(2);
      expect(files[0]).toEqual({
        name: 'file1.txt',
        path: 'file1.txt',
        type: 'file',
        size: 100,
        modificationTime: 123456,
      });
      expect(files[1]).toEqual({
        name: 'folder1',
        path: 'folder1',
        type: 'directory',
        size: 0,
        modificationTime: 123457,
      });
    });
  });
});