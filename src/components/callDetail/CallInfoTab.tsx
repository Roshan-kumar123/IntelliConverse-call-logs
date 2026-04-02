import { Phone, Clock, Calendar, FileAudio, Hash, MessageSquare, Tag } from 'lucide-react';
import type { CallDetail } from '../../types';
import { TranscriptTurn } from './TranscriptTurn';

interface CallInfoTabProps {
  data: CallDetail;
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

interface InfoCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  mono?: boolean;
}

function InfoCard({ label, value, icon, mono }: InfoCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-sm font-semibold text-gray-800 break-all ${mono ? 'font-mono' : ''}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

function IntentAnalysisCard({ intentName, intentData }: { intentName: string; intentData: Record<string, unknown> }) {
  const fields = [
    { label: 'Status', value: String(intentData.status ?? intentData.STATUS ?? 'N/A') },
    { label: 'Sentiment', value: String(intentData.sentiment ?? intentData.SENTIMENT ?? 'N/A') },
    { label: 'Expected Result', value: String(intentData.expectedResult ?? intentData.expected_result ?? intentData.EXPECTED_RESULT ?? 'N/A') },
    { label: 'Actual Result', value: String(intentData.actualResult ?? intentData.actual_result ?? intentData.ACTUAL_RESULT ?? 'N/A') },
  ];

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <h4 className="text-sm font-semibold text-gray-800 mb-3">{intentName.replace(/_/g, ' ')}</h4>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{f.label}</p>
            <p className="text-sm text-gray-700">{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CallInfoTab({ data }: CallInfoTabProps) {
  const meta = data.metaMap;
  const intentKeys = Object.keys(data.intents ?? {});

  return (
    <div className="space-y-6">
      {/* Call Details Grid */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-500 rounded-full" />
          Call Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <InfoCard
            label="Mobile Number"
            value={meta?.mobile_number}
            icon={<Phone className="w-4 h-4 text-blue-500" />}
            mono
          />
          <InfoCard
            label="Start Time"
            value={formatDateTime(meta?.start_time)}
            icon={<Calendar className="w-4 h-4 text-green-500" />}
          />
          <InfoCard
            label="End Time"
            value={formatDateTime(meta?.end_time)}
            icon={<Calendar className="w-4 h-4 text-red-400" />}
          />
          <InfoCard
            label="Duration"
            value={formatDuration(data.callDuration)}
            icon={<Clock className="w-4 h-4 text-amber-500" />}
          />
          <InfoCard
            label="Room Name"
            value={meta?.room_name}
            icon={<Hash className="w-4 h-4 text-violet-500" />}
            mono
          />
          <InfoCard
            label="Audio File"
            value={meta?.audio_file_path}
            icon={<FileAudio className="w-4 h-4 text-teal-500" />}
            mono
          />
        </div>
      </section>

      {/* Conversation Summary */}
      {data.conversationSummary ? (
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
            Conversation Summary
          </h3>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">{data.conversationSummary}</p>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
            Conversation Summary
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-400 italic">No summary available.</p>
          </div>
        </section>
      )}

      {/* Transcript */}
      {data.transcript?.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-violet-500 rounded-full" />
            Transcript
            <span className="text-xs text-gray-400 font-normal ml-1">({data.transcript.length} turns)</span>
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-5">
            {data.transcript.map((turn, idx) => (
              <div key={turn.speech_id || idx}>
                {idx > 0 && <div className="border-t border-gray-200 mb-5" />}
                <TranscriptTurn turn={turn} />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="py-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No transcript available for this call</p>
        </div>
      )}

      {/* Intent Analysis */}
      {intentKeys.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-orange-500 rounded-full" />
            Intent Analysis
          </h3>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Intent Insights
            </h4>
            {intentKeys.map((key) => (
              <IntentAnalysisCard
                key={key}
                intentName={key}
                intentData={
                  Array.isArray(data.intents[key])
                    ? {}
                    : (data.intents[key] as Record<string, unknown>) ?? {}
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
