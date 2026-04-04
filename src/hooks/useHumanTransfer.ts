import { useState } from 'react';
import { TRANSFER_BASE } from '../config/liveWs';

function readToken(): string {
  try {
    const stored = localStorage.getItem('ic_auth_user');
    if (stored) return (JSON.parse(stored) as { accessToken?: string }).accessToken ?? '';
  } catch { /* ignore */ }
  return '';
}

export function useHumanTransfer(roomId: string | null) {
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  async function transfer(reason: string, intent: string) {
    if (!roomId) return;
    const token = readToken();
    setTransferring(true);
    setTransferError(null);
    setTransferSuccess(false);
    try {
      const res = await fetch(`${TRANSFER_BASE}/transfer/${encodeURIComponent(roomId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify({ reason, intent }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTransferSuccess(true);
    } catch (e) {
      setTransferError(e instanceof Error ? e.message : 'Transfer failed');
    } finally {
      setTransferring(false);
    }
  }

  function reset() {
    setTransferError(null);
    setTransferSuccess(false);
  }

  return { transfer, transferring, transferError, transferSuccess, reset };
}
