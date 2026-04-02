import { useState, useEffect, useRef } from 'react';
import {
  Activity, Clock, Cpu, MessageCircle, Mic, Volume2,
  ChevronDown, ChevronUp, CheckCircle, AlertCircle, Timer,
  Play, Pause, RotateCcw, RotateCw, Download, Loader2, Music2,
  Copy, Check
} from 'lucide-react';
import type { CallDetail } from '../../types';
import { fetchPresignedUrl } from '../../api/callLogs';

interface ToolsAudioTabProps {
  data: CallDetail;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  unit?: string;
}

function MetricCard({ label, value, icon, color, unit }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 font-medium leading-tight">{label}</p>
        <p className="text-base font-bold text-gray-900 leading-tight">
          {value}
          {unit && <span className="text-xs text-gray-400 font-normal ml-0.5">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

function AudioPlayer({ callId }: { callId: string }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [urlError, setUrlError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    setLoadingUrl(true);
    setUrlError(null);
    setAudioError(false);
    fetchPresignedUrl(callId)
      .then((url) => {
        objectUrl = url.startsWith('blob:') ? url : null;
        setAudioUrl(url);
        setLoadingUrl(false);
      })
      .catch((err) => {
        setUrlError(err.message);
        setLoadingUrl(false);
      });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [callId]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
  }

  function seek(delta: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + delta));
  }

  function cycleSpeed() {
    const speeds = [1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }

  function formatTime(s: number): string {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Music2 className="w-3.5 h-3.5" />
        Call Recording
      </h4>

      {loadingUrl && (
        <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading audio file…
        </div>
      )}

      {urlError && (
        <div className="flex items-center gap-2 py-4 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          {urlError}
        </div>
      )}

      {audioError && (
        <div className="flex items-center gap-2 py-4 text-amber-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          Audio playback failed — file may be unavailable or format unsupported.
        </div>
      )}

      {audioUrl && !audioError && (
        <>
          <audio
            ref={audioRef}
            src={audioUrl}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
            onError={() => setAudioError(true)}
            preload="metadata"
          />
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              className="h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                if (audioRef.current) audioRef.current.currentTime = pct * duration;
              }}
            >
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => seek(-10)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                title="Back 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                onClick={() => seek(10)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={cycleSpeed}
                className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                title="Playback speed"
              >
                {speed}x
              </button>
              <a
                href={audioUrl}
                download
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                title="Download recording"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Convert Python-style repr strings to valid JSON so they can be parsed and prettified.
// Handles: single-quoted strings, True/False/None → true/false/null
function pythonReprToJson(raw: string): string {
  let s = raw.trim();

  // Replace Python True/False/None with JSON equivalents (word boundaries)
  s = s.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');

  // Convert single-quoted strings to double-quoted.
  // Strategy: tokenise character by character to handle escapes and nested quotes.
  let result = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "'") {
      // start of a single-quoted string — emit opening double quote
      result += '"';
      i++;
      while (i < s.length) {
        const c = s[i];
        if (c === '\\' && i + 1 < s.length) {
          // pass through escape sequences
          result += s[i] + s[i + 1];
          i += 2;
        } else if (c === '"') {
          // bare double quote inside single-quoted string — escape it
          result += '\\"';
          i++;
        } else if (c === "'") {
          // closing single quote
          result += '"';
          i++;
          break;
        } else {
          result += c;
          i++;
        }
      }
    } else {
      result += ch;
      i++;
    }
  }
  return result;
}

interface Formatted {
  display: string;  // what to show in the <pre>
  copy: string;     // what to put on clipboard (always valid JSON)
}

// Try to produce a prettified JSON string from raw API response.
// Handles: valid JSON, Python-style single-quoted dicts,
//          "status=NNN body=<json>" HTTP response strings,
//          truncated/unparseable strings (wrapped as {"raw":...} for valid copy).
function formatResponse(raw: string): Formatted {
  if (!raw) return { display: raw, copy: raw };

  // 1. Try direct JSON parse
  try {
    const pretty = JSON.stringify(JSON.parse(raw), null, 2);
    return { display: pretty, copy: pretty };
  } catch { /* fall through */ }

  // 2. "status=NNN body=<payload>" pattern — extract just the body JSON
  const bodyMatch = raw.match(/^status=\d+\s+body=(.+)$/s);
  if (bodyMatch) {
    const bodyStr = bodyMatch[1].trim();
    // Try parsing the body directly
    try {
      const pretty = JSON.stringify(JSON.parse(bodyStr), null, 2);
      return { display: pretty, copy: pretty };
    } catch { /* */ }
    // Try as Python repr
    try {
      const pretty = JSON.stringify(JSON.parse(pythonReprToJson(bodyStr)), null, 2);
      return { display: pretty, copy: pretty };
    } catch { /* */ }
    // Body is truncated/unparseable — show it raw, copy as valid JSON wrapper
    const wrapped = JSON.stringify({ raw: bodyStr }, null, 2);
    return { display: bodyStr, copy: wrapped };
  }

  // 3. Try converting Python repr → JSON
  try {
    const pretty = JSON.stringify(JSON.parse(pythonReprToJson(raw)), null, 2);
    return { display: pretty, copy: pretty };
  } catch { /* fall through */ }

  // 4. Unparseable — show raw, copy as valid JSON wrapper
  const wrapped = JSON.stringify({ raw }, null, 2);
  return { display: raw, copy: wrapped };
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
      title={`Copy ${label ?? ''}`}
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

interface ToolCallCardProps {
  tc: { function_name: string; arguments: string; result: string; timestamp: string; duration_ms: string; uniqueKey: string };
  isExpanded: boolean;
  argsFormatted: Formatted;
  resultFormatted: Formatted;
  onToggle: () => void;
}

function ToolCallCard({ tc, isExpanded, argsFormatted, resultFormatted, onToggle }: ToolCallCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header row — entire row is clickable */}
      <div
        className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <span className="inline-flex items-center px-2.5 py-1 bg-violet-100 text-violet-700 rounded-lg text-xs font-semibold font-mono shrink-0">
          {tc.function_name}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 leading-relaxed break-all line-clamp-2">
            Arguments: {tc.arguments.length > 120 ? tc.arguments.slice(0, 120) + '…' : tc.arguments}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {new Date(tc.timestamp).toLocaleString('en-IN', { hour12: true })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            {parseFloat(tc.duration_ms) > 0
              ? (parseFloat(tc.duration_ms) >= 1000
                  ? `${(parseFloat(tc.duration_ms) / 1000).toFixed(2)}s`
                  : `${tc.duration_ms}ms`)
              : 'Success'}
          </span>
          <span className="p-1 rounded text-gray-400">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Expanded full detail */}
      {isExpanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Full Arguments</p>
              <CopyButton text={argsFormatted.copy} label="arguments" />
            </div>
            <pre className="text-xs text-gray-700 font-mono bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-x-auto max-h-52 whitespace-pre-wrap break-all leading-relaxed">
              {argsFormatted.display}
            </pre>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Full Response</p>
              <CopyButton text={resultFormatted.copy} label="response" />
            </div>
            <pre className="text-xs text-gray-600 font-mono bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-x-auto max-h-52 whitespace-pre-wrap break-all leading-relaxed">
              {resultFormatted.display}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export function ToolsAudioTab({ data }: ToolsAudioTabProps) {
  const m = data.modelMetrics;
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  function toggleTool(key: string) {
    setExpandedTools((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Flatten all tool calls across all turns into a flat list with turn info
  const allToolCalls = (data.transcript ?? []).flatMap((turn) =>
    (turn.tool_calls ?? []).map((tc, i) => ({
      ...tc,
      turn_number: turn.turn_number,
      uniqueKey: `${turn.turn_number}-${i}-${tc.function_name}`,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Generated Audio / Call Recording */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-teal-500 rounded-full" />
          Generated Audio
        </h3>
        <AudioPlayer callId={data.id} />
      </section>

      {/* Model Metrics */}
      {m && (
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            Model Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <MetricCard label="Total Turns" value={m.total_turns} icon={<MessageCircle className="w-4 h-4 text-blue-600" />} color="bg-blue-50" />
            <MetricCard label="Pending Turns" value={m.pending_turns} icon={<Activity className="w-4 h-4 text-amber-600" />} color="bg-amber-50" />
            <MetricCard label="Successful API" value={m.successful_api_logs} icon={<CheckCircle className="w-4 h-4 text-emerald-600" />} color="bg-emerald-50" />
            <MetricCard label="Total Latency" value={m.total_latency.toFixed(3)} unit="s" icon={<Timer className="w-4 h-4 text-violet-600" />} color="bg-violet-50" />
            <MetricCard label="STT Duration" value={m.total_stt_duration.toFixed(2)} unit="s" icon={<Mic className="w-4 h-4 text-cyan-600" />} color="bg-cyan-50" />
            <MetricCard label="LLM Duration" value={m.total_llm_duration.toFixed(2)} unit="s" icon={<Cpu className="w-4 h-4 text-indigo-600" />} color="bg-indigo-50" />
            <MetricCard label="TTS Duration" value={m.total_tts_duration.toFixed(2)} unit="s" icon={<Volume2 className="w-4 h-4 text-teal-600" />} color="bg-teal-50" />
            <MetricCard label="Prompt Tokens" value={m.total_prompt_tokens.toLocaleString()} icon={<MessageCircle className="w-4 h-4 text-gray-600" />} color="bg-gray-50" />
            <MetricCard label="Completion Tokens" value={m.total_completion_tokens.toLocaleString()} icon={<MessageCircle className="w-4 h-4 text-gray-500" />} color="bg-gray-50" />
            <MetricCard label="TTS Characters" value={m.total_tts_characters.toLocaleString()} icon={<Clock className="w-4 h-4 text-orange-500" />} color="bg-orange-50" />
          </div>
        </section>
      )}

      {/* Tool Calls Details — flat list matching original app */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-violet-500 rounded-full" />
          Tool Calls Details
          <span className="text-xs text-gray-400 font-normal ml-1">({allToolCalls.length} calls)</span>
        </h3>

        {allToolCalls.length === 0 ? (
          <div className="py-12 text-center bg-white border border-gray-200 rounded-xl">
            <AlertCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No tool calls in this conversation</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allToolCalls.map((tc) => {
              const isExpanded = expandedTools.has(tc.uniqueKey);
              const argsFormatted = formatResponse(tc.arguments);
              const resultFormatted = formatResponse(tc.result);

              return (
                <ToolCallCard
                  key={tc.uniqueKey}
                  tc={tc}
                  isExpanded={isExpanded}
                  argsFormatted={argsFormatted}
                  resultFormatted={resultFormatted}
                  onToggle={() => toggleTool(tc.uniqueKey)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
