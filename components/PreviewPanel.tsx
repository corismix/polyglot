import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Smartphone, Monitor, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react-native';

interface PreviewPanelProps {
  isRunning: boolean;
}

const { width } = Dimensions.get('window');

export default function PreviewPanel({ isRunning }: PreviewPanelProps) {
  const [previewMode, setPreviewMode] = React.useState<'mobile' | 'web'>('mobile');
  const [zoom, setZoom] = React.useState(1);

  const PreviewContent = () => (
    <View style={styles.previewContent}>
      <View style={styles.mockHeader}>
        <View style={styles.mockStatusBar} />
        <Text style={styles.mockTitle}>My App</Text>
      </View>
      <View style={styles.mockBody}>
        <View style={styles.mockCard}>
          <Text style={styles.mockCardTitle}>Hello World!</Text>
          <Text style={styles.mockCardText}>
            This is your app preview. Code changes will appear here in real-time.
          </Text>
        </View>
        <View style={styles.mockButton}>
          <Text style={styles.mockButtonText}>Get Started</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Preview Controls */}
      <View style={styles.controls}>
        <View style={styles.deviceToggle}>
          <TouchableOpacity
            style={[
              styles.deviceButton,
              previewMode === 'mobile' && styles.activeDeviceButton,
            ]}
            onPress={() => setPreviewMode('mobile')}
          >
            <Smartphone size={16} color={previewMode === 'mobile' ? '#3B82F6' : '#6b7280'} />
            <Text
              style={[
                styles.deviceButtonText,
                previewMode === 'mobile' && styles.activeDeviceButtonText,
              ]}
            >
              Mobile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.deviceButton,
              previewMode === 'web' && styles.activeDeviceButton,
            ]}
            onPress={() => setPreviewMode('web')}
          >
            <Monitor size={16} color={previewMode === 'web' ? '#3B82F6' : '#6b7280'} />
            <Text
              style={[
                styles.deviceButtonText,
                previewMode === 'web' && styles.activeDeviceButtonText,
              ]}
            >
              Web
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
          >
            <ZoomOut size={16} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => setZoom(prev => Math.min(2, prev + 0.1))}
          >
            <ZoomIn size={16} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => setZoom(1)}
          >
            <RotateCcw size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Preview Area */}
      <View style={styles.previewArea}>
        {isRunning ? (
          <View
            style={[
              styles.deviceFrame,
              previewMode === 'mobile' ? styles.mobileFrame : styles.webFrame,
              { transform: [{ scale: zoom }] },
            ]}
          >
            <PreviewContent />
          </View>
        ) : (
          <View style={styles.notRunning}>
            <Text style={styles.notRunningText}>
              Press "Run" to start the preview
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  deviceToggle: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 2,
  },
  deviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeDeviceButton: {
    backgroundColor: '#2a2a2a',
  },
  deviceButtonText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  activeDeviceButtonText: {
    color: '#3B82F6',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoomButton: {
    padding: 8,
  },
  zoomText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 8,
    minWidth: 40,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
    marginLeft: 8,
  },
  previewArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  deviceFrame: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  mobileFrame: {
    width: 300,
    height: 600,
  },
  webFrame: {
    width: 400,
    height: 500,
  },
  previewContent: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  mockHeader: {
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mockStatusBar: {
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    marginBottom: 16,
  },
  mockTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  mockBody: {
    flex: 1,
    padding: 20,
  },
  mockCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  mockCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  mockCardText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  mockButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  mockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  notRunning: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notRunningText: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
  },
});