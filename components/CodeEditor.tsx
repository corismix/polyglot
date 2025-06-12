import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { FileText, FolderOpen, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react-native';
import { useAgent } from '@/hooks/useAgent';
import { useTheme } from '@/context/ThemeContext';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  path?: string;
}

function buildFileTree(entries: { path: string; type: 'file' | 'directory' }[]): FileNode[] {
  const root: FileNode[] = [];
  const map: Record<string, FileNode> = {};

  for (const entry of entries) {
    const parts = entry.path.split('/');
    let current = root;
    let cumulative = '';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      cumulative += (i === 0 ? '' : '/') + part;
      if (i === parts.length - 1) {
        const node: FileNode = { name: part, type: entry.type === 'directory' ? 'folder' : 'file', path: entry.path };
        current.push(node);
        map[cumulative] = node;
      } else {
        if (!map[cumulative]) {
          const folder: FileNode = { name: part, type: 'folder', children: [], path: cumulative };
          current.push(folder);
          map[cumulative] = folder;
        }
        current = map[cumulative].children!;
      }
    }
  }

  return root;
}

export default function CodeEditor() {
  const [selectedFile, setSelectedFile] = useState<string>('App.tsx');
  const [code, setCode] = useState(`import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});`);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [isExplorerVisible, setIsExplorerVisible] = useState(true);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);

  const { listFiles, readFile, currentProject } = useAgent();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    if (!currentProject) {
      setFileTree([]);
      return;
    }
    listFiles()
      .then(entries => setFileTree(buildFileTree(entries)))
      .catch(() => {});
  }, [currentProject]);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderName)
        ? prev.filter(name => name !== folderName)
        : [...prev, folderName]
    );
  };

  const toggleExplorer = () => {
    setIsExplorerVisible(!isExplorerVisible);
  };

  const renderFileTree = (nodes: FileNode[], depth: number = 0) => {
    return nodes.map((node, index) => (
      <View key={index}>
        <TouchableOpacity
          style={[styles.fileItem, { paddingLeft: 12 + depth * 16 }]}
          onPress={() => {
            if (node.type === 'folder') {
              toggleFolder(node.name);
            } else {
              setSelectedFile(node.name);
              if (node.path) {
                readFile(node.path).then(setCode).catch(() => {});
              }
            }
          }}
        >
          {node.type === 'folder' ? (
            expandedFolders.includes(node.name) ? (
              <ChevronDown size={16} color="#6b7280" />
            ) : (
              <ChevronRight size={16} color="#6b7280" />
            )
          ) : null}
          {node.type === 'folder' ? (
            <FolderOpen size={16} color="#F59E0B" />
          ) : (
            <FileText size={16} color="#3B82F6" />
          )}
          <Text
            style={[
              styles.fileName,
              selectedFile === node.name && styles.selectedFileName,
            ]}
          >
            {node.name}
          </Text>
        </TouchableOpacity>
        {node.type === 'folder' &&
          expandedFolders.includes(node.name) &&
          node.children &&
          renderFileTree(node.children, depth + 1)}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {/* File Explorer */}
      {isExplorerVisible && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Explorer</Text>
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={toggleExplorer}
            >
              <PanelLeftClose size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.fileTree}>
            {renderFileTree(fileTree)}
          </ScrollView>
        </View>
      )}

      {/* Code Editor */}
      <View style={styles.editor}>
        <View style={styles.editorHeader}>
          {!isExplorerVisible && (
            <TouchableOpacity 
              style={styles.showExplorerButton}
              onPress={toggleExplorer}
            >
              <PanelLeft size={16} color="#6b7280" />
            </TouchableOpacity>
          )}
          <Text style={styles.editorTitle}>{selectedFile}</Text>
        </View>
        <ScrollView style={styles.codeContainer}>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={setCode}
            multiline
            textAlignVertical="top"
            placeholder="Start coding..."
            placeholderTextColor={theme.colors.muted}
          />
        </ScrollView>
      </View>
    </View>
  );
}

import type { Theme } from '@/constants/theme';

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
  },
  sidebar: {
    width: 250,
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sidebarTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  fileTree: {
    flex: 1,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 16,
  },
  fileName: {
    color: theme.colors.muted,
    fontSize: 14,
    marginLeft: 8,
  },
  selectedFileName: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  editor: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  showExplorerButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    marginRight: 12,
  },
  editorTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  codeContainer: {
    flex: 1,
    padding: 16,
  },
  codeInput: {
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
    minHeight: 400,
  },
});