import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Key, Palette, Code, Download, Shield, CircleHelp as HelpCircle, ChevronRight, Eye, EyeOff } from 'lucide-react-native';

export default function SettingsScreen() {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    claude: '',
    gemini: '',
  });
  const [showApiKeys, setShowApiKeys] = useState({
    openai: false,
    claude: false,
    gemini: false,
  });
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [codeCompletion, setCodeCompletion] = useState(true);

  const handleApiKeyChange = (provider: keyof typeof apiKeys, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const toggleApiKeyVisibility = (provider: keyof typeof showApiKeys) => {
    setShowApiKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const saveApiKeys = () => {
    Alert.alert('Success', 'API keys have been saved securely');
  };

  const clearData = () => {
    Alert.alert(
      'Clear Data',
      'Are you sure you want to clear all data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* AI Integration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Integration</Text>
          <Text style={styles.sectionDescription}>
            Configure your AI provider API keys for code generation
          </Text>
          
          {Object.entries(apiKeys).map(([provider, key]) => (
            <View key={provider} style={styles.apiKeyContainer}>
              <Text style={styles.apiKeyLabel}>
                {provider === 'openai' ? 'OpenAI API Key' : 
                 provider === 'claude' ? 'Claude API Key' : 'Gemini API Key'}
              </Text>
              <View style={styles.apiKeyInputContainer}>
                <TextInput
                  style={styles.apiKeyInput}
                  placeholder={`Enter your ${provider} API key`}
                  placeholderTextColor="#6b7280"
                  value={key}
                  onChangeText={(value) => handleApiKeyChange(provider as keyof typeof apiKeys, value)}
                  secureTextEntry={!showApiKeys[provider as keyof typeof showApiKeys]}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => toggleApiKeyVisibility(provider as keyof typeof showApiKeys)}
                >
                  {showApiKeys[provider as keyof typeof showApiKeys] ? (
                    <EyeOff size={20} color="#6b7280" />
                  ) : (
                    <Eye size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          <TouchableOpacity style={styles.saveButton} onPress={saveApiKeys}>
            <Key size={16} color="#fff" />
            <Text style={styles.saveButtonText}>Save API Keys</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme interface</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-save Projects</Text>
              <Text style={styles.settingDescription}>Automatically save changes</Text>
            </View>
            <Switch
              value={autoSave}
              onValueChange={setAutoSave}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Code Completion</Text>
              <Text style={styles.settingDescription}>AI-powered code suggestions</Text>
            </View>
            <Switch
              value={codeCompletion}
              onValueChange={setCodeCompletion}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Developer Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Code size={20} color="#6b7280" />
            <View style={styles.menuItemInfo}>
              <Text style={styles.menuItemLabel}>Export Settings</Text>
              <Text style={styles.menuItemDescription}>Download configuration</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Download size={20} color="#6b7280" />
            <View style={styles.menuItemInfo}>
              <Text style={styles.menuItemLabel}>Project Templates</Text>
              <Text style={styles.menuItemDescription}>Manage custom templates</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <HelpCircle size={20} color="#6b7280" />
            <View style={styles.menuItemInfo}>
              <Text style={styles.menuItemLabel}>Help & Documentation</Text>
              <Text style={styles.menuItemDescription}>Get help and tutorials</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Shield size={20} color="#6b7280" />
            <View style={styles.menuItemInfo}>
              <Text style={styles.menuItemLabel}>Privacy Policy</Text>
              <Text style={styles.menuItemDescription}>How we protect your data</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
          
          <TouchableOpacity style={styles.dangerButton} onPress={clearData}>
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
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
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  apiKeyContainer: {
    marginBottom: 16,
  },
  apiKeyLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  apiKeyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  apiKeyInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemDescription: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 2,
  },
  dangerTitle: {
    color: '#EF4444',
  },
  dangerButton: {
    backgroundColor: '#1a1a1a',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});