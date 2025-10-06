import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for managing change filters
 * Provides filter state and filtered results
 */
export const useChangeFilters = (changes) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChangeType, setSelectedChangeType] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedRepository, setSelectedRepository] = useState('all');

  // Extract unique values from changes
  const uniqueFileTypes = useMemo(() => {
    const types = new Set(changes.map(c => c.file_extension).filter(Boolean));
    return Array.from(types).sort();
  }, [changes]);

  const uniqueAuthors = useMemo(() => {
    const authors = new Set(changes.map(c => c.author).filter(Boolean));
    return Array.from(authors).sort();
  }, [changes]);

  const uniqueRepositories = useMemo(() => {
    const repos = new Set(changes.map(c => c.repository_name).filter(Boolean));
    return Array.from(repos).sort();
  }, [changes]);

  // Apply all filters
  const filteredChanges = useMemo(() => {
    let result = [...changes];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(change => 
        change.relative_path.toLowerCase().includes(query) ||
        change.author.toLowerCase().includes(query) ||
        change.repository_name.toLowerCase().includes(query)
      );
    }

    // Change type filter
    if (selectedChangeType !== 'all') {
      result = result.filter(change => change.change_type === selectedChangeType);
    }

    // File type filter
    if (selectedFileType !== 'all') {
      result = result.filter(change => change.file_extension === selectedFileType);
    }

    // Author filter
    if (selectedAuthor !== 'all') {
      result = result.filter(change => change.author === selectedAuthor);
    }

    // Repository filter
    if (selectedRepository !== 'all') {
      result = result.filter(change => change.repository_name === selectedRepository);
    }

    return result;
  }, [changes, searchQuery, selectedChangeType, selectedFileType, selectedAuthor, selectedRepository]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery || 
           selectedChangeType !== 'all' || 
           selectedFileType !== 'all' || 
           selectedAuthor !== 'all' ||
           selectedRepository !== 'all';
  }, [searchQuery, selectedChangeType, selectedFileType, selectedAuthor, selectedRepository]);

  // Get count of active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedChangeType !== 'all') count++;
    if (selectedFileType !== 'all') count++;
    if (selectedAuthor !== 'all') count++;
    if (selectedRepository !== 'all') count++;
    return count;
  }, [searchQuery, selectedChangeType, selectedFileType, selectedAuthor, selectedRepository]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedChangeType('all');
    setSelectedFileType('all');
    setSelectedAuthor('all');
    setSelectedRepository('all');
  }, []);

  // Clear specific filter
  const clearFilter = useCallback((filterName) => {
    switch (filterName) {
      case 'search':
        setSearchQuery('');
        break;
      case 'changeType':
        setSelectedChangeType('all');
        break;
      case 'fileType':
        setSelectedFileType('all');
        break;
      case 'author':
        setSelectedAuthor('all');
        break;
      case 'repository':
        setSelectedRepository('all');
        break;
      default:
        break;
    }
  }, []);

  return {
    // Filtered results
    filteredChanges,
    
    // Filter states
    searchQuery,
    selectedChangeType,
    selectedFileType,
    selectedAuthor,
    selectedRepository,
    
    // Setters
    setSearchQuery,
    setSelectedChangeType,
    setSelectedFileType,
    setSelectedAuthor,
    setSelectedRepository,
    
    // Unique values for dropdowns
    uniqueFileTypes,
    uniqueAuthors,
    uniqueRepositories,
    
    // Filter status
    hasActiveFilters,
    activeFilterCount,
    
    // Actions
    clearAllFilters,
    clearFilter
  };
};