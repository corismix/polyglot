import React, { useState } from 'react';
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

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
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

  const [expandedFolders, setExpandedFolders] = useState<string[]>(['src', 'components']);
  const [isExplorerVisible, setIsExplorerVisible] = useState(true);

  const fileTree: FileNode[] = [
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'App.tsx', type: 'file' },
        { name: 'index.tsx', type: 'file' },
        {
          name: 'components',
          type: 'folder',
          children: [
            { name: 'Button.tsx', type: 'file' },
            { name: 'Header.tsx', type: 'file' },
          ],
        },
        {
          name: 'screens',
          type: 'folder',
          children: [
            { name: 'HomeScreen.tsx', type: 'file' },
            { name: 'ProfileScreen.tsx', type: 'file' },
          ],
        },
      ],
    },
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' },
  ];

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
          onPress={() =>
            node.type === 'folder'
              ? toggleFolder(node.name)
              : setSelectedFile(node.name)
          }
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
            placeholderTextColor="#6b7280"
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0f0f0f',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#1a1a1a',
    borderRightWidth: 1,
    borderRightColor: '#2a2a2a',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  sidebarTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#2a2a2a',
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
    color: '#9ca3af',
    fontSize: 14,
    marginLeft: 8,
  },
  selectedFileName: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  editor: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  showExplorerButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#2a2a2a',
    marginRight: 12,
  },
  editorTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  codeContainer: {
    flex: 1,
    padding: 16,
  },
  codeInput: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
    minHeight: 400,
  },
});