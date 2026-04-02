export interface MetaMap {
  audio_file_path: string;
  room_name: string;
  start_time: string;
  end_time: string;
  job_id: string;
  pid: string;
  mobile_number: string;
  timestamp: string;
}

export interface CallLog {
  id: string;
  createdDate: string;
  updatedDate: string;
  auditCategory: string;
  metaMap: MetaMap;
  createdBy: string;
  updatedBy: string | null;
  description: string;
  message: string;
  entity: string;
  sentBy: string;
  orgId: string;
  eventType: string;
  callDuration: number;
  intents: Record<string, unknown[]>;
  humanTransfer: boolean;
  resolution: string | null;
  overallSentiment: string | null;
  conversationSummary: string;
  transferReason: string | null;
}

export interface CallLogsResponse {
  content: CallLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface UserInput {
  text: string;
  stt_duration: string;
  stt_audio_duration: string;
  stt_transcription: string;
}

export interface LlmProcessing {
  response: string;
  ttft: string;
  duration: string;
  prompt_tokens: string;
  completion_tokens: string;
  prompt_cached_tokens: string;
  total_tokens: string;
  tokens_per_second: string;
}

export interface TtsOutput {
  synthesized_text: string;
  ttfb: string;
  duration: string;
  audio_duration: string;
  characters_count: string;
}

export interface ToolCall {
  function_name: string;
  arguments: string;
  result: string;
  timestamp: string;
  duration_ms: string;
}

export interface Performance {
  total_latency: string;
  turn_duration: string | null;
}

export interface Turn {
  turn_number: string;
  speech_id: string;
  timestamp: string;
  user_input: UserInput;
  llm_processing: LlmProcessing;
  tts_output: TtsOutput;
  eou_metrics: unknown | null;
  performance: Performance;
  tool: unknown | null;
  tool_calls: ToolCall[];
}

export interface ModelMetrics {
  total_turns: number;
  pending_turns: number;
  successful_api_logs: number;
  total_stt_duration: number;
  total_llm_duration: number;
  total_tts_duration: number;
  total_latency: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tts_characters: number;
}

export interface CallDetail extends CallLog {
  modelMetrics: ModelMetrics;
  transcript: Turn[];
  status: string | null;
}

export interface CallLogsParams {
  pageNumber: number;
  pageSize: number;
  category: string;
  intents: string;
  alfursanId: string;
  mobileNumber: string;
  isMobile: boolean;
}
