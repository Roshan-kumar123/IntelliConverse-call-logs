import type { WsStatus } from '../../types/live';

const STATUS_CONFIG: Record<WsStatus, { dot: string; text: string; bg: string; label: string }> = {
  connected: { dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Connected' },
  connecting: { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Connecting...' },
  disconnected: { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', label: 'Disconnected' },
  error: { dot: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Error' },
};

export function ConnectionBadge({ status }: { status: WsStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
