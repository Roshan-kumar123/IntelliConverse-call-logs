import { useState, useCallback, useRef } from 'react';
import { useRoomsWebSocket } from '../hooks/useRoomsWebSocket';
import { useTranscriptionWebSocket } from '../hooks/useTranscriptionWebSocket';
import { useAudioWebSocket } from '../hooks/useAudioWebSocket';
import { useLiveAudio } from '../hooks/useLiveAudio';
import { ActiveRoomsList } from '../components/live/ActiveRoomsList';
import { LiveTranscriptionView } from '../components/live/LiveTranscriptionView';
import { LiveAudioView } from '../components/live/LiveAudioView';
import type { LiveView } from '../types/live';

export function LiveCallsPage() {
  const [view, setView] = useState<LiveView>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);

  const { rooms, status: roomsStatus } = useRoomsWebSocket();
  const { feedAudioChunk, ensureAudioCtx, isPlaying, hasAudio, needsGesture, stop: stopAudio, reset: resetAudio, analyserNode } = useLiveAudio();

  const feedRef = useRef(feedAudioChunk);
  feedRef.current = feedAudioChunk;

  const handleAudioChunk = useCallback((base64: string, sampleRate: number, channel: string) => {
    feedRef.current(base64, sampleRate, channel);
  }, []);

  const {
    messages,
    status: txStatus,
    disconnected,
  } = useTranscriptionWebSocket(
    view !== 'rooms' ? selectedRoom : null,
  );

  const { status: audioWsStatus } = useAudioWebSocket(
    selectedRoom,
    view === 'audio' && audioStarted,
    handleAudioChunk,
  );

  function handleSelectTranscription(room: string) {
    setSelectedRoom(room);
    setView('transcription');
  }

  function handleSelectAudio(room: string) {
    ensureAudioCtx();
    setAudioStarted(true);
    setSelectedRoom(room);
    setView('audio');
  }

  function handleBack() {
    resetAudio();
    setAudioStarted(false);
    setView('rooms');
    setSelectedRoom(null);
  }

  function handleAudioStart() {
    ensureAudioCtx();
    setAudioStarted(true);
  }

  function handleAudioStop() {
    stopAudio();
    setAudioStarted(false);
  }

  function handleSwitchToAudio() {
    ensureAudioCtx();
    setAudioStarted(true);
    setView('audio');
  }

  function handleSwitchToTranscription() {
    stopAudio();
    setAudioStarted(false);
    setView('transcription');
  }

  if (view === 'transcription' && selectedRoom) {
    return (
      <LiveTranscriptionView
        roomId={selectedRoom}
        messages={messages}
        connectionStatus={txStatus}
        disconnected={disconnected}
        onBack={handleBack}
        onSwitchToAudio={handleSwitchToAudio}
      />
    );
  }

  if (view === 'audio' && selectedRoom) {
    return (
      <LiveAudioView
        roomId={selectedRoom}
        connectionStatus={audioWsStatus}
        disconnected={disconnected}
        isPlaying={isPlaying}
        hasAudio={hasAudio}
        audioStarted={audioStarted}
        needsGesture={needsGesture}
        analyserNode={analyserNode}
        onStart={handleAudioStart}
        onStop={handleAudioStop}
        onBack={handleBack}
        onSwitchToTranscription={handleSwitchToTranscription}
      />
    );
  }

  return (
    <ActiveRoomsList
      rooms={rooms}
      status={roomsStatus}
      onSelectTranscription={handleSelectTranscription}
      onSelectAudio={handleSelectAudio}
    />
  );
}
