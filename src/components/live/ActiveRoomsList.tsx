import { Video, MessageSquare, Headphones, Phone, Copy, Check, Radio, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { extractPhoneFromRoom } from '../../config/liveWs';

const PAGE_SIZE = 12;
import { ConnectionBadge } from './ConnectionBadge';
import type { WsStatus } from '../../types/live';

interface ActiveRoomsListProps {
  rooms: string[];
  status: WsStatus;
  onSelectTranscription: (room: string) => void;
  onSelectAudio: (room: string) => void;
}

function RoomCard({
  room,
  onTranscription,
  onAudio,
}: {
  room: string;
  onTranscription: () => void;
  onAudio: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const phone = extractPhoneFromRoom(room);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(room);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4">
        {/* Phone number / label */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            {phone ? (
              <>
                <p className="text-sm font-semibold text-gray-900">{phone}</p>
                <p className="text-[10px] text-gray-400 font-mono truncate">{room}</p>
              </>
            ) : (
              <p className="text-xs text-gray-600 font-mono truncate">{room}</p>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            title="Copy room ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-xs font-medium text-red-600">Live Call</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTranscription}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Transcription
          </button>
          <button
            onClick={onAudio}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Headphones className="w-3.5 h-3.5" />
            Live Audio
          </button>
        </div>
      </div>
    </div>
  );
}

export function ActiveRoomsList({ rooms, status, onSelectTranscription, onSelectAudio }: ActiveRoomsListProps) {
  const [page, setPage] = useState(0);

  // Reset to first page when number of rooms changes
  useEffect(() => {
    setPage(0);
  }, [rooms.length]);

  const totalPages = Math.ceil(rooms.length / PAGE_SIZE);
  const pageRooms = rooms.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Active Rooms</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">{rooms.length}</span> room{rooms.length !== 1 ? 's' : ''} available
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700">
                  <Radio className="w-3 h-3" />
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>
        <ConnectionBadge status={status} />
      </div>

      {/* Room cards or empty state */}
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Video className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">No active rooms</h2>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            There are currently no active rooms. Start a new session to create one.
          </p>
          {status === 'connected' && (
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Listening for incoming calls...
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageRooms.map((room) => (
              <RoomCard
                key={room}
                room={room}
                onTranscription={() => onSelectTranscription(room)}
                onAudio={() => onSelectAudio(room)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <span className="text-sm text-gray-500">
                Showing{' '}
                <span className="font-medium text-gray-700">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, rooms.length)}
                </span>{' '}
                of <span className="font-medium text-gray-700">{rooms.length}</span>
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
