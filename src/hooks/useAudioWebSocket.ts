import { useEffect, useRef, useCallback } from 'react';
import { useState } from 'react';
import { getAudioWsUrl } from '../config/liveWs';
import type { WsStatus, AudioChunkMessage } from '../types/live';

export function useAudioWebSocket(
  roomId: string | null,
  active: boolean,
  onAudioChunk: (base64: string, sampleRate: number, channel: string) => void,
): { status: WsStatus } {
  const [status, setStatus] = useState<WsStatus>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const shouldReconnect = useRef(false);
  const backoff = useRef(1000);
  const onAudioChunkRef = useRef(onAudioChunk);
  onAudioChunkRef.current = onAudioChunk;

  const connect = useCallback((id: string) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus('connecting');

    const ws = new WebSocket(getAudioWsUrl(id));
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      backoff.current = 1000;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as AudioChunkMessage;
        if (msg.type === 'audio_chunk') {
          onAudioChunkRef.current(msg.audio, msg.sampleRate, msg.channel ?? 'output');
        }
      } catch {
        // ignore unparseable
      }
    };

    ws.onerror = () => {
      setStatus('error');
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (!shouldReconnect.current) return;
      setStatus('disconnected');
      const delay = backoff.current;
      backoff.current = Math.min(backoff.current * 2, 30000);
      setTimeout(() => {
        if (shouldReconnect.current && !wsRef.current) connect(id);
      }, delay);
    };
  }, []);

  useEffect(() => {
    if (!roomId || !active) {
      shouldReconnect.current = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setStatus('disconnected');
      return;
    }

    shouldReconnect.current = true;
    backoff.current = 1000;
    connect(roomId);

    return () => {
      shouldReconnect.current = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [roomId, active, connect]);

  return { status };
}
