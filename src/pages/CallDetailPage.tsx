import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, PhoneCall, PhoneForwarded,
  Clock, AlertCircle, RefreshCw, Info, Wrench
} from 'lucide-react';
import { useCallDetail } from '../hooks/useCallDetail';
import { CallInfoTab } from '../components/callDetail/CallInfoTab';
import { ToolsAudioTab } from '../components/callDetail/ToolsAudioTab';

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

function SkeletonDetail() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-64 bg-gray-200 rounded" />
      <div className="h-4 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-3 gap-3 mt-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-xl mt-4" />
    </div>
  );
}

export function CallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const { data, loading, error } = useCallDetail(id);

  const intentKeys = data ? Object.keys(data.intents) : [];

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/calls')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Call Logs
        </button>

        {data && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-mono text-xs text-gray-400">ID: {data.id.slice(0, 16)}…</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {data.metaMap?.mobile_number}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDateTime(data.metaMap?.start_time)}
            </span>
          </div>
        )}
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-blue-600" />
            Call Details
          </h1>
          {data && (
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{data.id}</p>
          )}
        </div>
        {data && (
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {data.callDuration > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                <Clock className="w-3 h-3" />
                {formatDuration(data.callDuration)}
              </span>
            )}
            {data.humanTransfer ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                <PhoneForwarded className="w-3 h-3" />
                Human Transfer
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                <PhoneCall className="w-3 h-3" />
                Bot Completed
              </span>
            )}
            {intentKeys.map((k) => (
              <span key={k} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {k.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm flex-1">{error}</span>
          <button
            onClick={() => navigate('/calls')}
            className="flex items-center gap-1.5 text-sm font-medium hover:text-red-900 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Go back
          </button>
        </div>
      )}

      {loading ? (
        <SkeletonDetail />
      ) : data ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gray-50/50">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Info className="w-4 h-4" />
              Call Information
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'tools'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Tools &amp; Audio Analysis
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'info' && <CallInfoTab data={data} />}
            {activeTab === 'tools' && <ToolsAudioTab data={data} />}
          </div>
        </div>
      ) : null}
    </div>
  );
}
