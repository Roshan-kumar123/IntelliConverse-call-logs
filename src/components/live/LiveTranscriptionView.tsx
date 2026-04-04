import { useRef, useEffect } from 'react';
import { ArrowLeft, Phone, Headphones, MessageSquare, Info } from 'lucide-react';
import { extractPhoneFromRoom } from '../../config/liveWs';
import { ConnectionBadge } from './ConnectionBadge';
import { HumanTransferButton } from './HumanTransferButton';
import type { TranscriptionMessage, WsStatus } from '../../types/live';

interface LiveTranscriptionViewProps {
  roomId: string;
  messages: TranscriptionMessage[];
  connectionStatus: WsStatus;
  disconnected: boolean;
  onBack: () => void;
  onSwitchToAudio: () => void;
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  } catch {
    return ts;
  }
}

function formatDate(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export function LiveTranscriptionView({
  roomId,
  messages,
  connectionStatus,
  disconnected,
  onBack,
  onSwitchToAudio,
}: LiveTranscriptionViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const phone = extractPhoneFromRoom(roomId);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length]);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {phone ?? 'Live Transcription'}
              </h1>
            </div>
            <p className="text-xs text-gray-400 font-mono truncate">{roomId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Active call indicator */}
          {!disconnected && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 border border-red-200 text-red-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Active Call
            </span>
          )}
          <ConnectionBadge status={connectionStatus} />
          <button
            onClick={onSwitchToAudio}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Headphones className="w-3.5 h-3.5" />
            Live Audio
          </button>
          <HumanTransferButton roomId={roomId} />
        </div>
      </div>

      {/* Disconnected banner */}
      {disconnected && (
        <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 shrink-0">
          <Info className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Call ended. The room has been disconnected.</span>
          <button
            onClick={onBack}
            className="ml-auto text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            Back to Rooms
          </button>
        </div>
      )}

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">Waiting for conversation...</h3>
            <p className="text-sm text-gray-400 text-center max-w-xs">
              Start a conversation by connecting to an agent. Your transcript will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => {
              const isAgent = msg.role === 'assistant';
              // Show date separator if date changes
              const showDate = idx === 0 || formatDate(msg.timestamp) !== formatDate(messages[idx - 1].timestamp);

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex items-center justify-center my-3">
                      <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-500 font-medium">
                        {formatDate(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${isAgent ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      isAgent ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {isAgent ? 'A' : 'U'}
                    </div>
                    <div className={`max-w-lg ${msg.isPending ? 'opacity-60' : ''}`}>
                      <div className={`px-4 py-2.5 ${
                        isAgent
                          ? 'bg-white border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm'
                          : 'bg-blue-600 rounded-2xl rounded-br-sm text-white'
                      }`}>
                        <p className={`text-sm leading-relaxed ${isAgent ? 'text-gray-800' : 'text-white'}`}>
                          {msg.content}
                        </p>
                      </div>
                      <p className={`text-[10px] mt-1 ${isAgent ? 'text-gray-400' : 'text-gray-400 text-right'}`}>
                        {formatTime(msg.timestamp)}
                        {msg.isPending && ' · typing...'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
