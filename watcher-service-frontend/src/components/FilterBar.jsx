import React, { useState, useMemo } from 'react';
import { Search, X, Filter } from 'lucide-react';

const FilterBar = ({ changes, onFilteredChangesChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChangeType, setSelectedChangeType] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const uniqueFileTypes = useMemo(() => {
    const types = new Set(changes.map(c => c.file_extension).filter(Boolean));
    return Array.from(types).sort();
  }, [changes]);

  const uniqueAuthors = useMemo(() => {
    const authors = new Set(changes.map(c => c.author).filter(Boolean));
    return Array.from(authors).sort();
  }, [changes]);

  // Filter logic
  const filteredChanges = useMemo(() => {
    let result = [...changes];

    // Text search (filename or author)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(change => 
        change.relative_path.toLowerCase().includes(query) ||
        change.author.toLowerCase().includes(query)
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

    return result;
  }, [changes, searchQuery, selectedChangeType, selectedFileType, selectedAuthor]);

  // Notify parent of filtered changes whenever filters change
  React.useEffect(() => {
    onFilteredChangesChange(filteredChanges);
  }, [filteredChanges, onFilteredChangesChange]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedChangeType !== 'all' || 
                          selectedFileType !== 'all' || selectedAuthor !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedChangeType('all');
    setSelectedFileType('all');
    setSelectedAuthor('all');
  };

  const changeTypeOptions = [
    { value: 'all', label: 'All Changes', color: 'secondary' },
    { value: 'created', label: 'Created', color: 'success' },
    { value: 'modified', label: 'Modified', color: 'primary' },
    { value: 'deleted', label: 'Deleted', color: 'danger' }
  ];

  return (
    <div className="card mb-3">
      <div className="card-body">
        {/* Search Bar and Toggle */}
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by filename or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          
          <div className="col-12 col-md-4">
            <div className="d-flex gap-2">
              <button
                className={`btn ${showFilters ? 'btn-primary' : 'btn-outline-primary'} flex-grow-1`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} className="me-2" />
                Filters
                {hasActiveFilters && (
                  <span className="badge bg-white text-primary ms-2">
                    {[selectedChangeType !== 'all', selectedFileType !== 'all', selectedAuthor !== 'all'].filter(Boolean).length}
                  </span>
                )}
              </button>
              
              {hasActiveFilters && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={clearAllFilters}
                  title="Clear all filters"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {changeTypeOptions.map(option => (
            <button
              key={option.value}
              className={`btn btn-sm ${
                selectedChangeType === option.value 
                  ? `btn-${option.color}` 
                  : `btn-outline-${option.color}`
              }`}
              onClick={() => setSelectedChangeType(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="row g-3 pt-3 border-top">
            {/* File Type Filter */}
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-muted">File Type</label>
              <select
                className="form-select"
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
              >
                <option value="all">All file types ({changes.length})</option>
                {uniqueFileTypes.map(ext => {
                  const count = changes.filter(c => c.file_extension === ext).length;
                  return (
                    <option key={ext} value={ext}>
                      {ext || '(no extension)'} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Author Filter */}
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-muted">Author</label>
              <select
                className="form-select"
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
              >
                <option value="all">All authors ({changes.length})</option>
                {uniqueAuthors.map(author => {
                  const count = changes.filter(c => c.author === author).length;
                  return (
                    <option key={author} value={author}>
                      {author} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-3 pt-3 border-top">
          <small className="text-muted">
            Showing <strong>{filteredChanges.length}</strong> of <strong>{changes.length}</strong> changes
            {hasActiveFilters && (
              <span className="ms-2">
                (filtered)
              </span>
            )}
          </small>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;