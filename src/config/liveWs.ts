const WS_BASE = 'wss://prod.routenodesvr6e.aionos.ai';
const WS_API_KEY = '9f8c2a7e6b1d4c5f8a3e2b7d9c6f1a0e4b8c9d2e7f6a1b3c5d8e9f0a2b4c6d8';

export function getRoomsWsUrl(): string {
  return `${WS_BASE}/rooms?x-api-key=${WS_API_KEY}`;
}

export function getTranscriptionWsUrl(room: string): string {
  return `${WS_BASE}/transcriptions?room=${encodeURIComponent(room)}&x-api-key=${WS_API_KEY}`;
}

export function getAudioWsUrl(room: string): string {
  return `${WS_BASE}/audio?session_id=${encodeURIComponent(room)}&x-api-key=${WS_API_KEY}`;
}

export const TRANSFER_BASE = 'https://prod.pvb6e.aionos.ai';

/** Extract a human-readable phone number from a room ID string. */
export function extractPhoneFromRoom(roomId: string): string | null {
  const match = roomId.match(/\+\d{10,15}/);
  return match ? match[0] : null;
}
