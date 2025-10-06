import React, { useState  } from 'react';

const ChangeItem = ({ change, isLive = false }) => {
  const [showDiff, setShowDiff] = useState(false);
  
  const getChangeTypeBadge = (type) => {
    switch (type) {
      case 'created': return 'bg-success';
      case 'modified': return 'bg-primary';
      case 'deleted': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  // Check if we have diff content to show
  const hasDiffContent = () => {
    if (!change.git_diff) return false;
    
    const excludedMessages = [
      'No changes detected',
      'No actual changes detected', 
      'No changes to display',
      'File deleted (no previous snapshot available)',
      ''
    ];
    
    return !excludedMessages.includes(change.git_diff.trim());
  };

  // Format git diff for better display
  const formatGitDiff = (diff) => {
    if (!diff) return '';
    
    // Split into lines and process each line
    const lines = diff.split('\n');
    let formattedLines = [];
    
    for (const line of lines) {
      if (line.startsWith('+++') || line.startsWith('---')) {
        // File headers
        formattedLines.push(`<span class="text-info">${line}</span>`);
      } else if (line.startsWith('@@')) {
        // Hunk headers
        formattedLines.push(`<span class="text-warning fw-bold">${line}</span>`);
      } else if (line.startsWith('+')) {
        // Added lines
        formattedLines.push(`<span class="text-success">${line}</span>`);
      } else if (line.startsWith('-')) {
        // Removed lines
        formattedLines.push(`<span class="text-danger">${line}</span>`);
      } else if (line.startsWith('diff --git')) {
        // Git diff header
        formattedLines.push(`<span class="text-muted fw-bold">${line}</span>`);
      } else {
        // Context lines
        formattedLines.push(`<span class="text-dark">${line}</span>`);
      }
    }
    
    return formattedLines.join('\n');
  };
  
  return (
    <div className={`card mb-3 ${isLive ? 'border-success border-2' : 'border-start border-primary border-4'}`}>
      <div className="card-body">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start">
          <div className="flex-grow-1 w-100">
            <div className="d-flex flex-wrap align-items-center mb-2 gap-2">
              <span className={`badge ${getChangeTypeBadge(change.change_type)} flex-shrink-0`}>
                {change.change_type.toUpperCase()}
              </span>
              <small className="text-muted text-truncate">
                {change.repository_name}
              </small>
              {isLive && (
                <span className="badge bg-success">LIVE</span>
              )}
            </div>
            
            <h6 className="font-monospace mb-2 text-break">
              {change.relative_path}
            </h6>
            
            <div className="d-flex flex-wrap gap-2 gap-sm-3 text-muted small mb-2">
              <span className="text-truncate">{change.author}</span>
              <span className="flex-shrink-0">{formatTime(change.timestamp)}</span>
              {(change.lines_added > 0 || change.lines_removed > 0) && (
                <span className="flex-shrink-0">
                  <span className="text-success">+{change.lines_added}</span>
                  {' '}
                  <span className="text-danger">-{change.lines_removed}</span>
                </span>
              )}
            </div>

            {/* Toggle button for diff */}
            {hasDiffContent() && (
              <button 
                className="btn btn-sm btn-outline-secondary mb-2"
                onClick={() => setShowDiff(!showDiff)}
              >
                {showDiff ? '🔽 Hide Diff' : '🔽 Show Diff'}
              </button>
            )}
          </div>
        </div>
        
        {/* Show formatted_changes if available (fallback) */}
        {!hasDiffContent() && change.formatted_changes && 
         change.formatted_changes !== 'No changes to display' && 
         change.formatted_changes !== 'No changes detected' && (
          <div className="mt-3">
            <div className="bg-light p-3 rounded overflow-auto" style={{ maxHeight: '12rem' }}>
              <pre className="mb-0 small font-monospace text-wrap">{change.formatted_changes}</pre>
            </div>
          </div>
        )}

        {/* Show git diff when toggled */}
        {showDiff && hasDiffContent() && (
          <div className="mt-3">
            <div className="card">
              <div className="card-header py-2">
                <small className="text-muted fw-bold">Git Diff</small>
              </div>
              <div className="card-body p-0">
                <div 
                  className="bg-dark text-light p-3 overflow-auto font-monospace small" 
                  style={{ maxHeight: '20rem' }}
                  dangerouslySetInnerHTML={{ 
                    __html: formatGitDiff(change.git_diff) 
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2">
            <details className="small text-muted">
              <summary>Debug Info</summary>
              <pre className="small">
                {JSON.stringify({
                  has_git_diff: !!change.git_diff,
                  git_diff_length: change.git_diff?.length || 0,
                  has_formatted_changes: !!change.formatted_changes,
                  formatted_changes_length: change.formatted_changes?.length || 0,
                  sent_to_ai: change.sent_to_ai
                }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangeItem;