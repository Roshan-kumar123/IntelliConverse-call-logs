// ── WebSocket message types from /rooms endpoint ──

export interface ActiveRoomsMessage {
  type: 'activeRooms';
  rooms: string[];
}

export interface RoomDisconnectedMessage {
  type: 'roomDisconnected';
  sessionId: string;
}

export type RoomsWsMessage = ActiveRoomsMessage | RoomDisconnectedMessage;

// ── WebSocket message types from /transcriptions endpoint ──

export interface TranscriptionMessage {
  type: 'transcription';
  sessionId: string;
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  formattedDate: string;
  isPending: boolean;
}

export interface AudioChunkMessage {
  type: 'audio_chunk';
  sessionId: string;
  channel: 'output' | 'input';
  sampleRate: number;
  sequence: number;
  audio: string; // base64-encoded PCM 16-bit data
}

export type TranscriptionWsMessage =
  | TranscriptionMessage
  | AudioChunkMessage
  | RoomDisconnectedMessage;

// ── UI state types ──

export type LiveView = 'rooms' | 'transcription' | 'audio';

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
