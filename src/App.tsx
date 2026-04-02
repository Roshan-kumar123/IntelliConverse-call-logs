import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { CallLogsPage } from './pages/CallLogsPage';
import { CallDetailPage } from './pages/CallDetailPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/calls" replace />} />
            <Route path="/calls" element={<CallLogsPage />} />
            <Route path="/calls/:id" element={<CallDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
