import { useState } from 'react';
import { Play, Square, Trash2, FolderGit2, Clock, Activity, CheckCircle } from 'lucide-react';

const RepoCard = ({ repo, onRemove, onToggleWatching }) => {
  const [actionLoading, setActionLoading] = useState(false);
  
  const handleToggleWatching = async () => {
    setActionLoading(true);
    await onToggleWatching(repo.id);
    setActionLoading(false);
  };
  
  const handleRemove = async () => {
    if (confirm(`Are you sure you want to remove "${repo.name}"?`)) {
      setActionLoading(true);
      await onRemove(repo.id);
      setActionLoading(false);
    }
  };
  
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start">
          <div className="flex-grow-1 w-100">
            <div className="d-flex align-items-center mb-2">
              <FolderGit2 size={20} className="text-primary me-2 flex-shrink-0" />
              <h6 className="card-title mb-0 me-2 text-truncate">{repo.name}</h6>
              {repo.is_watching ? (
                <CheckCircle size={16} className="text-success flex-shrink-0" />
              ) : (
                <div className="border border-secondary rounded-circle flex-shrink-0" style={{ width: '16px', height: '16px' }}></div>
              )}
            </div>
            
            <p className="card-text text-muted small font-monospace mb-2 text-break">
              {repo.path}
            </p>
            
            <div className="d-flex flex-wrap gap-2 gap-sm-3 text-muted small mb-3 mb-sm-0">
              <span className="d-flex align-items-center gap-1">
                <Activity size={12} />
                {repo.total_changes} changes
              </span>
              {repo.last_change && (
                <span className="d-flex align-items-center gap-1">
                  <Clock size={12} />
                  {new Date(repo.last_change).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="d-flex gap-2 align-self-end align-self-sm-start mt-2 mt-sm-0">
            <button
              className={`btn btn-sm ${repo.is_watching ? 'btn-outline-danger' : 'btn-outline-success'}`}
              onClick={handleToggleWatching}
              disabled={actionLoading}
              title={repo.is_watching ? 'Stop watching' : 'Start watching'}
            >
              {repo.is_watching ? <Square size={16} /> : <Play size={16} />}
            </button>
            
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={handleRemove}
              disabled={actionLoading}
              title="Remove repository"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoCard;