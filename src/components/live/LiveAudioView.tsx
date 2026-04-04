import { ArrowLeft, Phone, MessageSquare, Square, Play, Info, Radio } from 'lucide-react';
import { extractPhoneFromRoom } from '../../config/liveWs';
import { ConnectionBadge } from './ConnectionBadge';
import { HumanTransferButton } from './HumanTransferButton';
import { WaveformCanvas } from './WaveformCanvas';
import type { WsStatus } from '../../types/live';

interface LiveAudioViewProps {
  roomId: string;
  connectionStatus: WsStatus;
  disconnected: boolean;
  isPlaying: boolean;
  hasAudio: boolean;
  audioStarted: boolean;
  needsGesture: boolean;
  analyserNode: AnalyserNode | null;
  onStart: () => void;
  onStop: () => void;
  onBack: () => void;
  onSwitchToTranscription: () => void;
}

export function LiveAudioView({
  roomId,
  connectionStatus,
  disconnected,
  isPlaying,
  hasAudio,
  audioStarted,
  needsGesture,
  analyserNode,
  onStart,
  onStop,
  onBack,
  onSwitchToTranscription,
}: LiveAudioViewProps) {
  const phone = extractPhoneFromRoom(roomId);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
                {phone ?? 'Live Audio'}
              </h1>
            </div>
            <p className="text-xs text-gray-400 font-mono truncate">{roomId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ConnectionBadge status={connectionStatus} />
          <button
            onClick={onSwitchToTranscription}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Transcription
          </button>
        </div>
      </div>

      {/* Disconnected banner */}
      {disconnected && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
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

      {/* Audio card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">Live Audio Stream</h2>
          </div>
          {isPlaying && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Streaming
            </span>
          )}
        </div>

        <div className="p-5">
          {/* Waveform */}
          <WaveformCanvas analyserNode={analyserNode} isActive={isPlaying} />

          {/* Status text */}
          <div className="mt-4 text-center">
            {needsGesture && audioStarted && (
              <p className="text-sm text-amber-600 font-medium">
                Click Start to enable audio playback
              </p>
            )}
            {!needsGesture && audioStarted && !hasAudio && !disconnected && (
              <p className="text-sm text-gray-400">
                <span className="inline-flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                  </span>
                  Waiting for audio stream...
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <HumanTransferButton roomId={roomId} />
          {audioStarted ? (
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              Stop
            </button>
          ) : (
            <button
              onClick={onStart}
              disabled={disconnected}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
