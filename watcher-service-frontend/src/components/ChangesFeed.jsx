import React, { useState } from 'react';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';

import FilterBar from '../components/FilterBar';
import ChangeItem from './ChangeItem';

const ChangesFeed = ({ existingChanges, liveChanges, loading, error, lastFetch, onRefresh }) => {
  const allChanges = React.useMemo(() => {
    const changeMap = new Map();

    //====== Add live changes first (they take precedence)
    liveChanges.forEach(change => {
      const key = `${change.relative_path}-${change.timestamp}`;
      changeMap.set(key, { ...change, isLive: true });
    });

    //====== Add existing changes if not already present
    existingChanges.forEach(change => {
      const key = `${change.relative_path}-${change.timestamp}`;
      if (!changeMap.has(key)) {
        changeMap.set(key, { ...change, isLive: false });
      }
    });

    //====== Sort by timestamp (newest first)
    return Array.from(changeMap.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [existingChanges, liveChanges]);

  const [filteredChanges, setFilteredChanges] = useState([]);

  const displayChanges = filteredChanges.length > 0 || allChanges.length === 0 
    ? filteredChanges 
    : allChanges;

  return (
    <div className="card h-100 d-flex flex-column">

      <div className="card-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
        <div>
          <h5 className="card-title mb-0">File Changes</h5>
          {lastFetch && (
            <small className="text-muted">
              Last updated: {lastFetch.toLocaleTimeString()}
            </small>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">
            {allChanges.length} changes
            {liveChanges.length > 0 && (
              <span className="text-success ms-1">({liveChanges.length} live)</span>
            )}
          </small>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh changes"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      <div className="card-body p-0 flex-grow-1 d-flex flex-column">
        <div className="p-3 border-bottom">
          <FilterBar 
            changes={allChanges} 
            onFilteredChangesChange={setFilteredChanges}
          />
        </div>

        <div className="p-3 overflow-auto flex-grow-1">
          {error && (
            <div className="alert alert-warning mb-3 d-flex align-items-center" role="alert">
              <AlertCircle size={16} className="me-2" />
              Failed to load changes: {error}
            </div>
          )}

          {loading && allChanges.length === 0 ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mb-0">Loading changes...</p>
            </div>
          ) : displayChanges.length > 0 ? (
            displayChanges.map((change, index) => (
              <ChangeItem 
                key={`${change.relative_path}-${change.timestamp}-${index}`} 
                change={change} 
                isLive={change.isLive}
              />
            ))
          ) : (
            <div className="text-center py-5 text-muted">
              <Activity size={48} className="mb-3 opacity-50" />
              <p className="mb-1">No changes detected yet</p>
              <small>Start watching repositories to see file changes</small>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ChangesFeed;