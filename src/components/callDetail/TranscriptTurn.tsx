import { useState } from 'react';
import { ChevronDown, ChevronUp, Wrench, Zap } from 'lucide-react';
import type { Turn } from '../../types';

function pythonReprToJson(raw: string): string {
  let s = raw.trim();
  s = s.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');
  let result = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "'") {
      result += '"';
      i++;
      while (i < s.length) {
        const c = s[i];
        if (c === '\\' && i + 1 < s.length) { result += s[i] + s[i + 1]; i += 2; }
        else if (c === '"') { result += '\\"'; i++; }
        else if (c === "'") { result += '"'; i++; break; }
        else { result += c; i++; }
      }
    } else { result += ch; i++; }
  }
  return result;
}

interface Formatted { display: string; copy: string; }

function formatResponse(raw: string): Formatted {
  if (!raw) return { display: raw, copy: raw };
  try {
    const pretty = JSON.stringify(JSON.parse(raw), null, 2);
    return { display: pretty, copy: pretty };
  } catch { /* */ }
  const bodyMatch = raw.match(/^status=\d+\s+body=(.+)$/s);
  if (bodyMatch) {
    const bodyStr = bodyMatch[1].trim();
    try { const p = JSON.stringify(JSON.parse(bodyStr), null, 2); return { display: p, copy: p }; } catch { /* */ }
    try { const p = JSON.stringify(JSON.parse(pythonReprToJson(bodyStr)), null, 2); return { display: p, copy: p }; } catch { /* */ }
    return { display: bodyStr, copy: JSON.stringify({ raw: bodyStr }, null, 2) };
  }
  try {
    const pretty = JSON.stringify(JSON.parse(pythonReprToJson(raw)), null, 2);
    return { display: pretty, copy: pretty };
  } catch { /* */ }
  return { display: raw, copy: JSON.stringify({ raw }, null, 2) };
}

interface TranscriptTurnProps {
  turn: Turn;
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return ts;
  }
}

function ToolCallInline({ tc }: { tc: Turn['tool_calls'][number] }) {
  const [expanded, setExpanded] = useState(false);
  const args = formatResponse(tc.arguments);
  const result = formatResponse(tc.result);

  return (
    <div className="border border-violet-100 rounded-lg overflow-hidden text-xs mt-1.5">
      <div
        className="flex items-center justify-between px-3 py-1.5 bg-violet-50 cursor-pointer hover:bg-violet-100 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2">
          <Wrench className="w-3 h-3 text-violet-500" />
          <span className="font-semibold text-violet-700 font-mono">{tc.function_name}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">{tc.duration_ms}ms</span>
        </div>
        {expanded ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
      </div>
      {expanded && (
        <div className="divide-y divide-gray-100 bg-white">
          <div className="px-3 py-2">
            <p className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] mb-1">Arguments</p>
            <pre className="text-gray-700 whitespace-pre-wrap break-all font-mono leading-relaxed overflow-x-auto max-h-48">{args.display}</pre>
          </div>
          <div className="px-3 py-2">
            <p className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] mb-1">Result</p>
            <pre className="text-gray-600 whitespace-pre-wrap break-all font-mono leading-relaxed max-h-32 overflow-y-auto">
              {result.display}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export function TranscriptTurn({ turn }: TranscriptTurnProps) {
  const hasUserText = turn.user_input?.text?.trim();
  const agentText = turn.llm_processing?.response;
  const latency = parseFloat(turn.performance?.total_latency || '0');

  return (
    <div className="space-y-2">
      {/* Turn header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Turn {turn.turn_number}
        </span>
        <div className="flex items-center gap-3">
          {latency > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <Zap className="w-3 h-3" />
              {latency.toFixed(3)}s latency
            </span>
          )}
          <span className="text-xs text-gray-400">{formatTimestamp(turn.timestamp)}</span>
        </div>
      </div>

      {/* User bubble — shown first (what the user said that triggered this turn) */}
      {hasUserText && (
        <div className="flex items-end gap-2 flex-row-reverse">
          <div className="w-7 h-7 rounded-full bg-gray-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            U
          </div>
          <div className="bg-blue-600 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-xl">
            <p className="text-sm text-white leading-relaxed">{turn.user_input.text}</p>
          </div>
        </div>
      )}

      {/* Agent bubble — the bot's response */}
      {agentText && (
        <div className="flex items-end gap-2">
          <div className="w-7 h-7 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            A
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-xl shadow-sm">
            <p className="text-sm text-gray-800 leading-relaxed">{agentText}</p>
          </div>
        </div>
      )}

      {/* Tool calls inline under agent response */}
      {turn.tool_calls?.length > 0 && (
        <div className="ml-9">
          {turn.tool_calls.map((tc, i) => (
            <ToolCallInline key={i} tc={tc} />
          ))}
        </div>
      )}
    </div>
  );
}
