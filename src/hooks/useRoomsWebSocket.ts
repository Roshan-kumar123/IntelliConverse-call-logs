import { useState, useEffect, useRef, useCallback } from 'react';
import { getRoomsWsUrl } from '../config/liveWs';
import type { WsStatus, RoomsWsMessage } from '../types/live';

export function useRoomsWebSocket() {
  const [rooms, setRooms] = useState<string[]>([]);
  const [status, setStatus] = useState<WsStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const shouldReconnect = useRef(true);
  const backoff = useRef(1000);

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus('connecting');
    setError(null);

    const ws = new WebSocket(getRoomsWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      backoff.current = 1000;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as RoomsWsMessage;
        if (msg.type === 'activeRooms') {
          setRooms(msg.rooms);
        } else if (msg.type === 'roomDisconnected') {
          setRooms((prev) => prev.filter((r) => r !== msg.sessionId));
        }
      } catch {
        // ignore unparseable messages
      }
    };

    ws.onerror = () => {
      setStatus('error');
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      wsRef.current = null;
      setStatus('disconnected');
      if (shouldReconnect.current) {
        const delay = backoff.current;
        backoff.current = Math.min(backoff.current * 2, 30000);
        setTimeout(() => {
          if (shouldReconnect.current) connect();
        }, delay);
      }
    };
  }, []);

  useEffect(() => {
    shouldReconnect.current = true;
    connect();
    return () => {
      shouldReconnect.current = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { rooms, status, error };
}
