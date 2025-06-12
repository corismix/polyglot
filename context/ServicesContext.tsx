import React, { createContext, useContext } from 'react';
import { AgentCore } from '@/services/AgentCore';
import { FileSystemService } from '@/services/FileSystemService';
import { PreviewEngine } from '@/services/PreviewEngine';

export interface Services {
  agentCore: AgentCore;
  fileSystemService: FileSystemService;
  previewEngine: PreviewEngine;
}

export const ServicesContext = createContext<Services | undefined>(undefined);

export function useServices(): Services {
  const ctx = useContext(ServicesContext);
  if (!ctx) {
    throw new Error('useServices must be used within a ServicesContext.Provider');
  }
  return ctx;
}
