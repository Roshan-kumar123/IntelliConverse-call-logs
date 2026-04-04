import { useState, useEffect, useRef, useCallback } from 'react';
import { getTranscriptionWsUrl } from '../config/liveWs';
import type { WsStatus, TranscriptionMessage, TranscriptionWsMessage } from '../types/live';

export function useTranscriptionWebSocket(roomId: string | null) {
  const [messages, setMessages] = useState<TranscriptionMessage[]>([]);
  const [status, setStatus] = useState<WsStatus>('disconnected');
  const [disconnected, setDisconnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const shouldReconnect = useRef(true);
  const backoff = useRef(1000);
  const connect = useCallback((id: string) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus('connecting');
    setDisconnected(false);
    setMessages([]);

    const ws = new WebSocket(getTranscriptionWsUrl(id));
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      backoff.current = 1000;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as TranscriptionWsMessage;
        if (msg.type === 'transcription') {
          setMessages((prev) => {
            // Update existing message if same id (for pending → final)
            const idx = prev.findIndex((m) => m.id === msg.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = msg;
              return next;
            }
            return [...prev, msg];
          });
        } else if (msg.type === 'roomDisconnected') {
          setDisconnected(true);
          setStatus('disconnected');
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
      // Only reconnect if not intentionally disconnected
      setStatus('disconnected');
      const delay = backoff.current;
      backoff.current = Math.min(backoff.current * 2, 30000);
      setTimeout(() => {
        if (shouldReconnect.current && !wsRef.current) connect(id);
      }, delay);
    };
  }, []);

  useEffect(() => {
    if (!roomId) {
      // No room selected — clean up
      shouldReconnect.current = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setMessages([]);
      setStatus('disconnected');
      setDisconnected(false);
      return;
    }

    shouldReconnect.current = true;
    connect(roomId);

    return () => {
      shouldReconnect.current = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [roomId, connect]);

  return { messages, status, disconnected };
}
