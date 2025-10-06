import { useState, useEffect, useRef } from 'react';
import RepoManager from '../components/RepoManager';
import ChangesFeed from '../components/ChangesFeed';
import Header from '../components/Header';

class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:8001';
  }
  
  async getRepositories() {
    const response = await fetch(`${this.baseURL}/repos`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  
  async addRepository(repoData) {
    const response = await fetch(`${this.baseURL}/repos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repoData)
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    return response.json();
  }
  
  async removeRepository(repoId) {
    const response = await fetch(`${this.baseURL}/repos/${repoId}`, {
      method: 'DELETE'
    });
    return response.ok;
  }
  
  async startWatching(repoId) {
    const response = await fetch(`${this.baseURL}/repos/${repoId}/start`, {
      method: 'POST'
    });
    return response.ok;
  }
  
  async stopWatching(repoId) {
    const response = await fetch(`${this.baseURL}/repos/${repoId}/stop`, {
      method: 'POST'
    });
    return response.ok;
  }
  
  async getRecentChanges(limit = 50) {
    const response = await fetch(`${this.baseURL}/changes?limit=${limit}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  
  async getHealth() {
    const response = await fetch(`${this.baseURL}/health`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
}

const apiService = new ApiService();

const useWebSocket = (url) => {
  const [liveChanges, setLiveChanges] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  const connectWebSocket = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setConnectionStatus('failed');
      return;
    }
    
    try {
      setConnectionStatus('connecting');
      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        console.log('WebSocket connected');
      };
      
      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message:', message);
          
          if (message.type === 'file_change' && message.data) {
            setLiveChanges(prev => [message.data, ...prev.slice(0, 49)]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setConnectionStatus('disconnected');
        
        // Only reconnect if it wasn't a manual close
        if (event.code !== 1000) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          reconnectTimeout.current = setTimeout(connectWebSocket, delay);
        }
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('error');
    }
  };
  
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close(1000, 'Component unmounting');
      }
    };
  }, [url]);
  
  const reconnect = () => {
    reconnectAttempts.current = 0;
    connectWebSocket();
  };
  
  return { liveChanges, connectionStatus, reconnect };
};

const useChanges = () => {
  const [existingChanges, setExistingChanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const fetchChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      const changes = await apiService.getRecentChanges(50);
      setExistingChanges(changes);
      setLastFetch(new Date());
    } catch (error) {
      console.error('Failed to fetch changes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchChanges();
    // Refresh every 30 seconds
    const interval = setInterval(fetchChanges, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return {
    existingChanges,
    loading,
    error,
    lastFetch,
    refetch: fetchChanges
  };
};

const useRepoManager = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchRepositories = async () => {
    setLoading(true);
    setError(null);
    try {
      const repos = await apiService.getRepositories();
      setRepositories(repos);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const addRepo = async (repoData) => {
    try {
      const newRepo = await apiService.addRepository(repoData);
      setRepositories(prev => [...prev, newRepo]);
      return { success: true };
    } catch (error) {
      console.error('Failed to add repository:', error);
      return { success: false, error: error.message };
    }
  };
  
  const removeRepo = async (repoId) => {
    try {
      await apiService.removeRepository(repoId);
      setRepositories(prev => prev.filter(repo => repo.id !== repoId));
      return true;
    } catch (error) {
      console.error('Failed to remove repository:', error);
      return false;
    }
  };
  
  const toggleWatching = async (repoId) => {
    const repo = repositories.find(r => r.id === repoId);
    try {
      if (repo.is_watching) {
        await apiService.stopWatching(repoId);
      } else {
        await apiService.startWatching(repoId);
      }
      
      setRepositories(prev => 
        prev.map(r => 
          r.id === repoId 
            ? { ...r, is_watching: !r.is_watching }
            : r
        )
      );
      return true;
    } catch (error) {
      console.error('Failed to toggle watching:', error);
      return false;
    }
  };
  
  useEffect(() => {
    fetchRepositories();
  }, []);
  
  return {
    repositories,
    loading,
    error,
    addRepo,
    removeRepo,
    toggleWatching,
    refreshRepos: fetchRepositories
  };
};

const Dashboard = () => {
  const { repositories, loading: reposLoading, error: reposError, addRepo, removeRepo, toggleWatching } = useRepoManager();
  const { liveChanges, connectionStatus, reconnect } = useWebSocket('ws://localhost:8001/ws/live-feed');
  const { existingChanges, loading: changesLoading, error: changesError, lastFetch, refetch } = useChanges();

  useEffect(() => {
    const existingLink = document.querySelector('link[href*="bootstrap"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    const style = document.createElement('style');
    style.textContent = `
      .spin { animation: spin 1s linear infinite; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      body { 
        margin: 0; 
        padding: 0; 
        background-color: #f8f9fa !important; 
      }
      html {
        background-color: #f8f9fa !important;
      }
      .main-container {
        background-color: #f8f9fa;
        min-height: 100vh;
      }
      /* Ensure header is truly 100% width */
      .full-width-header {
        width: 100vw !important;
        margin-left: calc(-50vw + 50%) !important;
        position: relative;
        left: 50%;
        right: 50%;
      }
      /* GitHub-style diff styling */
      .diff-view {
        background-color: #1e293b; /* Dark slate */
        color: #e2e8f0;
        font-family: monospace;
        font-size: 0.85rem;
        line-height: 1.4;
        border-radius: 0.5rem;
      }
      .diff-view .text-success { color: #22c55e; }
      .diff-view .text-danger { color: #ef4444; }
      .diff-view .text-warning { color: #facc15; }
      .diff-view .text-info { color: #38bdf8; }
    `;
    document.head.appendChild(style);
  }, []);
  
  return (
    <div className="main-container vh-100 d-flex flex-column">
      <Header connectionStatus={connectionStatus} onReconnect={reconnect} />

      <div className="container-fluid py-4 bg-light">
        <div className="row g-4">
          <div className="col-12 col-md-4 col-lg-4">
            <RepoManager 
              repositories={repositories}
              onAddRepo={addRepo}
              onRemoveRepo={removeRepo}
              onToggleWatching={toggleWatching}
              loading={reposLoading}
              error={reposError}
            />
          </div>

          <div className="col-12 col-md-8 col-lg-8">
            <ChangesFeed 
              existingChanges={existingChanges} 
              liveChanges={liveChanges}
              loading={changesLoading}
              error={changesError}
              lastFetch={lastFetch}
              onRefresh={refetch}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;