import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ServicesContext } from '@/context/ServicesContext';
import { AgentCore } from '@/services/AgentCore';
import { FileSystemService } from '@/services/FileSystemService';
import { PreviewEngine } from '@/services/PreviewEngine';
import { ThemeProvider } from '@/context/ThemeContext';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  useFrameworkReady();

  const services = useMemo(
    () => ({
      agentCore: AgentCore.getInstance(),
      fileSystemService: FileSystemService.getInstance(),
      previewEngine: PreviewEngine.getInstance(),
    }),
    []
  );

  return (
    <ServicesContext.Provider value={services}>
      <ThemeProvider>
        <>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" />
          <Toast />
        </>
      </ThemeProvider>
    </ServicesContext.Provider>
  );
}