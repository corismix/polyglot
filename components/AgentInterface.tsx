import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bot,
  Play,
  Square,
  FileText,
  Settings,
  Trash2,
  Eye,
  Code,
  Smartphone,
  Monitor,
  Zap,
} from 'lucide-react-native';
import { useAgent } from '@/hooks/useAgent';
import { GenerationRequest, PreviewConfig } from '@/types/agent';

export default function AgentInterface() {
  const {
    isGenerating,
    progress,
    currentProject,
    previewUrl,
    error,
    initializeAgent,
    generateProject,
    startPreview,
    stopPreview,
    listProjects,
    loadProject,
    deleteProject,
    getPreviewStatus,
    clearError,
  } = useAgent();

  const [apiKey, setApiKey] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectType, setProjectType] = useState<'app' | 'game' | 'component'>('app');
  const [framework, setFramework] = useState<'react-native' | 'expo' | 'game'>('expo');
  const [projects, setProjects] = useState<string[]>([]);
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);

  useEffect(() => {
    loadProjectsList();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  const loadProjectsList = async () => {
    try {
      const projectList = await listProjects();
      setProjects(projectList);
    } catch (error) {
      console.warn('Failed to load projects:', error);
    }
  };

  const handleSetupAgent = () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter your API key');
      return;
    }
    
    initializeAgent(apiKey);
    setShowApiKeyInput(false);
  };

  const handleGenerateProject = async () => {
    if (!projectDescription.trim()) {
      Alert.alert('Error', 'Please enter a project description');
      return;
    }

    const request: GenerationRequest = {
      description: projectDescription,
      projectType,
      framework,
      features: [],
      styling: 'stylesheet',
    };

    try {
      await generateProject(request);
      await loadProjectsList();
      setProjectDescription('');
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleStartPreview = async (mode: 'web' | 'game') => {
    if (!currentProject) {
      Alert.alert('Error', 'No project loaded');
      return;
    }

    const config: PreviewConfig = {
      mode,
      entryPoint: 'app/_layout.tsx',
      hotReload: true,
    };

    try {
      await startPreview(config);
    } catch (error) {
      console.error('Preview failed:', error);
    }
  };

  const handleLoadProject = async (projectName: string) => {
    try {
      await loadProject(projectName);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const handleDeleteProject = async (projectName: string) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${projectName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(projectName);
              await loadProjectsList();
            } catch (error) {
              console.error('Failed to delete project:', error);
            }
          },
        },
      ]
    );
  };

  const renderProgressIndicator = () => {
    if (!progress) return null;

    const progressPercentage = progress.totalFiles > 0 
      ? (progress.completedFiles.length / progress.totalFiles) * 100 
      : 0;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressPhase}>
            {progress.phase.charAt(0).toUpperCase() + progress.phase.slice(1)}
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
          />
        </View>
        <Text style={styles.progressMessage}>{progress.message}</Text>
        {progress.currentFile && (
          <Text style={styles.currentFile}>
            Current: {progress.currentFile}
          </Text>
        )}
      </View>
    );
  };

  if (showApiKeyInput) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.setupContainer}>
          <Bot size={64} color="#3B82F6" />
          <Text style={styles.setupTitle}>AI Development Agent</Text>
          <Text style={styles.setupDescription}>
            Enter your AI API key to start generating React Native applications
          </Text>
          
          <TextInput
            style={styles.apiKeyInput}
            placeholder="Enter your OpenAI/Claude/Gemini API key"
            placeholderTextColor="#6b7280"
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.setupButton} onPress={handleSetupAgent}>
            <Zap size={20} color="#fff" />
            <Text style={styles.setupButtonText}>Initialize Agent</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Bot size={32} color="#3B82F6" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>AI Agent</Text>
              <Text style={styles.headerSubtitle}>
                {currentProject ? 'Project Loaded' : 'Ready to Generate'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setShowApiKeyInput(true)}
          >
            <Settings size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        {isGenerating && renderProgressIndicator()}

        {/* Generation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generate New Project</Text>
          
          <View style={styles.typeSelector}>
            {(['app', 'game', 'component'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  projectType === type && styles.activeTypeButton,
                ]}
                onPress={() => setProjectType(type)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    projectType === type && styles.activeTypeButtonText,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.frameworkSelector}>
            {(['expo', 'react-native', 'game'] as const).map((fw) => (
              <TouchableOpacity
                key={fw}
                style={[
                  styles.frameworkButton,
                  framework === fw && styles.activeFrameworkButton,
                ]}
                onPress={() => setFramework(fw)}
              >
                <Text
                  style={[
                    styles.frameworkButtonText,
                    framework === fw && styles.activeFrameworkButtonText,
                  ]}
                >
                  {fw === 'react-native' ? 'React Native' : fw.charAt(0).toUpperCase() + fw.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe your project (e.g., 'A todo app with dark theme and animations')"
            placeholderTextColor="#6b7280"
            value={projectDescription}
            onChangeText={setProjectDescription}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.disabledButton]}
            onPress={handleGenerateProject}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Code size={20} color="#fff" />
            )}
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'Generating...' : 'Generate Project'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Preview Section */}
        {currentProject && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview & Test</Text>
            
            <View style={styles.previewControls}>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={() => handleStartPreview('web')}
              >
                <Monitor size={20} color="#fff" />
                <Text style={styles.previewButtonText}>Web Preview</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.previewButton}
                onPress={() => handleStartPreview('game')}
              >
                <Smartphone size={20} color="#fff" />
                <Text style={styles.previewButtonText}>Game Preview</Text>
              </TouchableOpacity>
            </View>

            {previewUrl && (
              <View style={styles.previewStatus}>
                <Eye size={16} color="#10B981" />
                <Text style={styles.previewStatusText}>
                  Preview running at: {previewUrl}
                </Text>
                <TouchableOpacity onPress={stopPreview}>
                  <Square size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Projects List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Projects</Text>
          
          {projects.length === 0 ? (
            <Text style={styles.emptyText}>No projects yet. Generate your first project above!</Text>
          ) : (
            projects.map((project) => (
              <View key={project} style={styles.projectItem}>
                <TouchableOpacity
                  style={styles.projectInfo}
                  onPress={() => handleLoadProject(project)}
                >
                  <FileText size={20} color="#3B82F6" />
                  <Text style={styles.projectName}>{project}</Text>
                  {currentProject?.includes(project) && (
                    <View style={styles.activeIndicator} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteProject(project)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    flex: 1,
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  setupTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  setupDescription: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  apiKeyInput: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#10B981',
    fontSize: 14,
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  progressContainer: {
    backgroundColor: '#1a1a1a',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressPhase: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercentage: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressMessage: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  currentFile: {
    color: '#9ca3af',
    fontSize: 12,
    fontStyle: 'italic',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: '#3B82F6',
  },
  typeButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTypeButtonText: {
    color: '#fff',
  },
  frameworkSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  frameworkButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    marginRight: 6,
    alignItems: 'center',
  },
  activeFrameworkButton: {
    backgroundColor: '#8B5CF6',
  },
  frameworkButtonText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  activeFrameworkButtonText: {
    color: '#fff',
  },
  descriptionInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    textAlignVertical: 'top',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#374151',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  previewControls: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  previewStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
  },
  previewStatusText: {
    color: '#10B981',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  projectInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});