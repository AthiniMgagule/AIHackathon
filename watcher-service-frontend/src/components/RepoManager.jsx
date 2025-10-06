import { useState } from 'react';
import { Plus, FolderGit2, AlertCircle} from 'lucide-react';
import RepoCard from './RepoCard';
import AddRepoForm from './AddRepoForm';

const RepoManager = ({ repositories, onAddRepo, onRemoveRepo, onToggleWatching, loading, error }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  return (
    <div className="card h-100">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Repositories</h5>
          <button 
            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={14} />
            <span className="d-none d-sm-inline">Add Repo</span>
            <span className="d-sm-none">Add</span>
          </button>
        </div>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-warning mb-3" role="alert">
            <AlertCircle size={16} className="me-2" />
            Failed to load repositories: {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading repositories...</p>
          </div>
        ) : repositories.length > 0 ? (
          <div>
            {repositories.map(repo => (
              <RepoCard 
                key={repo.id}
                repo={repo}
                onRemove={onRemoveRepo}
                onToggleWatching={onToggleWatching}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <FolderGit2 size={40} className="mb-3 opacity-50" />
            <p className="mb-1">No repositories added yet</p>
            <small>Add a git repository to start monitoring</small>
          </div>
        )}
      </div>
      
      {showAddForm && (
        <AddRepoForm 
          onAdd={onAddRepo}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default RepoManager;