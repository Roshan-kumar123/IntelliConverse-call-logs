import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setAuthToken } from './api/callLogs';
import { Header } from './components/layout/Header';
import { LoginPage } from './pages/LoginPage';
import { CallLogsPage } from './pages/CallLogsPage';
import { CallDetailPage } from './pages/CallDetailPage';
import { Loader2 } from 'lucide-react';

function AppRoutes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Keep the API module token in sync with the auth context
  useEffect(() => {
    setAuthToken(user?.accessToken ?? '');
  }, [user]);

  // When user logs out, reset URL to root
  useEffect(() => {
    if (!loading && !user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/calls" replace />} />
          <Route path="/calls" element={<CallLogsPage />} />
          <Route path="/calls/:id" element={<CallDetailPage />} />
          <Route path="*" element={<Navigate to="/calls" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
