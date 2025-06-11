import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Send, Bot, User, Sparkles, Code, Palette, LayoutGrid as Layout } from 'lucide-react-native';

interface Suggestion {
  id: string;
  icon: any;
  title: string;
  description: string;
  color: string;
}

export default function AIPanel() {
  const [message, setMessage] = useState('');

  const suggestions: Suggestion[] = [
    {
      id: '1',
      icon: Code,
      title: 'Generate Component',
      description: 'Create a new React component',
      color: '#3B82F6',
    },
    {
      id: '2',
      icon: Palette,
      title: 'Update Styling',
      description: 'Modify colors and design',
      color: '#8B5CF6',
    },
    {
      id: '3',
      icon: Layout,
      title: 'Add Screen',
      description: 'Create a new screen layout',
      color: '#10B981',
    },
  ];

  const handleSuggestion = (suggestion: Suggestion) => {
    setMessage(`${suggestion.title}: ${suggestion.description}`);
  };

  const sendMessage = () => {
    if (message.trim()) {
      // Handle AI request
      console.log('AI Request:', message);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      {/* AI Status */}
      <View style={styles.header}>
        <View style={styles.aiInfo}>
          <View style={styles.aiAvatar}>
            <Sparkles size={16} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.aiName}>AI Assistant</Text>
            <Text style={styles.aiStatus}>Ready to help with your code</Text>
          </View>
        </View>
      </View>

      {/* Quick Suggestions */}
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Quick Actions</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsList}
        >
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.id}
              style={[styles.suggestionCard, { borderColor: suggestion.color }]}
              onPress={() => handleSuggestion(suggestion)}
            >
              <View
                style={[styles.suggestionIcon, { backgroundColor: suggestion.color }]}
              >
                <suggestion.icon size={16} color="#fff" />
              </View>
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              <Text style={styles.suggestionDescription}>
                {suggestion.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Context Info */}
      <View style={styles.contextContainer}>
        <Text style={styles.contextTitle}>Current Context</Text>
        <View style={styles.contextItem}>
          <Text style={styles.contextLabel}>File:</Text>
          <Text style={styles.contextValue}>App.tsx</Text>
        </View>
        <View style={styles.contextItem}>
          <Text style={styles.contextLabel}>Framework:</Text>
          <Text style={styles.contextValue}>React Native</Text>
        </View>
        <View style={styles.contextItem}>
          <Text style={styles.contextLabel}>Lines:</Text>
          <Text style={styles.contextValue}>24</Text>
        </View>
      </View>

      {/* AI Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Describe what you want to build or modify..."
            placeholderTextColor="#6b7280"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Send size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  aiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  aiStatus: {
    color: '#10B981',
    fontSize: 12,
    marginTop: 2,
  },
  suggestionsContainer: {
    paddingVertical: 16,
  },
  suggestionsTitle: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  suggestionsList: {
    paddingLeft: 16,
  },
  suggestionCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionDescription: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 16,
  },
  contextContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  contextTitle: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  contextItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  contextLabel: {
    color: '#6b7280',
    fontSize: 12,
    width: 70,
  },
  contextValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    maxHeight: 80,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    backgroundColor: '#3B82F6',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
});