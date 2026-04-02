import { AUDIT_CATEGORY } from '../config';
import type { CallLogsResponse, CallDetail, CallLogsParams } from '../types';

const API_BASE = '/api/audit-analytics';

// Token is set at login time via setAuthToken()
let _token = '';

export function setAuthToken(token: string) {
  _token = token;
}

function buildHeaders(): HeadersInit {
  return {
    accept: 'application/json, text/plain, */*',
    authorization: `Bearer ${_token}`,
    'ngrok-skip-browser-warning': 'true',
  };
}

export async function fetchCallLogs(params: CallLogsParams): Promise<CallLogsResponse> {
  const query = new URLSearchParams({
    pageNumber: String(params.pageNumber),
    pageSize: String(params.pageSize),
    category: params.category || AUDIT_CATEGORY,
    intents: params.intents || '',
    alfursanId: params.alfursanId || '',
    mobileNumber: params.mobileNumber || '',
    isMobile: String(params.isMobile),
  });

  const res = await fetch(`${API_BASE}/audit?${query}`, {
    headers: buildHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch call logs: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchCallDetail(id: string): Promise<CallDetail> {
  const res = await fetch(`${API_BASE}/audit/${id}`, {
    headers: buildHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch call detail: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchPresignedUrl(analyticsId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/presigned-urls/s3?analyticsId=${analyticsId}`, {
    headers: buildHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch audio: ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get('content-type') ?? '';

  // If the response is binary audio data, create a Blob URL
  if (
    contentType.includes('audio/') ||
    contentType.includes('application/octet-stream') ||
    contentType.includes('video/')
  ) {
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  // Otherwise try to parse as a URL string (JSON-wrapped or plain text)
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return typeof json === 'string' ? json : (json.url ?? json.presignedUrl ?? text);
  } catch {
    if (text.trim().startsWith('http')) return text.trim();
    throw new Error('Audio format not supported');
  }
}
