import type { CallDetail } from '../types';

// ── Shared helpers ────────────────────────────────────────────────────────────

function fmtDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function fmtDuration(seconds: number): string {
  const n = Math.floor(seconds || 0);
  if (n <= 0) return '—';
  if (n < 60) return `${n}s`;
  const m = Math.floor(n / 60);
  const s = n % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function fmtTimestamp(ts: string): string {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    });
  } catch {
    return ts;
  }
}

function intentKeys(data: CallDetail): string {
  const keys = Object.keys(data.intents ?? {});
  return keys.length > 0 ? keys.map((k) => k.replace(/_/g, ' ')).join(', ') : '—';
}

// ── TXT Download ──────────────────────────────────────────────────────────────

export function downloadTranscriptTxt(data: CallDetail): void {
  const lines: string[] = [];
  const divider = '='.repeat(60);
  const thin    = '-'.repeat(60);

  lines.push('INTELLICONVERSE — CALL TRANSCRIPT');
  lines.push(divider);
  lines.push(`Call ID      : ${data.id ?? '—'}`);
  lines.push(`Mobile       : ${data.metaMap?.mobile_number ?? '—'}`);
  lines.push(`Start Time   : ${fmtDateTime(data.metaMap?.start_time)}`);
  lines.push(`End Time     : ${fmtDateTime(data.metaMap?.end_time)}`);
  lines.push(`Duration     : ${fmtDuration(data.callDuration)}`);
  lines.push(`Transfer     : ${data.humanTransfer ? 'Transferred to Human' : 'Completed by AI'}`);
  lines.push(`Intent(s)    : ${intentKeys(data)}`);
  lines.push(divider);

  if (data.conversationSummary?.trim()) {
    lines.push('');
    lines.push('CONVERSATION SUMMARY');
    lines.push(thin);
    lines.push(data.conversationSummary.trim());
    lines.push('');
  }

  const turns = (data.transcript ?? []).filter(
    (t) => t.user_input?.text?.trim() || t.llm_processing?.response?.trim()
  );

  if (turns.length === 0) {
    lines.push('');
    lines.push('No transcript available for this call.');
  } else {
    lines.push('');
    lines.push('TRANSCRIPT');
    lines.push(thin);

    turns.forEach((turn, idx) => {
      if (idx > 0) lines.push('');
      const ts = fmtTimestamp(turn.timestamp);
      lines.push(`TURN ${turn.turn_number}${ts ? `  [${ts}]` : ''}`);

      if (turn.user_input?.text?.trim()) {
        lines.push(`  User  : ${turn.user_input.text.trim()}`);
      }
      if (turn.llm_processing?.response?.trim()) {
        lines.push(`  Agent : ${turn.llm_processing.response.trim()}`);
      }
    });
  }

  lines.push('');
  lines.push(divider);
  lines.push(`Generated on ${new Date().toLocaleString('en-IN', { hour12: true })}`);
  lines.push('IntelliConverse Call Logs');

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, `transcript-${data.id ?? 'call'}.txt`);
}

// ── PDF (browser print) ───────────────────────────────────────────────────────

export function printTranscriptPdf(data: CallDetail): void {
  const turns = (data.transcript ?? []).filter(
    (t) => t.user_input?.text?.trim() || t.llm_processing?.response?.trim()
  );

  const metaRows = [
    ['Call ID',     escHtml(data.id ?? '—')],
    ['Mobile',      escHtml(data.metaMap?.mobile_number ?? '—')],
    ['Start Time',  escHtml(fmtDateTime(data.metaMap?.start_time))],
    ['End Time',    escHtml(fmtDateTime(data.metaMap?.end_time))],
    ['Duration',    escHtml(fmtDuration(data.callDuration))],
    ['Transfer',    data.humanTransfer ? 'Transferred to Human' : 'Completed by AI'],
    ['Intent(s)',   escHtml(intentKeys(data))],
  ];

  const metaHtml = metaRows.map(([label, value]) => `
    <tr>
      <td class="meta-label">${label}</td>
      <td class="meta-value">${value}</td>
    </tr>`).join('');

  const summaryHtml = data.conversationSummary?.trim()
    ? `<div class="section">
        <div class="section-title">Conversation Summary</div>
        <div class="summary-box">${escHtml(data.conversationSummary.trim())}</div>
       </div>`
    : '';

  const turnsHtml = turns.length === 0
    ? `<p class="no-transcript">No transcript available for this call.</p>`
    : turns.map((turn) => {
        const ts = fmtTimestamp(turn.timestamp);
        const userText  = turn.user_input?.text?.trim();
        const agentText = turn.llm_processing?.response?.trim();

        const userBubble = userText
          ? `<div class="turn-row user-row">
               <div class="bubble user-bubble">
                 <span class="speaker-label user-label">User</span>
                 <p>${escHtml(userText)}</p>
               </div>
               <div class="avatar user-avatar">U</div>
             </div>`
          : '';

        const agentBubble = agentText
          ? `<div class="turn-row agent-row">
               <div class="avatar agent-avatar">A</div>
               <div class="bubble agent-bubble">
                 <span class="speaker-label agent-label">Agent</span>
                 <p>${escHtml(agentText)}</p>
               </div>
             </div>`
          : '';

        return `<div class="turn-block">
          <div class="turn-header">
            <span class="turn-num">Turn ${escHtml(String(turn.turn_number))}</span>
            ${ts ? `<span class="turn-ts">${escHtml(ts)}</span>` : ''}
          </div>
          ${userBubble}
          ${agentBubble}
        </div>`;
      }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Call Transcript — ${escHtml(data.id ?? 'call')}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', 'Noto Sans Devanagari', Arial, sans-serif;
    font-size: 13px;
    color: #1f2937;
    background: #fff;
    padding: 32px 40px;
    max-width: 800px;
    margin: 0 auto;
  }

  /* ── Header ── */
  .doc-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 14px;
    margin-bottom: 20px;
  }
  .brand { font-size: 18px; font-weight: 700; color: #2563eb; letter-spacing: -0.3px; }
  .brand-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .doc-badge {
    font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
    color: #fff; background: #2563eb;
    padding: 3px 10px; border-radius: 20px; text-transform: uppercase;
    white-space: nowrap; margin-top: 4px;
  }

  /* ── Meta table ── */
  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  .meta-table tr { border-bottom: 1px solid #f3f4f6; }
  .meta-table tr:last-child { border-bottom: none; }
  .meta-label {
    width: 130px; padding: 6px 8px 6px 0;
    font-size: 11px; font-weight: 600; color: #9ca3af;
    text-transform: uppercase; letter-spacing: 0.4px;
    white-space: nowrap; vertical-align: top;
  }
  .meta-value {
    padding: 6px 0; font-size: 13px; color: #111827;
    font-weight: 500; word-break: break-all;
  }

  /* ── Section ── */
  .section { margin-bottom: 22px; }
  .section-title {
    font-size: 11px; font-weight: 700; color: #374151;
    text-transform: uppercase; letter-spacing: 0.6px;
    border-left: 3px solid #2563eb; padding-left: 8px;
    margin-bottom: 12px;
  }

  /* ── Summary ── */
  .summary-box {
    background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: 8px; padding: 12px 14px;
    font-size: 13px; color: #166534; line-height: 1.6;
  }

  /* ── Turn blocks ── */
  .turn-block {
    margin-bottom: 18px;
    page-break-inside: avoid;
  }
  .turn-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 8px;
  }
  .turn-num {
    font-size: 10px; font-weight: 700; color: #9ca3af;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .turn-ts {
    font-size: 10px; color: #d1d5db;
  }

  /* ── Chat bubbles ── */
  .turn-row {
    display: flex; align-items: flex-end; gap: 8px;
    margin-bottom: 6px;
  }
  .user-row  { flex-direction: row-reverse; }
  .agent-row { flex-direction: row; }

  .avatar {
    width: 26px; height: 26px; border-radius: 50%;
    font-size: 10px; font-weight: 700; color: #fff;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .user-avatar  { background: #3b82f6; }
  .agent-avatar { background: #22c55e; }

  .bubble {
    max-width: 72%; border-radius: 14px; padding: 8px 12px;
    line-height: 1.55; word-break: break-word;
  }
  .user-bubble  {
    background: #2563eb; color: #fff;
    border-bottom-right-radius: 4px;
  }
  .agent-bubble {
    background: #f9fafb; color: #111827;
    border: 1px solid #e5e7eb;
    border-bottom-left-radius: 4px;
  }

  .speaker-label {
    display: block;
    font-size: 9px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.5px;
    margin-bottom: 3px; opacity: 0.7;
  }
  .user-label  { color: #bfdbfe; }
  .agent-label { color: #9ca3af; }

  .bubble p { font-size: 13px; }

  .no-transcript { color: #9ca3af; font-style: italic; font-size: 13px; }

  /* ── Footer ── */
  .doc-footer {
    margin-top: 28px; padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 10px; color: #9ca3af;
  }

  /* ── Print overrides ── */
  @media print {
    body { padding: 20px 28px; }
    @page { margin: 16mm 14mm; size: A4; }
    .turn-block { page-break-inside: avoid; }
    .doc-header { page-break-after: avoid; }
  }
</style>
</head>
<body>

  <div class="doc-header">
    <div>
      <div class="brand">IntelliConverse</div>
      <div class="brand-sub">Call Transcript Report</div>
    </div>
    <div class="doc-badge">Transcript</div>
  </div>

  <table class="meta-table">
    ${metaHtml}
  </table>

  ${summaryHtml}

  <div class="section">
    <div class="section-title">Transcript &nbsp;·&nbsp; ${turns.length} turn${turns.length !== 1 ? 's' : ''}</div>
    ${turnsHtml}
  </div>

  <div class="doc-footer">
    <span>Generated ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
    <span>IntelliConverse &nbsp;·&nbsp; Call Logs</span>
  </div>

</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
  if (!printWindow) {
    triggerDownload(
      new Blob([html], { type: 'text/html;charset=utf-8' }),
      `transcript-${data.id ?? 'call'}.html`
    );
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

// ── Shared util ───────────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/[/\\:*?"<>|]/g, '_');
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

function escHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
