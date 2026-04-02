import { Eye, Maximize2, PhoneCall, PhoneForwarded, PhoneOff } from 'lucide-react';
import type { CallLog } from '../../types';

interface CallLogsTableProps {
  logs: CallLog[];
  loading: boolean;
  pageNumber: number;
  pageSize: number;
  activeCallId: string | null;
  lastVisitedId: string | null;
  onRowClick: (id: string) => void;
  onPopupClick: (id: string) => void;
}

const INTENT_COLORS: Record<string, string> = {
  Tier_Benefits: 'bg-blue-100 text-blue-700',
  Other_Query: 'bg-orange-100 text-orange-700',
  Booking_Status: 'bg-green-100 text-green-700',
  One_Way_Booking: 'bg-violet-100 text-violet-700',
  Round_Trip_Booking: 'bg-purple-100 text-purple-700',
  Multicity_Booking: 'bg-indigo-100 text-indigo-700',
  Manage_Booking: 'bg-cyan-100 text-cyan-700',
  Booking_Using_Miles: 'bg-teal-100 text-teal-700',
  Government_Booking: 'bg-sky-100 text-sky-700',
  Student_Booking: 'bg-pink-100 text-pink-700',
  FAQ: 'bg-yellow-100 text-yellow-700',
  Status_Enquiry: 'bg-lime-100 text-lime-700',
  Cancellation: 'bg-red-100 text-red-700',
  Refund: 'bg-rose-100 text-rose-700',
  Multiple_Passenger: 'bg-amber-100 text-amber-700',
  Other: 'bg-gray-100 text-gray-600',
  Name_Change: 'bg-fuchsia-100 text-fuchsia-700',
  Red_RP: 'bg-red-100 text-red-700',
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatDate(dateStr: string): string {
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

function IntentBadge({ name }: { name: string }) {
  const label = name.replace(/_/g, ' ');
  const color = INTENT_COLORS[name] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
      {[1, 2, 3, 4, 5, 6, 7].map((col) => (
        <td key={col} className="px-4 py-3.5">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: col === 2 ? '60%' : '80%' }} />
        </td>
      ))}
    </tr>
  );
}

export function CallLogsTable({
  logs,
  loading,
  pageNumber,
  pageSize,
  activeCallId,
  lastVisitedId,
  onRowClick,
  onPopupClick,
}: CallLogsTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mobile Number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Intents</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Transfer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading
              ? Array.from({ length: 10 }, (_, i) => <SkeletonRow key={i} index={i} />)
              : logs.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <PhoneOff className="w-10 h-10 text-gray-300" />
                        <p className="text-gray-400 font-medium">No call logs found</p>
                        <p className="text-gray-300 text-xs">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                )
                : logs.map((log, idx) => {
                    const serial = pageNumber * pageSize + idx + 1;
                    const intentKeys = Object.keys(log.intents);
                    const isActive = activeCallId === log.id;
                    const isLastVisited = !isActive && lastVisitedId === log.id;

                    return (
                      <tr
                        key={log.id}
                        onClick={() => onRowClick(log.id)}
                        className={`cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : isLastVisited
                              ? 'bg-amber-50/60 border-l-4 border-l-amber-400 hover:bg-amber-50'
                              : `hover:bg-blue-50/60 border-l-4 border-l-transparent ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`
                        }`}
                      >
                        <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">{serial}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <PhoneCall className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-500' : isLastVisited ? 'text-amber-500' : 'text-green-500'}`} />
                            <span className={`font-medium font-mono text-xs tracking-wide ${isActive ? 'text-blue-700' : isLastVisited ? 'text-amber-700' : 'text-gray-800'}`}>
                              {log.metaMap?.mobile_number || '—'}
                            </span>
                            {isActive && (
                              <span className="text-[10px] text-blue-600 font-semibold bg-blue-100 px-1.5 py-0.5 rounded-full">
                                Viewing
                              </span>
                            )}
                            {isLastVisited && (
                              <span className="text-[10px] text-amber-600 font-semibold bg-amber-100 px-1.5 py-0.5 rounded-full">
                                Last Viewed
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {intentKeys.length === 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                              No Intent
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {intentKeys.map((k) => <IntentBadge key={k} name={k} />)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                          {formatDate(log.metaMap?.start_time || log.createdDate)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-gray-700 text-xs">
                            {formatDuration(log.callDuration)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {log.humanTransfer ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              <PhoneForwarded className="w-3 h-3" />
                              Transferred
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              <PhoneCall className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); onRowClick(log.id); }}
                              className="p-1.5 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Open in sidebar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onPopupClick(log.id); }}
                              className="p-1.5 rounded-lg hover:bg-violet-100 text-gray-400 hover:text-violet-600 transition-colors"
                              title="Open in popup"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
