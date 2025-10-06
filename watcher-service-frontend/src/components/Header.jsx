import { GitBranch, WifiOff, Wifi, RefreshCw  } from "lucide-react";

const ConnectionStatus = ({ status, onReconnect }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return { icon: Wifi, color: 'text-success', text: 'Live Feed Connected' };
      case 'connecting':
        return { icon: RefreshCw, color: 'text-warning', text: 'Connecting...', spin: true };
      case 'disconnected':
        return { icon: WifiOff, color: 'text-warning', text: 'Reconnecting...' };
      case 'error':
        return { icon: AlertCircle, color: 'text-danger', text: 'Connection Error' };
      case 'failed':
        return { icon: AlertCircle, color: 'text-danger', text: 'Connection Failed', showReconnect: true };
      default:
        return { icon: WifiOff, color: 'text-muted', text: 'Unknown' };
    }
  };
  
  const { icon: Icon, color, text, spin, showReconnect } = getStatusConfig();
  
  return (
    <div className={`d-flex align-items-center gap-2 ${color}`}>
      <Icon size={14} className={spin ? 'spin' : ''} />
      <span className="small fw-medium d-none d-sm-inline">{text}</span>
      {showReconnect && (
        <button 
          className="btn btn-sm btn-outline-primary" 
          onClick={onReconnect}
          title="Retry connection"
        >
          <RefreshCw size={12} />
        </button>
      )}
    </div>
  );
};

const Header = ({ connectionStatus, onReconnect }) => {
  return (
    <header className="w-100 bg-white border-bottom position-sticky top-0" style={{ zIndex: 1000 }}>
      <div className="w-100 px-3 py-3">
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="d-flex align-items-center flex-grow-1">
            <GitBranch className="text-primary me-2 me-sm-3" size={24} />
            <div className="d-none d-sm-block">
              <h1 className="mb-0 h4">Watcher Service</h1>
              <small className="text-muted">AI-Powered Testing Companion</small>
            </div>
            <div className="d-sm-none">
              <h1 className="mb-0 h5">Watcher</h1>
            </div>
          </div>
          
          <div className="d-flex align-items-center">
            <ConnectionStatus status={connectionStatus} onReconnect={onReconnect} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;