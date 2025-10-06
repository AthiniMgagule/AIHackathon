import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/dashboard';

const App = () => {
  return (
    <Router>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;