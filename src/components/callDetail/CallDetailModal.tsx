import { useState, useEffect } from 'react';
import { X, Phone, PhoneCall, PhoneForwarded, Clock, Info, Wrench, Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import { useCallDetail } from '../../hooks/useCallDetail';
import { CallInfoTab } from './CallInfoTab';
import { ToolsAudioTab } from './ToolsAudioTab';

interface CallDetailModalProps {
  callId: string | null;
  onClose: () => void;
}

type Tab = 'info' | 'tools';

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function CallDetailModal({ callId, onClose }: CallDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [copied, setCopied] = useState(false);
  const { data, loading, error } = useCallDetail(callId ?? undefined);

  function copyId() {
    if (!data) return;
    navigator.clipboard.writeText(data.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  useEffect(() => {
    setActiveTab('info');
  }, [callId]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const isOpen = callId !== null;
  const intentKeys = data ? Object.keys(data.intents) : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/80 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
              <h2 className="text-base font-semibold text-gray-900">Call Details</h2>
              {data && (
                <>
                  {data.humanTransfer ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      <PhoneForwarded className="w-2.5 h-2.5" />
                      Transferred
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      <PhoneCall className="w-2.5 h-2.5" />
                      Completed
                    </span>
                  )}
                  {data.callDuration > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDuration(data.callDuration)}
                    </span>
                  )}
                </>
              )}
            </div>
            {data && (
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {data.metaMap?.mobile_number}
                </span>
                <span className="text-gray-300">·</span>
                <span>{formatDateTime(data.metaMap?.start_time)}</span>
                <span className="text-gray-300">·</span>
                <span className="font-mono text-gray-400 select-all">{data.id}</span>
                <button onClick={copyId} className="ml-0.5 p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors shrink-0" title="Copy ID">
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}
            {data && intentKeys.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {intentKeys.map((k) => (
                  <span key={k} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {k.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Call Information
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'tools'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Tools &amp; Audio
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}
          {error && (
            <div className="m-5 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {!loading && !error && data && (
            <div className="p-5">
              {activeTab === 'info' && <CallInfoTab data={data} />}
              {activeTab === 'tools' && <ToolsAudioTab data={data} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
