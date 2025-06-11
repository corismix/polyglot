import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Square, RotateCcw, Save, Download, ChevronDown, ChevronRight, Plus, Smartphone, Monitor, Code as Code2 } from 'lucide-react-native';
import FloatingActionButton from '@/components/FloatingActionButton';
import CodeEditor from '@/components/CodeEditor';
import PreviewPanel from '@/components/PreviewPanel';
import AIPanel from '@/components/AIPanel';

const { width } = Dimensions.get('window');

export default function WorkspaceScreen() {
  const [activePanel, setActivePanel] = useState<'code' | 'preview' | 'ai'>('code');
  const [isRunning, setIsRunning] = useState(false);
  const [currentProject, setCurrentProject] = useState('My App');
  const [framework, setFramework] = useState('React Native');

  const panels = [
    { id: 'code', title: 'Code Editor', icon: Code2 },
    { id: 'preview', title: 'Preview', icon: Smartphone },
    { id: 'ai', title: 'AI Assistant', icon: Monitor },
  ];

  const handleRun = () => {
    setIsRunning(!isRunning);
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'code':
        return <CodeEditor />;
      case 'preview':
        return <PreviewPanel isRunning={isRunning} />;
      case 'ai':
        return <AIPanel />;
      default:
        return <CodeEditor />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName}>{currentProject}</Text>
          <Text style={styles.framework}>{framework}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.runButton} onPress={handleRun}>
            {isRunning ? (
              <Square size={16} color="#fff" />
            ) : (
              <Play size={16} color="#fff" />
            )}
            <Text style={styles.runButtonText}>
              {isRunning ? 'Stop' : 'Run'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Panel Tabs */}
      <View style={styles.panelTabs}>
        {panels.map((panel) => (
          <TouchableOpacity
            key={panel.id}
            style={[
              styles.panelTab,
              activePanel === panel.id && styles.activePanelTab,
            ]}
            onPress={() => setActivePanel(panel.id as any)}
          >
            <panel.icon
              size={18}
              color={activePanel === panel.id ? '#3B82F6' : '#6b7280'}
            />
            <Text
              style={[
                styles.panelTabText,
                activePanel === panel.id && styles.activePanelTabText,
              ]}
            >
              {panel.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Panel */}
      <View style={styles.mainPanel}>
        {renderPanel()}
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <FloatingActionButton
          icon={Save}
          onPress={() => console.log('Save')}
          style={styles.fab}
        />
        <FloatingActionButton
          icon={Download}
          onPress={() => console.log('Export')}
          style={[styles.fab, styles.fabSecondary]}
        />
        <FloatingActionButton
          icon={Plus}
          onPress={() => console.log('New')}
          style={[styles.fab, styles.fabPrimary]}
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
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
  projectInfo: {
    flex: 1,
  },
  projectName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  framework: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  runButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  runButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  panelTabs: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  panelTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activePanelTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  panelTabText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activePanelTabText: {
    color: '#3B82F6',
  },
  mainPanel: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'center',
  },
  fab: {
    marginBottom: 12,
  },
  fabSecondary: {
    backgroundColor: '#374151',
  },
  fabPrimary: {
    backgroundColor: '#3B82F6',
  },
});