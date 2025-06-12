import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, FolderOpen, Smartphone, Monitor, Clock, MoveVertical as MoreVertical, Star } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface Project {
  id: string;
  name: string;
  framework: string;
  type: 'mobile' | 'web';
  lastModified: string;
  isStarred: boolean;
  description: string;
}

export default function ProjectsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'E-commerce App',
      framework: 'React Native',
      type: 'mobile',
      lastModified: '2 hours ago',
      isStarred: true,
      description: 'Mobile shopping app with AI recommendations',
    },
    {
      id: '2',
      name: 'Task Manager',
      framework: 'Flutter',
      type: 'mobile',
      lastModified: '1 day ago',
      isStarred: false,
      description: 'Productivity app with team collaboration',
    },
    {
      id: '3',
      name: 'Weather Dashboard',
      framework: 'React',
      type: 'web',
      lastModified: '3 days ago',
      isStarred: true,
      description: 'Real-time weather analytics platform',
    },
  ]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStar = (id: string) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id ? { ...project, isStarred: !project.isStarred } : project
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity style={styles.newProjectButton}>
          <Plus size={20} color="#fff" />
          <Text style={styles.newProjectButtonText}>New Project</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{projects.length}</Text>
          <Text style={styles.statLabel}>Total Projects</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{projects.filter(p => p.isStarred).length}</Text>
          <Text style={styles.statLabel}>Starred</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {projects.filter(p => p.type === 'mobile').length}
          </Text>
          <Text style={styles.statLabel}>Mobile Apps</Text>
        </View>
      </View>

      {/* Projects List */}
      <ScrollView style={styles.projectsList} showsVerticalScrollIndicator={false}>
        {filteredProjects.map((project) => (
          <TouchableOpacity key={project.id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <View style={styles.projectIcon}>
                {project.type === 'mobile' ? (
                  <Smartphone size={24} color="#3B82F6" />
                ) : (
                  <Monitor size={24} color="#8B5CF6" />
                )}
              </View>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectFramework}>{project.framework}</Text>
              </View>
              <View style={styles.projectActions}>
                <TouchableOpacity onPress={() => toggleStar(project.id)}>
                  <Star
                    size={20}
                    color={project.isStarred ? '#F59E0B' : '#6b7280'}
                    fill={project.isStarred ? '#F59E0B' : 'none'}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreButton}>
                  <MoreVertical size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.projectDescription}>{project.description}</Text>
            <View style={styles.projectFooter}>
              <View style={styles.lastModified}>
                <Clock size={14} color="#6b7280" />
                <Text style={styles.lastModifiedText}>{project.lastModified}</Text>
              </View>
              <View style={styles.projectTypeBadge}>
                <Text style={styles.projectTypeBadgeText}>
                  {project.type === 'mobile' ? 'Mobile' : 'Web'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

import type { Theme } from '@/constants/theme';

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  newProjectButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newProjectButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  projectsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  projectCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  projectFramework: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 2,
  },
  projectActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButton: {
    marginLeft: 12,
  },
  projectDescription: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastModified: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastModifiedText: {
    color: '#6b7280',
    fontSize: 12,
    marginLeft: 4,
  },
  projectTypeBadge: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  projectTypeBadgeText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
});